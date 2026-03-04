from fastapi import FastAPI, Request, Form  # type: ignore
from fastapi.responses import HTMLResponse, JSONResponse  # type: ignore
from fastapi.templating import Jinja2Templates  # type: ignore
import os
import secrets
from typing import Optional

from state import get_session_state, update_session_state  # type: ignore
from activity_logger import log_activity  # type: ignore
from detectors import calculate_risk_score, users_db  # type: ignore
from classifier import classify_attacker  # type: ignore

app = FastAPI(title="ShadowMind - Behavioral Insider Threat Detection")

# Setup templates directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

def process_request_activity(session_id: str, endpoint: str, username: Optional[str] = None):
    """Log activity and enforce behavioral rules for each request."""
    state = get_session_state(session_id)
    current_user = state.get("username", username or "unknown")
    
    # Log the activity
    log_activity(state, endpoint)
    
    # Calculate new risk score
    new_risk, risk_reasons = calculate_risk_score(current_user, state)
    
    # Classify attacker
    attacker_type, behavior_deviation = classify_attacker(new_risk, state)
    
    # Update state (this also triggers the REAL/SHADOW environment logic via state.py)
    update_session_state(session_id, {
        "risk_score": new_risk,
        "risk_reasons": risk_reasons,
        "attacker_type": attacker_type,
        "behavior_deviation": behavior_deviation
    })

def get_session_id(request: Request) -> str:
    """Retrieve session ID from cookies or return default."""
    session_id = request.cookies.get("session_id")
    return session_id or "default_session"

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_view(request: Request):
    return templates.TemplateResponse("control.html", {"request": request})

@app.post("/login")
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    session_id = request.cookies.get("session_id", secrets.token_hex(16))
    state = get_session_state(session_id)
    
    if "username" not in state:
        state["username"] = username
        
    login_success = False
    if username in users_db and users_db[username]["password"] == password:
        login_success = True
        
    log_activity(state, "/login", is_login_attempt=True, login_success=login_success)
    
    new_risk, risk_reasons = calculate_risk_score(username, state)
    attacker_type, behavior_deviation = classify_attacker(new_risk, state)
    
    update_session_state(session_id, {
        "risk_score": new_risk,
        "risk_reasons": risk_reasons,
        "attacker_type": attacker_type,
        "behavior_deviation": behavior_deviation,
        "username": username
    })
    
    response = JSONResponse(content={
        "status": "success" if login_success else "failed",
        "risk_score": state["risk_score"],
        "risk_reasons": risk_reasons,
        "attacker_type": state["attacker_type"],
        "behavior_deviation": state.get("behavior_deviation", "Low")
    })
    
    # Maintain session context using a cookie
    response.set_cookie(key="session_id", value=session_id)
    return response

@app.get("/admin", response_class=HTMLResponse)
async def admin_panel(request: Request):
    session_id = get_session_id(request)
    process_request_activity(session_id, "/admin")
    state = get_session_state(session_id)
    
    # Routing Logic:
    if state["mode"] == "SHADOW":
        return templates.TemplateResponse("admin_shadow.html", {"request": request, "state": state})
    else:
        return templates.TemplateResponse("admin_real.html", {"request": request})

@app.get("/database")
async def database_access(request: Request):
    session_id = get_session_id(request)
    process_request_activity(session_id, "/database")
    state = get_session_state(session_id)
    
    if state["mode"] == "SHADOW":
        return {"status": "success", "data": [{"id": 1, "name": "Fake Admin", "salary": 150000}], "message": "Shadow DB"}
    else:
        return {"status": "success", "data": [{"id": 1, "name": "Real Admin", "role": "CEO"}]}

@app.get("/config")
async def config_access(request: Request):
    session_id = get_session_id(request)
    process_request_activity(session_id, "/config")
    state = get_session_state(session_id)
    
    if state["mode"] == "SHADOW":
        return {"aws_access_key": "AKIAIOSFODNN7EXAMPLE", "db_password": "fake_password_123_honeytoken"}
    else:
        return {"system_version": "1.0.0", "maintenance_mode": False}

@app.get("/system-status")
async def system_status(request: Request, session_id: Optional[str] = None):
    sid = session_id or get_session_id(request)
    state = get_session_state(sid)
    
    return {
        "mode": state.get("mode", "REAL"),
        "risk_score": state.get("risk_score", 0),
        "attacker_type": state.get("attacker_type", "Normal User"),
        "immunity_level": state.get("immunity_level", 0)
    }

@app.get("/dashboard-data")
async def dashboard_data(request: Request, session_id: Optional[str] = None):
    sid = session_id or get_session_id(request)
    state = get_session_state(sid)
    
    return {
        "session_logs": state.get("logs", []),
        "risk_score": state.get("risk_score", 0),
        "risk_reasons": state.get("risk_reasons", []),
        "behavior_analysis": state.get("behavior_deviation", "Low"),
        "system_state": state.get("mode", "REAL"),
        "attacker_type": state.get("attacker_type", "Normal User")
    }
