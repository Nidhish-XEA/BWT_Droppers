from typing import Dict, Any, Tuple


def classify_attacker(risk_score: int, session_data: Dict[str, Any]) -> Tuple[str, str]:
    """
    Classify user based on behavior deviation.
    Returns: (attacker_type, behavior_deviation)
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

    avg_interval = session_data.get("avg_request_interval", -1)
    if 0 < avg_interval < 0.2:
        return "Automated Bot", behavior_deviation

    accessed_endpoints = session_data.get("accessed_endpoints", {})
    sensitive_access = sum(
        count for endpoint, count in accessed_endpoints.items()
        if endpoint in ["/database", "/config", "/admin/credentials", "/admin/keys"]
    )

    if sensitive_access > 3 or session_data.get("login_attempts", 0) > 3:
        return "Script Kiddie", behavior_deviation

    api_calls = session_data.get("api_calls_this_hour", 0)
    if api_calls > 150:
        return "Data Exfiltrator", behavior_deviation

    if session_data.get("deception_trap_hit", False):
        return "Malicious Insider", behavior_deviation

    return "Suspicious User", behavior_deviation


def generate_ai_explanation(username: str, risk_score: int, session_data: Dict[str, Any], risk_reasons: list) -> str:
    """Generate a natural-language AI explanation of the threat."""
    api_calls = session_data.get("api_calls_this_hour", 0)
    login_attempts = session_data.get("login_attempts", 0)
    download_mb = session_data.get("download_mb", 0)
    attacker_type = session_data.get("attacker_type", "Unknown")
    deviation = session_data.get("behavior_deviation", "Low")

    if risk_score < 20:
        return (
            f"User **{username}** is exhibiting normal behavioral patterns consistent with their baseline profile. "
            f"No anomalies detected. Continuous monitoring is active."
        )

    parts = [f"**ShadowMind AI Analysis — {username}**\n\n"]
    parts.append(f"Risk Score: **{risk_score}/100** ({deviation} deviation)\n\n")

    if api_calls > 0:
        parts.append(
            f"The user generated **{api_calls} API calls** this session. "
        )

    if login_attempts > 2:
        parts.append(
            f"**{login_attempts} login attempts** were recorded, exceeding the expected baseline. "
            f"This pattern may indicate credential stuffing or unauthorized access attempts. "
        )

    if download_mb > 50:
        parts.append(
            f"An unusual data download of **{download_mb:.1f} MB** was detected, "
            f"significantly above the user's normal activity profile. "
        )

    if risk_score >= 80:
        parts.append(
            f"\n\nThe behavioral profile strongly suggests **{attacker_type}** activity. "
            f"Immediate investigation is recommended. ShadowMind has activated shadow containment mode."
        )
    elif risk_score >= 50:
        parts.append(
            f"\n\nThe behavioral profile is consistent with **{attacker_type}** classification. "
            f"Security team review is advised. Additional monitoring has been escalated."
        )
    else:
        parts.append(
            f"\n\nThe user's activity shows moderate deviation. Continued observation is recommended."
        )

    return "".join(parts)
