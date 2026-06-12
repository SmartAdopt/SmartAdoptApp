# Refresh Token Implementation - Technical Summary

## Table of Contents

- [Overview](#overview)
- [General Architecture](#general-architecture)
- [1. Configuration](#1-configuration)
- [2. JWT Utilities](#2-jwt-utilities)
- [3. Authentication Service](#3-authentication-service)
- [4. Authentication Routes](#4-authentication-routes)
- [Complete Authentication Flow](#complete-authentication-flow)
- [Security Measures Implemented](#security-measures-implemented)
- [Redis Configuration](#redis-configuration)
- [Required Environment Variables](#required-environment-variables)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Summary of Changes by File](#summary-of-changes-by-file)
- [Conclusion](#conclusion)

---

## Overview

A complete JWT refresh token system was implemented with token rotation, revoked token blacklist, and secure Redis storage to maintain active sessions securely.

---

## General Architecture

### Implemented Components

1. **Configuration** (`app/config.py`)
2. **JWT Utilities** (`app/utils/jwt/jwt_utils.py`)
3. **Authentication Service** (`app/services/auth_service.py`)
4. **Authentication Routes** (`app/routes/auth_routes.py`)

---

## 1. Configuration

### Added Environment Variables
```python
REFRESH_TOKEN_EXPIRE_DAYS: int  # Default: 7 days
```

### File: `app/config.py`
- Added the variable `REFRESH_TOKEN_EXPIRE_DAYS` to the `Settings` class
- This variable controls the duration of refresh tokens in days

---

## 2. JWT Utilities

### File: `app/utils/jwt/jwt_utils.py`

#### Function: `create_refresh_token(email: str, role: str) -> str`
**Purpose:** Create a JWT refresh token with extended expiration

**Implementation:**
```python
def create_refresh_token(email: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "sub": email,
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
def login_user(db: Session, login_data: LoginRequest):
    # ... user validation ...
    
    refresh_token = ""
    if user.type.lower() in ["admin", "adopter"]:
        access_token = create_access_token(email, role)
        refresh_token = create_refresh_token(email, role)
        
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
    
    return {
        "token": access_token,
        "refresh_token": refresh_token,
        # ... other fields ...
    }
```

**Features:**
- Only generates refresh tokens for admin and adopter roles
- Stores user data in Redis associated with the refresh token
- Redis key: `refresh_token:{refresh_token}`
- TTL: 7 days (configurable)

---

#### Function: `oauth_login_or_register()` - Modified
**Changes:** Now generates and stores refresh tokens for OAuth

**Implementation:**
```python
def oauth_login_or_register(db: Session, user_info: Dict[str, Any], role: str = "adopter"):
    # ... OAuth logic ...
    
    if existing_user:
        # Generate tokens for existing user
        refresh_token = create_refresh_token(email, role)
        redis_client.setex(f"refresh_token:{refresh_token}", ...)
    else:
        # Auto-register with Google
        new_user = Adopter(...)
        refresh_token = create_refresh_token(email, role)
        redis_client.setex(f"refresh_token:{refresh_token}", ...)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        # ...
    }
```

**Features:**
- Supports refresh tokens for OAuth login
- Auto-registration of Google users with refresh tokens
- Same Redis storage as traditional login

---

#### Function: `refresh_tokens(refresh_token: str) -> Dict[str, str]` - NEW
**Purpose:** Rotate refresh tokens and generate new access tokens

**Implementation:**
```python
def refresh_tokens(refresh_token: str) -> Dict[str, str]:
    # Validate refresh token in Redis
    user_data_json = redis_client.get(f"refresh_token:{refresh_token}")
    if not user_data_json:
        raise ValueError("No active session found")
    
    # Rotation: delete old refresh token
    redis_client.delete(f"refresh_token:{refresh_token}")
    
    # Parse user data
    user_data = json.loads(user_data_json)
    email = user_data["email"]
    role = user_data["role"]
    
    # Generate new tokens
    new_access_token = create_access_token(email, role)
    new_refresh_token = create_refresh_token(email, role)
    
    # Store new refresh token in Redis
    redis_client.setex(
        f"refresh_token:{new_refresh_token}",
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        user_data_json,
    )
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token
    }
```

**Features:**
- **Token rotation:** The old refresh token is deleted after use
- **Validation:** Verifies that the refresh token exists in Redis
- **Regeneration:** Creates new access and refresh tokens
- **Persistence:** Stores the new refresh token in Redis

**Security:** Prevents reuse of refresh tokens (replay attacks)

---

#### Function: `logout_user(refresh_token: str) -> None` - NEW
**Purpose:** Delete refresh token from Redis on logout

**Implementation:**
```python
def logout_user(refresh_token: str) -> None:
    if refresh_token:
        redis_client.delete(f"refresh_token:{refresh_token}")
```

**Features:**
- Deletes the refresh token from Redis
- Invalidates the active session
- Simple and direct

---

## 4. Authentication Routes

### File: `app/routes/auth_routes.py`

#### Endpoint: `POST /auth/login` - Modified
**Changes:** Sets refresh token in HTTP-Only cookie

**Implementation:**
```python
@router.post("/login")
def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user_response = login_user(db, login_data)
    
    # Set refresh token in HTTP-Only cookie
    refresh_token = user_response.get("refresh_token")
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,        # Not accessible from JavaScript
            secure=True,          # HTTPS only
            samesite="lax",       # CSRF protection
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        )
    
    return LoginResponse(
        access_token=user_response["token"],
        # ... other fields ...
    )
```

**Security Features:**
- **HttpOnly:** Prevents JavaScript access (XSS protection)
- **Secure:** Only transmitted over HTTPS
- **SameSite=Lax:** CSRF protection
- **Max-Age:** 7 days in seconds

---

#### Endpoint: `GET /auth/google/callback` - Modified
**Changes:** Sets refresh token in HTTP-Only cookie for OAuth

**Implementation:**
```python
@router.get("/google/callback")
async def google_callback(request: Request, response: Response, role: str = "adopter", db: Session = Depends(get_db)):
    # ... OAuth flow ...
    user_response = oauth_login_or_register(db, user_info, role)
    
    # Set refresh token in cookie
    refresh_token = user_response.get("refresh_token")
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        )
    
    return LoginResponse(...)
```

**Features:** Same security measures as traditional login

---

#### Endpoint: `POST /auth/refresh` - NEW
**Purpose:** Token refresh endpoint

**Implementation:**
```python
@router.post("/refresh")
def refresh(
    request: Request,
    response: Response,
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
):
    # 1. Check if access token is blacklisted
    if is_token_blacklisted(credentials.credentials):
        raise HTTPException(
            status_code=401,
            detail={"message": "Token has been revoked"},
        )
    
    # 2. Reject if access token is still valid
    token_status = decode_token_status(credentials.credentials)
    if token_status == "valid":
        raise HTTPException(
            status_code=400,
            detail={"message": "Access token is still valid, refresh is not needed"},
        )
    
    # 3. Validate refresh token cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail={"message": "No active session found"},
        )
    
    # 4. Rotate tokens
    tokens = refresh_tokens(refresh_token)
    
    # 5. Set new refresh token in cookie
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
    
    return RefreshTokenResponse(
        access_token=tokens["access_token"],
        token_type="bearer",
    )
```

**Validations:**
1. **Blacklist check:** Verifies the access token is not revoked
2. **Expiration check:** Only allows refresh if access token is expired
3. **Cookie validation:** Requires refresh token cookie
4. **Redis validation:** Verifies the refresh token exists in Redis

**Response:**
- New access token in JSON
- New refresh token in HTTP-Only cookie

---

#### Endpoint: `POST /auth/logout` - Modified
**Changes:** Revokes access token and deletes refresh token

**Implementation:**
```python
@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(_optional_bearer),
):
    # 1. Validate refresh token cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail={"message": "No active session found"},
        )
    
    # 2. Add access token to blacklist if provided
    if credentials:
        try:
            token = credentials.credentials
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            exp_timestamp = payload.get("exp")
            if exp_timestamp:
                exp_datetime = datetime.fromtimestamp(exp_timestamp)
                add_token_to_blacklist(token, exp_datetime)
        except Exception:
            pass  # If token is invalid, continue with logout
    
    # 3. Delete refresh token from Redis
    logout_user(refresh_token)
    
    # 4. Clear cookie
    response.delete_cookie(
        key="refresh_token",
        secure=True,
        samesite="lax",
        httponly=True,
    )
    
    return {"message": "Logged out successfully"}
```

**Features:**
- **Blacklist:** Adds access token to blacklist for immediate revocation
- **Redis cleanup:** Deletes refresh token from Redis
- **Cookie cleanup:** Deletes cookie from browser
- **Graceful handling:** Continues even if access token is invalid

---

## Complete Authentication Flow

### 1. Traditional Login
```
1. User sends email/password to POST /auth/login
2. Backend validates credentials
3. Backend generates access token (10 min) and refresh token (7 days)
4. Backend stores refresh token in Redis
5. Backend sets refresh token in HTTP-Only cookie
6. Backend returns access token in JSON
```

### 2. Google OAuth Login
```
1. User initiates OAuth flow
2. Google redirects to GET /auth/google/callback
3. Backend validates Google token
4. Backend generates access and refresh tokens
5. Backend stores refresh token in Redis
6. Backend sets refresh token in HTTP-Only cookie
7. Backend returns access token in JSON
```

### 3. Token Refresh
```
1. Client sends expired access token in Authorization header
2. Client sends refresh token in cookie
3. POST /auth/refresh verifies:
   - Access token is not blacklisted
   - Access token is expired
   - Refresh token exists in cookie
   - Refresh token exists in Redis
4. Backend deletes old refresh token from Redis (rotation)
5. Backend generates new access and refresh tokens
6. Backend stores new refresh token in Redis
7. Backend sets new refresh token in cookie
8. Backend returns new access token in JSON
```

### 4. Logout
```
1. Client sends access token (optional) and refresh token in cookie
2. POST /auth/logout:
   - Adds access token to blacklist (if provided)
   - Deletes refresh token from Redis
   - Deletes cookie from browser
3. Returns success message
```

---

## Security Measures Implemented

### 1. **Refresh Token Rotation**
- Each refresh generates a new refresh token
- The old refresh token is deleted immediately
- Prevents replay attacks

### 2. **Access Token Blacklist**
- Revoked tokens are stored in Redis
- Verification in protected endpoints
- Automatic TTL based on token expiration

### 3. **HTTP-Only Cookies**
- Refresh tokens not accessible from JavaScript
- XSS protection

### 4. **Secure Cookies**
- Only transmitted over HTTPS
- Protection against interception

### 5. **SameSite=Lax**
- CSRF protection
- Allows basic navigation

### 6. **Expiration Validation**
- Only allows refresh when access token is expired
- Prevents unnecessary refresh

### 7. **Redis Storage**
- Refresh tokens stored in Redis with TTL
- Auto-cleanup when expired
- Existence validation before refresh

---

## Redis Configuration

### Data Structure

#### Refresh Tokens
```
Key: refresh_token:{refresh_token_value}
Value: {"email": "...", "role": "...", "id": ...}
TTL: 7 days (configurable)
```

#### Blacklist
```
Key: blacklist:{access_token_value}
Value: "1"
TTL: Equal to access token expiration
```

---

## Required Environment Variables

```bash
# JWT Configuration
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10
REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=
```

---

## API Endpoints

### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "message": "Login successful",
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "role": "adopter",
  "created_at": "2024-01-01T00:00:00"
}
```

**Cookie Set:** `refresh_token={value}; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`

---

### POST /auth/refresh
**Request:**
```
Authorization: Bearer {expired_access_token}
Cookie: refresh_token={refresh_token_value}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Cookie Set:** `refresh_token={new_value}; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`

---

### POST /auth/logout
**Request:**
```
Authorization: Bearer {access_token} (optional)
Cookie: refresh_token={refresh_token_value}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Cookie Deleted:** `refresh_token`

---

## Testing

Comprehensive tests were implemented in `backend/tests/test_auth.py`:

- `test_refresh_token_success`: Successful refresh
- `test_refresh_token_rejects_valid_access_token`: Rejects refresh with valid token
- `test_refresh_token_without_refresh_cookie`: Rejects refresh without cookie
- `test_logout_with_blacklist`: Verifies blacklist on logout
- `test_blacklisted_token_rejected_in_protected_endpoint`: Verifies rejection of blacklisted tokens
- `test_verify_token_with_expired_token`: Verifies handling of expired tokens
- `test_decode_token_status_expired`: Verifies expiration detection
- `test_decode_token_status_invalid`: Verifies invalid token detection
- `test_refresh_internal_error`: Internal error handling in refresh
- `test_logout_internal_error`: Internal error handling in logout

---

## Summary of Changes by File

### `app/config.py`
- ✅ Added: `REFRESH_TOKEN_EXPIRE_DAYS: int`

### `app/utils/jwt/jwt_utils.py`
- ✅ Added: `create_refresh_token()`
- ✅ Added: `decode_token_status()`
- ✅ Added: `add_token_to_blacklist()`
- ✅ Added: `is_token_blacklist()`
- ✅ Modified: Import of `REFRESH_TOKEN_EXPIRE_DAYS`

### `app/services/auth_service.py`
- ✅ Modified: `login_user()` - Generates and stores refresh tokens
- ✅ Modified: `oauth_login_or_register()` - Generates and stores refresh tokens
- ✅ Added: `refresh_tokens()` - Token rotation
- ✅ Added: `logout_user()` - Refresh token deletion

### `app/routes/auth_routes.py`
- ✅ Modified: `POST /auth/login` - Sets HTTP-Only cookie
- ✅ Modified: `GET /auth/google/callback` - Sets HTTP-Only cookie
- ✅ Added: `POST /auth/refresh` - Refresh endpoint
- ✅ Modified: `POST /auth/logout` - Blacklist and cleanup

### `backend/tests/conftest.py`
- ✅ Added: `REFRESH_TOKEN_EXPIRE_DAYS` in environment setup

### `backend/tests/test_auth.py`
- ✅ Added: 10 new tests for refresh token functionality

---

## Conclusion

A complete and secure refresh token system was implemented with the following features:

1. **Token rotation** to prevent replay attacks
2. **Token blacklist** for immediate revocation
3. **HTTP-Only cookies** for XSS protection
4. **Multiple validations** to ensure integrity
5. **Redis storage** with automatic TTL
6. **OAuth support** with refresh tokens
7. **Comprehensive testing** of all scenarios

The implementation follows security best practices and is production-ready.
