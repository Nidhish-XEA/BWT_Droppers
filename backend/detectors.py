import json
import os
from typing import Dict, Any, Tuple, List

# Load baseline behavior
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(BASE_DIR, "users.json")

try:
    with open(USERS_FILE, "r") as f:
        users_db = json.load(f)
except FileNotFoundError:
    users_db = {}


def calculate_risk_score(username: str, session_data: Dict[str, Any]) -> Tuple[int, List[str]]:
    """
    Calculate the risk score based on deviation from normal behavior.
    Risk score range: 0-100.
    Returns: (score, list of reasons)
    """
    reasons = []
    if username not in users_db:
        # Default moderate-to-high risk for an entirely unknown user attempting logins
        return 50, ["Unknown user baseline"]

    baseline = users_db[username]["signature"]
    current_score = session_data.get("risk_score", 0)
    
    # We don't want to double penalize if we've already added the score,
    # so what we can do is recalculate the deviations dynamically from base 0 and simply set it.
    # We will recalculate a fresh risk score based on the current session state.
    calculated_score: int = 0
    
    # Calculate login attempt deviations
    # +20 if login attempts exceed normal behavior
    login_attempts = session_data.get("login_attempts", 0)
    if login_attempts > baseline.get("max_login_attempts", 2):
        calculated_score = calculated_score + 20  # type: ignore
        reasons.append("+20 Excess login attempts")
        
    # Calculate request frequency deviations
    # +30 if request frequency is extremely high (e.g. less than half the average normal interval)
    request_interval = session_data.get("avg_request_interval", None)
    if request_interval is not None:
        if request_interval < (baseline.get("avg_request_interval", 2) * 0.5):
            calculated_score = calculated_score + 30  # type: ignore
            reasons.append("+30 High request frequency")
            
    # Check sensitive endpoint access repeatedly
    # +30 if sensitive endpoints are accessed repeatedly
    sensitive_routes = ["/database", "/config"]
    accessed_endpoints = session_data.get("accessed_endpoints", {})
    
    for route in sensitive_routes:
        # Repeated access (more than 1 or 2) into sensitive bounds triggers flag
        if accessed_endpoints.get(route, 0) >= 2:
            calculated_score = calculated_score + 30  # type: ignore
            reasons.append("+30 Sensitive endpoint probing")
            break  # Apply once for sensitive endpoints
            
    # Cap score at 100 and ensure it never decreases
    final_score = max(current_score, calculated_score)
    return min(100, final_score), reasons
