import json
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "SmartAdoptApp_dev"
ALGORITHM = "HS256"

# Create a single admin token valid for 1 hour
user_id = 9999
role = "admin"

access_expire = datetime.utcnow() + timedelta(hours=1)
access_payload = {
    "sub": str(user_id),
    "role": role,
    "exp": access_expire,
    "iat": datetime.utcnow(),
    "type": "access",
}
access_token = jwt.encode(access_payload, SECRET_KEY, algorithm=ALGORITHM)

token_data = {
    "access_token": access_token
}

with open("admin_token.json", "w") as f:
    json.dump(token_data, f)

print("Generated admin token in admin_token.json")
