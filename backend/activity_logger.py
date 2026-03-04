from datetime import datetime
from typing import Dict, Any

def log_activity(session_state: Dict[str, Any], endpoint: str, is_login_attempt: bool = False, login_success: bool = False):
    """
    Track metrics: login attempts, request intervals, accessed endpoints, session duration.
    Updates the session_state in place.
    """
    now = datetime.now()
    
    if "start_time" not in session_state:
        session_state["start_time"] = now.isoformat()
        
    # Track endpoints
    if "accessed_endpoints" not in session_state:
        session_state["accessed_endpoints"] = {}
    session_state["accessed_endpoints"][endpoint] = session_state["accessed_endpoints"].get(endpoint, 0) + 1
    
    # Track login attempts
    if is_login_attempt:
        if "login_attempts" not in session_state:
            session_state["login_attempts"] = 0
        if not login_success:
            session_state["login_attempts"] += 1
            
    # Track request intervals (ignore immediate first request since no interval exists yet)
    if "last_request_time" in session_state:
        last_time = datetime.fromisoformat(session_state["last_request_time"])
        interval = (now - last_time).total_seconds()
        
        # Update running average
        if "avg_request_interval" not in session_state:
            session_state["avg_request_interval"] = interval
        else:
            # Simple moving average alpha=0.3
            session_state["avg_request_interval"] = (0.7 * session_state["avg_request_interval"]) + (0.3 * interval)
            
    session_state["last_request_time"] = now.isoformat()
    
    # Session duration
    start = datetime.fromisoformat(session_state["start_time"])
    session_state["session_duration_seconds"] = (now - start).total_seconds()
    
    # Append to logs for dashboard visualization
    log_entry = {
        "timestamp": now.isoformat(),
        "endpoint": endpoint,
        "type": "login_attempt" if is_login_attempt else "access",
        "status": "success" if login_success else "regular"
    }
    if not is_login_attempt:
        log_entry["status"] = "accessed"
    elif not login_success:
        log_entry["status"] = "failed"
        
    session_state.setdefault("logs", []).append(log_entry)
