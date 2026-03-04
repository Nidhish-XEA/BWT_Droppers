import requests  # type: ignore
import time

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    try:
        session = requests.Session()
        
        print("1. Login as admin")
        res = session.post(f"{BASE_URL}/login", data={"username": "admin", "password": "admin123"})
        print(res.json())
        
        print("\n2. Normal requests (Risk should be low)")
        res = session.get(f"{BASE_URL}/admin")
        print(f"Admin HTML length: {len(res.text)}")
        time.sleep(1) # Normal wait
        
        res = session.get(f"{BASE_URL}/system-status")
        print("Status:", res.json())
        
        print("\n3. Attacker behavior (Rapid requests & sensitive endpoints)")
        for _ in range(4): # trigger sensitive access + rapid requests
            res = session.get(f"{BASE_URL}/database")
            print("DB Status:", res.json().get("status", "unknown"))
            time.sleep(0.1)
            
        res = session.get(f"{BASE_URL}/system-status")
        print("Status after attack:", res.json())
        
        print("\n4. Shadow Admin Panel Check")
        res = session.get(f"{BASE_URL}/admin")
        print("Is Shadow Active?:", "SHADOW-ENVIRONMENT-ACTIVE" in res.text)
        
        print("\n5. Dashboard Data Check")
        res = session.get(f"{BASE_URL}/dashboard-data")
        data = res.json()
        print("Risk Score:", data.get("risk_score"))
        print("Risk Reasons:", data.get("risk_reasons"))
        print("Behavior Analysis:", data.get("behavior_analysis"))
        print("System State:", data.get("system_state"))
        print("Log Count:", len(data.get("session_logs", [])))
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure it's running.")

if __name__ == "__main__":
    test_flow()
