from typing import Dict, Any, Tuple

def classify_attacker(risk_score: int, session_data: Dict[str, Any]) -> Tuple[str, str]:
    """
    Classify user based on behavior deviation.
    Variables considered: Risk Score and Session Logs / Request Intervals.
    
    Returns:
    (attacker_type, behavior_deviation)
    """
    
    behavior_deviation = "Low"
    if risk_score >= 80:
        behavior_deviation = "Critical"
    elif risk_score >= 50:
        behavior_deviation = "High"
    elif risk_score >= 20:
        behavior_deviation = "Moderate"

    if risk_score < 50:
        return "Normal User", behavior_deviation
        
    # Check for bot behavior: Extremely short intervals usually indicate automation
    avg_interval = session_data.get("avg_request_interval", -1)
    if 0 < avg_interval < 0.2:
        return "Automated Bot", behavior_deviation
        
    # Check for script kiddie: Lots of blind attempts on sensitive endpoints or many failed logins
    accessed_endpoints = session_data.get("accessed_endpoints", {})
    sensitive_access = sum(count for endpoint, count in accessed_endpoints.items() if endpoint in ["/database", "/config"])
    
    if sensitive_access > 3 or session_data.get("login_attempts", 0) > 3:
        return "Script Kiddie", behavior_deviation
        
    # If it reached a high risk score but lacked clear automation or blind scraping, they seem to be a methodical snooping user
    return "Suspicious User", behavior_deviation
