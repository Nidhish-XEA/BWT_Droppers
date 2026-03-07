from fastapi import FastAPI, Request, Form, WebSocket, WebSocketDisconnect  # type: ignore
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from fastapi.templating import Jinja2Templates  # type: ignore
from fastapi.staticfiles import StaticFiles  # type: ignore
import os
import secrets
import asyncio
import random
from typing import Optional, List
from datetime import datetime

# Load .env if present (local dev)
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except ImportError:
    pass

from state import (  # type: ignore
    get_session_state,
    update_session_state,
    add_threat_event,
    add_deception_trap_hit,
    get_global_security_score,
    seed_simulated_data,
    threat_timeline,
    deception_trap_log,
    monitored_users,
)
from activity_logger import log_activity  # type: ignore
from detectors import calculate_risk_score, users_db, is_deception_trap  # type: ignore
from classifier import classify_attacker, generate_ai_explanation  # type: ignore

app = FastAPI(title="ShadowMind — AI Security Intelligence Platform")

# CORS for Next.js frontend — reads from env var in production
_raw_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000"
)
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend")

# Try mounting legacy static files if they exist
legacy_cc = os.path.join(FRONTEND_DIR, "control_center")
if os.path.isdir(legacy_cc):
    app.mount("/static", StaticFiles(directory=legacy_cc), name="static")

# Seed data on startup
seed_simulated_data()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        dead = []
        for conn in self.active_connections:
            try:
                await conn.send_json(data)
            except Exception:
                dead.append(conn)
        for d in dead:
            self.active_connections.remove(d)

manager = ConnectionManager()


# ─── Helpers ────────────────────────────────────────────────────────────────

def process_request_activity(session_id: str, endpoint: str, username: Optional[str] = None):
    """Log activity, detect deception trap hits, and recalculate risk."""
    state = get_session_state(session_id)
    current_user = state.get("username", username or "unknown")

    log_activity(state, endpoint)
    state["total_requests"] = state.get("total_requests", 0) + 1
    state["api_calls_this_hour"] = state.get("api_calls_this_hour", 0) + 1

    # Track endpoint hits
    ep_map = state.setdefault("accessed_endpoints", {})
    ep_map[endpoint] = ep_map.get(endpoint, 0) + 1

    # Deception trap check
    if is_deception_trap(endpoint):
        state["deception_trap_hit"] = True
        add_deception_trap_hit(endpoint, current_user, f"Decoy endpoint {endpoint} accessed")

    new_risk, risk_reasons = calculate_risk_score(current_user, state)
    attacker_type, behavior_deviation = classify_attacker(new_risk, state)

    if new_risk > state.get("risk_score", 0):
        state["suspicious_requests"] = state.get("suspicious_requests", 0) + 1
        add_threat_event(
            "RISK_ESCALATION",
            f"Risk score for {current_user} escalated to {new_risk}",
            "HIGH" if new_risk >= 50 else "WARN",
            current_user,
        )

    ai_explanation = generate_ai_explanation(current_user, new_risk, state, risk_reasons)

    update_session_state(session_id, {
        "risk_score": new_risk,
        "risk_reasons": risk_reasons,
        "attacker_type": attacker_type,
        "behavior_deviation": behavior_deviation,
        "ai_explanation": ai_explanation,
    })


def get_session_id(request: Request) -> str:
    return request.cookies.get("session_id") or "default_session"


# ─── WebSocket ───────────────────────────────────────────────────────────────

@app.websocket("/ws/threats")
async def websocket_threats(websocket: WebSocket):
    """Real-time threat event stream."""
    await manager.connect(websocket)
    last_sent = len(threat_timeline)
    try:
        while True:
            await asyncio.sleep(2)
            # Send any new threat events
            new_events = threat_timeline[last_sent:]
            if new_events:
                await websocket.send_json({"type": "new_events", "events": new_events})
                last_sent = len(threat_timeline)
            # Send live security score
            await websocket.send_json({
                "type": "security_score",
                "score": get_global_security_score(),
                "active_threats": sum(1 for u in monitored_users.values() if u["risk_score"] >= 50),
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ─── API Routes ──────────────────────────────────────────────────────────────

@app.get("/api/dashboard-data")
async def dashboard_data(request: Request, session_id: Optional[str] = None):
    """Full dashboard data payload."""
    sid = session_id or get_session_id(request)
    state = get_session_state(sid)

    return {
        "security_score": get_global_security_score(),
        "session_logs": state.get("logs", []),
        "risk_score": state.get("risk_score", 0),
        "risk_reasons": state.get("risk_reasons", []),
        "behavior_analysis": state.get("behavior_deviation", "Low"),
        "system_state": state.get("mode", "REAL"),
        "attacker_type": state.get("attacker_type", "Normal User"),
        "total_requests": state.get("total_requests", 0),
        "suspicious_requests": state.get("suspicious_requests", 0),
        "ai_explanation": state.get("ai_explanation", "No anomalies detected."),
        "threat_timeline": threat_timeline[-20:],
        "deception_traps": deception_trap_log[-10:],
        "active_threats": sum(1 for u in monitored_users.values() if u["risk_score"] >= 50),
        "monitored_users_count": len(monitored_users),
    }


@app.get("/api/users")
async def get_users():
    """List all monitored users with risk levels."""
    users_list = []
    for username, data in monitored_users.items():
        users_list.append({
            "username": username,
            "risk_score": data["risk_score"],
            "status": data["status"],
            "role": data["role"],
            "department": data["department"],
            "api_calls": data["api_calls"],
            "last_seen": data["last_seen"],
        })
    # Sort by risk score descending
    users_list.sort(key=lambda x: x["risk_score"], reverse=True)
    return {"users": users_list, "total": len(users_list)}


@app.get("/api/threats")
async def get_threats():
    """Recent threat event timeline."""
    return {
        "events": list(reversed(threat_timeline[-30:])),
        "total": len(threat_timeline),
        "deception_traps": list(reversed(deception_trap_log[-10:])),
    }


@app.get("/api/report/{username}")
async def get_report(username: str, request: Request):
    """Detailed security report for a user."""
    sid = get_session_id(request)
    state = get_session_state(sid)

    # Use monitored user data if available
    user_data = monitored_users.get(username, {})
    risk_score = user_data.get("risk_score", state.get("risk_score", 0))
    status = user_data.get("status", "Unknown")

    # Generate AI explanation
    explanation = generate_ai_explanation(
        username, risk_score, {
            "api_calls_this_hour": user_data.get("api_calls", 0),
            "login_attempts": 0,
            "download_mb": 0,
            "attacker_type": status,
            "behavior_deviation": "High" if risk_score >= 50 else "Low",
        }, []
    )

    # Collect user-related threat events
    user_events = [e for e in threat_timeline if e.get("user") == username]

    # Recommended actions
    actions = []
    if risk_score >= 80:
        actions = [
            "Immediately revoke user credentials and terminate active sessions",
            "Escalate to incident response team",
            "Preserve forensic evidence (logs, network captures)",
            "Notify CISO and legal team",
        ]
    elif risk_score >= 50:
        actions = [
            "Increase monitoring frequency for this user",
            "Request manager verification of recent activity",
            "Review access permissions and apply least-privilege",
            "Schedule security awareness interview",
        ]
    else:
        actions = [
            "Continue standard monitoring protocols",
            "Review quarterly access audit",
        ]

    return {
        "username": username,
        "risk_score": risk_score,
        "status": status,
        "ai_explanation": explanation,
        "event_timeline": user_events,
        "recommended_actions": actions,
        "role": user_data.get("role", "Unknown"),
        "department": user_data.get("department", "Unknown"),
    }


@app.get("/api/intelligence")
async def get_intelligence():
    """Threat intelligence analytics data."""
    # Anomaly frequency per hour (simulated)
    hours = list(range(9, 13))
    anomaly_data = [
        {"hour": f"{h:02d}:00", "count": random.randint(2, 15)} for h in hours
    ]
    anomaly_data[2]["count"] = 28  # spike at 10:00

    # Behavioral deviation by user
    deviation_data = [
        {"user": u, "score": d["risk_score"]}
        for u, d in monitored_users.items()
    ]

    return {
        "anomaly_timeline": anomaly_data,
        "deviation_by_user": deviation_data,
        "total_events": len(threat_timeline),
        "critical_count": sum(1 for e in threat_timeline if e.get("severity") == "CRITICAL"),
        "high_count": sum(1 for e in threat_timeline if e.get("severity") == "HIGH"),
        "warn_count": sum(1 for e in threat_timeline if e.get("severity") == "WARN"),
    }


@app.get("/api/system-status")
async def system_status(request: Request, session_id: Optional[str] = None):
    sid = session_id or get_session_id(request)
    state = get_session_state(sid)
    return {
        "mode": state.get("mode", "REAL"),
        "risk_score": state.get("risk_score", 0),
        "attacker_type": state.get("attacker_type", "Normal User"),
        "immunity_level": state.get("immunity_level", 0),
        "security_score": get_global_security_score(),
    }


# ─── Auth Routes ──────────────────────────────────────────────────────────────

@app.post("/api/login")
async def login(request: Request):
    body = await request.json()
    username = body.get("username", "")
    password = body.get("password", "")

    session_id = request.cookies.get("session_id", secrets.token_hex(16))
    state = get_session_state(session_id)

    if "username" not in state:
        state["username"] = username

    login_success = username in users_db and users_db[username]["password"] == password

    state["login_attempts"] = state.get("login_attempts", 0) + 1
    log_activity(state, "/login", is_login_attempt=True, login_success=login_success)

    if not login_success:
        add_threat_event(
            "LOGIN_FAILED",
            f"Failed login attempt for user '{username}'",
            "WARN",
            username,
        )

    new_risk, risk_reasons = calculate_risk_score(username, state)
    attacker_type, behavior_deviation = classify_attacker(new_risk, state)
    ai_explanation = generate_ai_explanation(username, new_risk, state, risk_reasons)

    update_session_state(session_id, {
        "risk_score": new_risk,
        "risk_reasons": risk_reasons,
        "attacker_type": attacker_type,
        "behavior_deviation": behavior_deviation,
        "ai_explanation": ai_explanation,
        "username": username,
    })

    response = JSONResponse(content={
        "status": "success" if login_success else "failed",
        "risk_score": new_risk,
        "risk_reasons": risk_reasons,
        "attacker_type": attacker_type,
        "behavior_deviation": behavior_deviation,
        "session_id": session_id,
    })
    response.set_cookie(key="session_id", value=session_id)
    return response


@app.post("/api/logout")
async def logout():
    response = JSONResponse(content={"status": "logged out"})
    response.delete_cookie("session_id")
    return response


# ─── Legacy HTML Routes (kept for backward compat) ──────────────────────────

@app.get("/", response_class=HTMLResponse)
async def home():
    return HTMLResponse("<html><body><h1>ShadowMind API</h1><p>Frontend runs on port 3000</p></body></html>")


@app.get("/system-status")
async def legacy_system_status(request: Request, session_id: Optional[str] = None):
    return await system_status(request, session_id)


@app.get("/dashboard-data")
async def legacy_dashboard_data(request: Request, session_id: Optional[str] = None):
    return await dashboard_data(request, session_id)


# ─── Simulation endpoint (for demo / testing) ────────────────────────────────

@app.post("/api/simulate/{event_type}")
async def simulate_event(event_type: str):
    """Trigger a simulated threat event for demo purposes."""
    events = {
        "api_burst": ("API_BURST", "Simulated API burst: dev_142 hit 300 calls/hr", "HIGH", "dev_142"),
        "login_fail": ("LOGIN_FAILED", "Multiple failed logins from unknown source", "WARN", "unknown"),
        "trap": ("DECEPTION_TRAP", "Honeypot endpoint /admin/keys accessed", "CRITICAL", "admin42"),
        "file": ("FILE_ACCESS", "Bulk file download detected (4.2 GB)", "HIGH", "bob"),
    }
    if event_type not in events:
        return {"error": "Unknown event type"}

    etype, desc, sev, user = events[event_type]
    event = add_threat_event(etype, desc, sev, user)
    await manager.broadcast({"type": "new_events", "events": [event]})
    return {"status": "simulated", "event": event}
