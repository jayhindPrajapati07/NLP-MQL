import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

print("1. Logging in...")
login_data = {"username": "zorratoadmin@gmail.com", "password": "Zorrato@786"}
response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
if response.status_code != 200:
    print(f"Login failed: {response.text}"); exit(1)

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
print("Login successful.")

print("2. Creating a FRESH Connection...")
conn_payload = {
    "name": "Local Academics Dev DB",
    "database_name": "acadamics",
    "uri": "mongodb://admin:adminpassword@system-db:27017/acadamics?authSource=admin"
}
resp = requests.post(f"{BASE_URL}/connections/", headers=headers, json=conn_payload)
if resp.status_code != 200:
    print(f"Connection creation failed: {resp.text}"); exit(1)

conn_id = resp.json().get("_id", resp.json().get("id"))
print(f"Created fresh connection: {conn_id}")

print("3. Executing Query on the fresh connection...")
query_payload = {
    "natural_language": "Show me the first 2 students",
    "connection_id": str(conn_id)
}
resp = requests.post(f"{BASE_URL}/query/", headers=headers, json=query_payload)

print(f"Status Code: {resp.status_code}")
try:
    print(json.dumps(resp.json(), indent=2))
except Exception:
    print(resp.text)
