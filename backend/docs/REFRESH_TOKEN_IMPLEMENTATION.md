---

## JWT Utilities

### File: `app/utils/jwt/jwt_utils.py`

#### Function: `create_refresh_token(user_id: int, role: str) -> str`
**Purpose:** Create a JWT refresh token with extended expiration

**Implementation:**
```python
def create_refresh_token(user_id: int, role: str) -> str:
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "sub": str(user_id),  # User ID as string
        "role": role,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh",  # Distinguishes from access token
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

**Features:**
- 7-day expiration (configurable)
- Includes `type: "refresh"` field to differentiate from access tokens
- Same signing algorithm as access tokens (HS256)

---

#### Function: `decode_token_status(token: str) -> str`
**Purpose:** Verify the status of a token without throwing exceptions

**Implementation:**
```python
def decode_token_status(token: str) -> str:
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return "valid"
    except ExpiredSignatureError:
        return "expired"
    except JWTError:
        return "invalid"
```

**Returns:**
- `"valid"`: Token is valid and not expired
- `"expired"`: Token is expired
- `"invalid"`: Token is malformed or invalid

**Usage:** Check if an access token needs refresh before allowing it

---

#### Function: `add_token_to_blacklist(token: str, expires_at: datetime) -> None`
**Purpose:** Add a token to the Redis blacklist for revocation

**Implementation:**
```python
def add_token_to_blacklist(token: str, expires_at: datetime) -> None:
    ttl = int((expires_at - datetime.utcnow()).total_seconds())
    if ttl > 0:
        redis_client.setex(f"blacklist:{token}", ttl, "1")
```

**Features:**
- Stores the token in Redis with TTL equal to its expiration
- Key: `blacklist:{token}`
- Value: `"1"` (simple indicator)
- Auto-cleanup when TTL expires

---

#### Function: `is_token_blacklisted(token: str) -> bool`
**Purpose:** Check if a token is in the blacklist

**Implementation:**
```python
def is_token_blacklisted(token: str) -> bool:
    return redis_client.exists(f"blacklist:{token}") > 0
```

**Usage:** Verify revoked tokens in protected endpoints

---

## 3. Authentication Service

### File: `app/services/auth_service.py`

#### Function: `login_user()` - Modified
**Changes:** Now generates and stores refresh tokens

**Implementation:**
```python
def login_user(db: Session, redis_client, login_data: LoginRequest):
    # ... user validation ...
    
    refresh_token = ""
    if user.type.lower() in ["admin", "adopter"]:
        access_token = create_access_token(user.user_id, role)
        refresh_token = create_refresh_token(user.user_id, role)
        
        # Save to Redis
        user_data_json = json.dumps({
            "email": email,
            "role": role,
            "id": user.user_id,
        })
        redis_client.setex(
            f"refresh_token:{refresh_token}",
            timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_data_json,
        )
```

**Features:**
- Token payload uses `user_id` as `sub` (subject)
- Refresh token stored in Redis with user data
- Session management via Redis

---

#### Function: `oauth_login_or_register()` - Modified
**Changes:** Now generates tokens with user_id

**Implementation:**
```python
def oauth_login_or_register(db: Session, redis_client, user_info: Dict[str, Any], role: str = "adopter"):
    # ... user lookup or registration ...
    
    if existing_user:
        # Generate tokens for existing user
        refresh_token = create_refresh_token(existing_user.user_id, role)
        redis_client.setex(f"refresh_token:{refresh_token}", ...)
    else:
        # Auto-register with Google
        new_user = Adopter(...)
        refresh_token = create_refresh_token(new_user.user_id, role)
        redis_client.setex(f"refresh_token:{refresh_token}", ...)
```

---

#### Function: `refresh_tokens()` - Modified
**Changes:** Now generates new tokens with user_id

**Implementation:**
```python
def refresh_tokens(redis_client, refresh_token: str):
    # ... validate refresh token ...
    
    # Parse user data
    user_data = json.loads(user_data_json)
    user_id = int(user_data["id"])
    role = user_data["role"]
    
    # Generate new tokens
    new_access_token = create_access_token(user_id, role)
    new_refresh_token = create_refresh_token(user_id, role)
```

---

## 4. JWT Token Structure

### Access Token Payload
```json
{
  "sub": "1",
  "role": "admin",
  "exp": 1234567890,
  "iat": 1234567800,
  "type": "access"
}
```

### Refresh Token Payload
```json
{
  "sub": "1",
  "role": "admin",
  "exp": 1234567890,
  "iat": 1234567800,
  "type": "refresh"
}
```

**Key Points:**
- `sub`: User ID (as string)
- `role`: User role (admin/adopter)
- `exp`: Expiration timestamp
- `iat`: Issued at timestamp
- `type`: Token type (access/refresh)
