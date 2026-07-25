import json
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "SmartAdoptApp_dev"
ALGORITHM = "HS256"

# Create tokens for 5000 users
tokens = []
for i in range(1, 5001):
    user_id = i
    role = "adopter"

    # Access token expired 1 minute ago
    access_expire = datetime.utcnow() - timedelta(minutes=1)
    access_payload = {
        "sub": str(user_id),
        "role": role,
        "exp": access_expire,
        "iat": datetime.utcnow() - timedelta(minutes=31),
        "type": "access",
    }
    access_token = jwt.encode(access_payload, SECRET_KEY, algorithm=ALGORITHM)

    # Refresh token valid for 10 days
    refresh_expire = datetime.utcnow() + timedelta(days=10)
    refresh_payload = {
        "sub": str(user_id),
        "role": role,
        "exp": refresh_expire,
        "iat": datetime.utcnow() - timedelta(minutes=31),
        "type": "refresh",
    }
    refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm=ALGORITHM)

    tokens.append({
        "access_token": access_token,
        "refresh_token": refresh_token
    })

with open("test_tokens.json", "w") as f:
    json.dump(tokens, f)

print(f"Generated {len(tokens)} test tokens in test_tokens.json")
