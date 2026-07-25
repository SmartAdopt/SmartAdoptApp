import json
import urllib.request
import sys

try:
    with open("admin_token.json", "r") as f:
        token = json.load(f)["access_token"]
except Exception as e:
    print("Error reading token", e)
    sys.exit(1)

req = urllib.request.Request("http://localhost:8000/pets/")
req.add_header("Authorization", f"Bearer {token}")
try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        data = json.loads(response.read().decode())
        print(json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print(e.read().decode())
