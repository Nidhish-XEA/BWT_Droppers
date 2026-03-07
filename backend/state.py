from typing import Dict, Any, List
from datetime import datetime
import random

# In-memory store for client sessions
client_states: Dict[str, Dict[str, Any]] = {}

# Global threat event timeline (shared across all sessions)
threat_timeline: List[Dict[str, Any]] = []

# Deception trap log
deception_trap_log: List[Dict[str, Any]] = []

# Simulated monitored users with risk data (populated at startup)
monitored_users: Dict[str, Dict[str, Any]] = {}


def get_timestamp() -> str:
    return datetime.now().strftime("%H:%M:%S")


def get_full_timestamp() -> str:
    return datetime.now().isoformat()


def get_session_state(session_id: str) -> Dict[str, Any]:
    """Retrieve session state or initialize default if it doesn't exist."""
    if session_id not in client_states:
        client_states[session_id] = {
            "mode": "REAL",
            "risk_score": 0,
            "immunity_level": 0,
            "attacker_type": "Normal User",
            "total_requests": 0,
            "suspicious_requests": 0,
            "logs": [],
            "analysis": [],
            "api_calls_this_hour": 0,
            "download_mb": 0,
            "login_attempts": 0,
            "accessed_endpoints": {},
            "avg_request_interval": None,
            "last_request_time": None,
        }
    return client_states[session_id]


def update_session_state(session_id: str, updates: Dict[str, Any]):
    """Update session state and enforce environment logic based on risk score."""
    state = get_session_state(session_id)
    state.update(updates)

    # Once SHADOW mode is engaged, never revert
    if state.get("mode") == "SHADOW" or state["risk_score"] >= 50:
        state["mode"] = "SHADOW"
    else:
        state["mode"] = "REAL"


def add_threat_event(event_type: str, description: str, severity: str, user: str = "system"):
    """Add a threat event to the global timeline."""
    event = {
        "id": len(threat_timeline) + 1,
        "timestamp": get_timestamp(),
        "full_timestamp": get_full_timestamp(),
        "event_type": event_type,
        "description": description,
        "severity": severity,  # INFO | WARN | HIGH | CRITICAL
        "user": user,
    }
    threat_timeline.append(event)
    # Keep last 100 events
    if len(threat_timeline) > 100:
        threat_timeline.pop(0)
    return event


def add_deception_trap_hit(trap_name: str, triggered_by: str, details: str):
    """Log a deception trap activation."""
    entry = {
        "id": len(deception_trap_log) + 1,
        "timestamp": get_timestamp(),
        "full_timestamp": get_full_timestamp(),
        "trap_name": trap_name,
        "triggered_by": triggered_by,
        "details": details,
        "alert_level": "CRITICAL",
    }
    deception_trap_log.append(entry)
    # Also add to threat timeline
    add_threat_event(
        "DECEPTION_TRAP",
        f"Deception trap '{trap_name}' triggered by {triggered_by}",
        "CRITICAL",
        triggered_by,
    )
    return entry


def get_global_security_score() -> float:
    """Calculate platform-wide security score (0-10, higher = safer)."""
    if not client_states:
        return 9.2
    scores = [s.get("risk_score", 0) for s in client_states.values()]
    avg_risk = sum(scores) / len(scores) if scores else 0
    # Invert: risk 0 → score 10, risk 100 → score 0
    return round(max(0, 10 - (avg_risk / 10)), 1)


def seed_simulated_data():
    """Seed realistic simulated threat data for demo purposes."""
    global monitored_users, threat_timeline, deception_trap_log

    monitored_users = {
        "alice": {"risk_score": 12, "status": "Normal", "role": "engineer", "department": "DevOps", "api_calls": 23, "last_seen": "2 min ago"},
        "bob": {"risk_score": 67, "status": "Suspicious", "role": "analyst", "department": "Finance", "api_calls": 189, "last_seen": "5 min ago"},
        "admin42": {"risk_score": 91, "status": "High Risk", "role": "admin", "department": "IT Security", "api_calls": 310, "last_seen": "1 min ago"},
        "dev_142": {"risk_score": 78, "status": "High Risk", "role": "developer", "department": "Engineering", "api_calls": 210, "last_seen": "3 min ago"},
        "carol": {"risk_score": 5, "status": "Normal", "role": "manager", "department": "HR", "api_calls": 7, "last_seen": "12 min ago"},
        "svc_bot": {"risk_score": 35, "status": "Moderate", "role": "service", "department": "Automation", "api_calls": 180, "last_seen": "30 sec ago"},
    }

    # Seed threat timeline
    seed_events = [
        ("LOGIN_ANOMALY", "Abnormal login time detected for admin42", "HIGH", "admin42"),
        ("API_BURST", "dev_142 exceeded API call threshold: 210/hr vs baseline 20/hr", "HIGH", "dev_142"),
        ("DECEPTION_TRAP", "Decoy endpoint /admin/credentials accessed by admin42", "CRITICAL", "admin42"),
        ("FILE_ACCESS", "Unusual bulk file download detected for bob (2.1 GB)", "WARN", "bob"),
        ("DB_PROBE", "Repeated database schema enumeration by bob", "HIGH", "bob"),
        ("LOGIN_ANOMALY", "Multiple failed login attempts from unknown IP", "WARN", "unknown"),
        ("API_BURST", "Automated API pattern detected from svc_bot (900 req/5min)", "WARN", "svc_bot"),
    ]

    times = ["09:58", "10:02", "10:04", "10:06", "10:07", "10:09", "10:11"]
    for i, (etype, desc, sev, user) in enumerate(seed_events):
        threat_timeline.append({
            "id": i + 1,
            "timestamp": times[i],
            "full_timestamp": f"2026-03-07T{times[i]}:00",
            "event_type": etype,
            "description": desc,
            "severity": sev,
            "user": user,
        })

    # Seed deception trap log
    deception_trap_log.append({
        "id": 1,
        "timestamp": "10:04",
        "full_timestamp": "2026-03-07T10:04:00",
        "trap_name": "/admin/credentials",
        "triggered_by": "admin42",
        "details": "Decoy credential file accessed. Source IP: 192.168.1.44",
        "alert_level": "CRITICAL",
    })
    deception_trap_log.append({
        "id": 2,
        "timestamp": "10:09",
        "full_timestamp": "2026-03-07T10:09:00",
        "trap_name": "decoy_table: shadow_users",
        "triggered_by": "bob",
        "details": "SELECT * executed on honeypot database table",
        "alert_level": "CRITICAL",
    })
