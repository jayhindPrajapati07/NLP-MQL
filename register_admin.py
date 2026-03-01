import requests

BASE_URL = "http://localhost:8000/api/v1"

print("Registering admin user...")
register_data = {
    "email": "zorratoadmin@gmail.com",
    "password": "Zorrato@786",
    "full_name": "Admin User"
}
response = requests.post(f"{BASE_URL}/auth/register", json=register_data)

if response.status_code == 200:
    print(f"Success: {response.json()}")
elif response.status_code == 400 and "already exists" in response.text:
    print("User already exists!")
else:
    print(f"Failed: {response.status_code} - {response.text}")
