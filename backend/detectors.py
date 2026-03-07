import json
import os
from typing import Dict, Any, Tuple, List
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(BASE_DIR, "users.json")

try:
    with open(USERS_FILE, "r") as f:
        users_db = json.load(f)
except FileNotFoundError:
    users_db = {}

# Deception trap endpoints
DECEPTION_TRAPS = ["/admin/credentials", "/admin/keys", "/api/shadow-config", "/backup/db"]


def calculate_risk_score(username: str, session_data: Dict[str, Any]) -> Tuple[int, List[str]]:
    """
    Calculate behavioral risk score based on deviation from user baseline.
    Risk score range: 0-100. Score never decreases (ratchet mechanism).
    Returns: (score, list of reasons)
    """
    reasons = []
    current_score = session_data.get("risk_score", 0)

    if username not in users_db:
        return max(current_score, 50), ["Unknown user — no baseline available"]

    baseline = users_db[username]["signature"]
    calculated_score: int = 0

    # --- Signal 1: Login attempt excess ---
    login_attempts = session_data.get("login_attempts", 0)
    max_logins = baseline.get("max_login_attempts", 2)
    if login_attempts > max_logins:
        calculated_score += 20
        reasons.append(f"+20 Excess login attempts ({login_attempts} vs baseline {max_logins})")

    # --- Signal 2: API call burst ---
    api_calls = session_data.get("api_calls_this_hour", 0)
    baseline_api = baseline.get("normal_api_calls_per_hour", 20)
    if api_calls > baseline_api * 5:
        calculated_score += 35
        reasons.append(f"+35 Extreme API burst ({api_calls}/hr vs baseline {baseline_api}/hr)")
    elif api_calls > baseline_api * 2:
        calculated_score += 20
        reasons.append(f"+20 High API call volume ({api_calls}/hr vs baseline {baseline_api}/hr)")

    # --- Signal 3: High request frequency (interval too short) ---
    request_interval = session_data.get("avg_request_interval", None)
    if request_interval is not None:
        baseline_interval = baseline.get("avg_request_interval", 2.0)
        if request_interval < baseline_interval * 0.5:
            calculated_score += 25
            reasons.append(f"+25 High request frequency (avg {request_interval:.2f}s interval)")

    # --- Signal 4: Sensitive endpoint probing ---
    sensitive_routes = ["/database", "/config", "/admin", "/admin/credentials", "/admin/keys"]
    accessed_endpoints = session_data.get("accessed_endpoints", {})
    sensitive_hits = sum(accessed_endpoints.get(r, 0) for r in sensitive_routes)
    if sensitive_hits >= 3:
        calculated_score += 30
        reasons.append(f"+30 Repeated sensitive endpoint access ({sensitive_hits} hits)")
    elif sensitive_hits >= 2:
        calculated_score += 15
        reasons.append(f"+15 Sensitive endpoint probing ({sensitive_hits} hits)")

    # --- Signal 5: Unusual data download ---
    download_mb = session_data.get("download_mb", 0)
    baseline_dl = baseline.get("typical_download_mb", 5)
    if download_mb > baseline_dl * 10:
        calculated_score += 30
        reasons.append(f"+30 Extreme data download ({download_mb:.0f} MB vs baseline {baseline_dl} MB)")
    elif download_mb > baseline_dl * 3:
        calculated_score += 15
        reasons.append(f"+15 Unusual data download ({download_mb:.0f} MB)")

    # --- Signal 6: Off-hours access ---
    current_hour = datetime.now().hour
    typical_start = baseline.get("typical_hours", [8, 18])[0]
    typical_end = baseline.get("typical_hours", [8, 18])[1]
    if not (typical_start <= current_hour <= typical_end):
        calculated_score += 10
        reasons.append(f"+10 Off-hours access (current: {current_hour:02d}:00, typical: {typical_start:02d}:00-{typical_end:02d}:00)")

    # --- Signal 7: Deception trap hit ---
    if session_data.get("deception_trap_hit", False):
        calculated_score += 50
        reasons.append("+50 DECEPTION TRAP TRIGGERED")

    # Ratchet: score never decreases
    final_score = max(current_score, calculated_score)
    return min(100, final_score), reasons


def is_deception_trap(endpoint: str) -> bool:
    """Check if the accessed endpoint is a deception trap."""
    return endpoint in DECEPTION_TRAPS
