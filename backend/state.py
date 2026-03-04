from typing import Dict, Any

# In-memory store for client sessions (using session_id as key)
# Structure: { session_id: { "mode": "REAL", "risk_score": 0, "immunity_level": 0, "attacker_type": "Normal User" } }
client_states: Dict[str, Dict[str, Any]] = {}

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
            "analysis": []
        }
    return client_states[session_id]

def update_session_state(session_id: str, updates: Dict[str, Any]):
    """Update session state and enforce environment logic based on risk score."""
    state = get_session_state(session_id)
    state.update(updates)
    
    # Environment Logic Priority Rules
    # Once SHADOW mode is engaged, we never revert back to REAL for this session
    if state.get("mode") == "SHADOW" or state["risk_score"] >= 50:
        state["mode"] = "SHADOW"
    else:
        state["mode"] = "REAL"
