# JWT Authentication Documentation

This document provides detailed information about the JWT (JSON Web Token) authentication implementation in the SmartAdopt backend.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Token Creation](#token-creation)
- [Token Verification](#token-verification)
- [Token Usage in Login](#token-usage-in-login)
- [Protected Endpoints](#protected-endpoints)
- [Using JWT Tokens](#using-jwt-tokens)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

The SmartAdopt backend implements JWT authentication to protect sensitive endpoints. JWT tokens are issued to users with admin or adopter roles upon successful login, allowing them to access protected resources.

**Key Features:**
- Tokens are generated only for admin and adopter roles
- Regular users (role: user) receive empty tokens and cannot access protected endpoints
- Tokens expire after 5 minutes (configurable)
- Tokens are signed using HS256 algorithm
- Protected endpoints require valid JWT token in Authorization header

## Architecture

JWT authentication is implemented in a modular way using the following structure:

```
backend/app/utils/jwt/
├── __init__.py
├── jwt_config.py  # Configuration using pydantic_settings
└── jwt_utils.py   # Token creation and verification
```

### jwt_config.py

Configuration file that manages JWT settings using `pydantic_settings`:

```python
from pydantic_settings import BaseSettings


class JWTSettings(BaseSettings):
    # Required variables from environment
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int


# Instance for global use in the application
jwt_settings = JWTSettings()
```

### jwt_utils.py

Utility functions for token creation and verification:

- `create_access_token(email, role)`: Creates a JWT token with user data
- `verify_token(credentials)`: FastAPI dependency that verifies and decodes JWT tokens

## Configuration

JWT configuration is managed through environment variables:

### Environment Variables

- `SECRET_KEY`: Secret key used to sign JWT tokens
- `ALGORITHM`: Hashing algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes (default: 5)

### Docker Compose Configuration

These variables are passed to the backend container via `docker-compose-local.yml`:

```yaml
backend:
  environment:
    - SECRET_KEY=${SECRET_KEY}
    - ALGORITHM=${ALGORITHM}
    - ACCESS_TOKEN_EXPIRE_MINUTES=${ACCESS_TOKEN_EXPIRE_MINUTES}
```

### Root .env File

The actual values are stored in the root `.env` file:

```env
SECRET_KEY=SmartAdopt!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=5
```

**Important:** Change the `SECRET_KEY` in production environments to a strong, random value.

## Token Creation

The `create_access_token(email, role)` function in `jwt_utils.py`:

```python
def create_access_token(email: str, role: str) -> str:
    # Create a JWT access token with user data and expiration
    # Calculate expiration time (current time + configured minutes)
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Create token payload with user data and expiration
    to_encode = {
        "sub": email,
        "role": role,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    # Encode and sign the token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt
```

### Process

1. Receives user email and role as parameters
2. Calculates expiration time (current time + configured minutes)
3. Creates token payload with:
   - `sub`: User email (subject)
   - `role`: User role (admin/adopter)
   - `exp`: Expiration timestamp
   - `iat`: Issued at timestamp
4. Encodes and signs the token using the SECRET_KEY and ALGORITHM
5. Returns the encoded JWT string

### Token Payload Example

```json
{
  "sub": "admin@example.com",
  "role": "admin",
  "exp": 1733440000,
  "iat": 1733439700
}
```

## Token Verification

The `verify_token(credentials)` function in `jwt_utils.py`:

```python
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    # Verify JWT token and return payload
    token = credentials.credentials
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Check expiration
        if datetime.utcnow() > datetime.fromtimestamp(payload["exp"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        
        return payload
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
```

### Process

1. Uses FastAPI's `Depends` to extract the token from the `Authorization` header
2. Decodes and verifies the token signature
3. Checks if the token has expired
4. Returns the token payload if valid
5. Raises `401 Unauthorized` if token is invalid, expired, or missing

### Error Responses

- `401 Unauthorized`: Invalid token signature
- `401 Unauthorized`: Token has expired
- `401 Unauthorized`: Missing token

## Token Usage in Login

In `auth_service.py`, the `login_user` function:

```python
def login_user(db: Session, login_data: LoginRequest):
    # Authenticate a user with email and password

    # Search for user by email in database
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise ValueError("Invalid email or password")

    # Verify password using bcrypt
    if not bcrypt.checkpw(
        login_data.password.encode("utf-8"), user.password_hash.encode("utf-8")
    ):
        raise ValueError("Invalid email or password")

    # Generate JWT token only for admin or adopter roles
    if user.type.lower() in ["admin", "adopter"]:
        token = create_access_token(user.email, user.type)
    else:
        token = ""

    # Create user response with necessary data and token
    user_response = {
        "token": token,
        "token_type": "bearer" if token else "",
        "id": cast(int, user.user_id),
        "first_name": cast(str, user.first_name),
        "last_name": cast(str, user.last_name),
        "email": cast(str, user.email),
        "role": cast(str, user.type),
        "created_at": getattr(user, "created_at", None)
    }

    return user_response
```

### Process

1. Authenticates user credentials (email and password)
2. Checks user role:
   - If role is `admin` or `adopter`: Generates JWT token
   - If role is `user`: Returns empty token
3. Returns user data with token in the response

### Login Response Examples

**Admin/Adopter User:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTczMzQ0MDAwMCwiaWF0IjoxNzMzNDM5NzAwfQ.signature",
  "token_type": "bearer",
  "message": "Login successful",
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "admin@example.com",
  "role": "admin",
  "created_at": "2026-06-05T12:00:00Z"
}
```

**Regular User:**
```json
{
  "access_token": "",
  "token_type": "",
  "message": "Login successful",
  "id": 2,
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "user@example.com",
  "role": "user",
  "created_at": "2026-06-05T12:00:00Z"
}
```

## Protected Endpoints

Endpoints can be protected by adding the `verify_token` dependency:

```python
from app.utils.jwt.jwt_utils import verify_token

@router.get("/protected-endpoint")
def protected_route(token_payload: dict = Depends(verify_token)):
    # token_payload contains the decoded JWT payload
    return {"message": "Access granted", "user": token_payload}
```

### Current Protected Endpoints

#### Get Users List (`/auth/list`)

**Request:**
```http
GET /auth/list?user_id=123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `user_id`: Filter users by ID. If not provided, returns all users.

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "email": "user@example.com",
      "role": "adopter",
      "created_at": "2026-06-05T12:00:00Z"
    }
  ],
  "total": 1
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT token
- `500 Internal Server Error`: Server error

### Requirements for Protected Endpoints

- Valid JWT token in `Authorization: Bearer <token>` header
- Token must not be expired
- Token must be signed with the correct SECRET_KEY
- Token must contain valid payload structure

## Using JWT Tokens

### Step 1: Login to Get Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "message": "Login successful",
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "admin@example.com",
  "role": "admin",
  "created_at": "2026-06-05T12:00:00Z"
}
```

### Step 2: Use Token in Protected Requests

```http
GET /auth/list
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Using with cURL

```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Use token
curl -X GET http://localhost:8000/auth/list \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Using with Postman

1. Make a POST request to `/auth/login` with credentials
2. Copy the `access_token` from the response
3. For subsequent requests, add the header:
   - Key: `Authorization`
   - Value: `Bearer <your_token_here>`

## Security Considerations

### Token Expiration

- Tokens expire after 5 minutes by default
- This limits exposure if a token is compromised
- Clients must re-login after expiration
- Expiration time is configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`

### Role-Based Access

- Only admin and adopter roles receive tokens
- Regular users (role: user) receive empty tokens
- This prevents unauthorized access to protected endpoints
- Role is verified during login before token generation

### Secret Key Management

- `SECRET_KEY` should be changed in production environments
- Use a strong, random key (at least 32 characters)
- Never commit the secret key to version control
- Use environment variables or secret management systems

### HTTPS in Production

- Tokens should be transmitted via HTTPS in production
- This prevents token interception during transmission
- Configure SSL/TLS certificates on your production server

### Token Storage

- Store tokens securely on the client side
- Use httpOnly cookies for web applications when possible
- Avoid storing tokens in localStorage for sensitive applications
- Implement token refresh mechanisms for better UX

## Troubleshooting

### Common Issues

#### 401 Unauthorized: "Not authenticated"

**Cause:** Missing or invalid JWT token in Authorization header

**Solution:**
- Ensure you're sending the token in the `Authorization` header
- Format should be: `Authorization: Bearer <token>`
- Verify the token is not expired
- Check that the token was received from a successful login

#### 401 Unauthorized: "Invalid token"

**Cause:** Token signature is invalid or corrupted

**Solution:**
- Verify the `SECRET_KEY` matches between token generation and verification
- Ensure the token hasn't been modified
- Check that the `ALGORITHM` is consistent (HS256)
- Try logging in again to get a fresh token

#### 401 Unauthorized: "Token has expired"

**Cause:** Token has exceeded its expiration time

**Solution:**
- Login again to get a fresh token
- Consider increasing `ACCESS_TOKEN_EXPIRE_MINUTES` if needed
- Implement token refresh mechanism for better UX

#### Empty Token After Login

**Cause:** User role is not admin or adopter

**Solution:**
- Verify the user's role in the database
- Only admin and adopter roles receive tokens
- Regular users (role: user) receive empty tokens by design

#### Algorithm Not Supported Error

**Cause:** `ALGORITHM` environment variable is empty or invalid

**Solution:**
- Verify `ALGORITHM` is set in `.env` file
- Ensure it's passed to the Docker container
- Check `docker-compose-local.yml` environment section

### Debug Mode

To enable detailed error messages for debugging:

1. Check the backend logs:
```bash
docker-compose -f docker-compose-local.yml logs backend
```

2. Verify environment variables in the container:
```bash
docker-compose -f docker-compose-local.yml exec backend env
```

3. Test token decoding manually:
```python
from jose import jwt
token = "your_token_here"
payload = jwt.decode(token, "your_secret_key", algorithms=["HS256"])
print(payload)
```