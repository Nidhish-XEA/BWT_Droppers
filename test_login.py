from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

response = client.post("/api/login", json={"username": "admin42", "password": "password"})
print("Status Code:", response.status_code)
print("Response:", response.text)
