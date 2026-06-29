# JWT Authentication Documentation



## Table of Contents



1. [Overview](#overview)

2. [Architecture](#architecture)

3. [Configuration](#configuration)

4. [Token Structure](#token-structure)

5. [JWT Functions](#jwt-functions)

6. [API Endpoints](#api-endpoints)

7. [Usage Examples](#usage-examples)

8. [Security Considerations](#security-considerations)

9. [Troubleshooting](#troubleshooting)



## Overview



SmartAdopt uses JWT (JSON Web Token) authentication to protect API endpoints. Users with admin or adopter roles receive JWT tokens upon successful login, allowing them to access protected resources.



Current implementation includes:

- Access tokens with 10-minute expiration

- Role-based authorization (admin, adopter)

- Token type checking (access/refresh ready for future implementation)

- Protected endpoints with role verification



## Architecture

JWT authentication is implemented in the following structure:



```

backend/app/

├── config.py              # Centralized application configuration using pydantic_settings
├── utils/jwt/
│   └── jwt_utils.py     # Token creation and verification
├── routes/
│   ├── auth_routes.py   # Register and login endpoints
│   ├── admin_routes.py  # Admin-protected endpoints
│   └── adopter_routes.py # Adopter-protected endpoints
└── services/
    └── auth_service.py  # Authentication logic

```



## Configuration



### Environment Variables



JWT configuration is managed through environment variables. Refer to the `.env.example` file in the project root for the required variables:



```env

# JWT

SECRET_KEY=secret_key_string

ALGORITHM=algorithm_name 

ACCESS_TOKEN_EXPIRE_MINUTES=expiration_minutes

```



### Configuration

JWT configuration is managed through the centralized `app/config.py` file using pydantic_settings. The following variables are required:

```python
class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
```

```



### Docker Compose Configuration



These variables are passed to the backend container via `docker-compose-local.yml`:



```yaml

backend:

  environment:

    - SECRET_KEY=${SECRET_KEY}

    - ALGORITHM=${ALGORITHM}

    - ACCESS_TOKEN_EXPIRE_MINUTES=${ACCESS_TOKEN_EXPIRE_MINUTES}

```



## Token Structure



### Access Token Payload



The JWT token contains the following fields:



```json

{

  "sub": "1",

  "role": "admin",

  "exp": 1733440000,

  "iat": 1733439700,

  "type": "access"

}

```



**Field Descriptions:**

- `sub`: User ID (subject)

- `role`: User role (admin or adopter)

- `exp`: Expiration timestamp

- `iat`: Issued at timestamp

- `type`: Token type (access or refresh)



## JWT Functions



### create_access_token(user_id, role)



Creates a JWT access token with user data and expiration.



```python

def create_access_token(user_id: int, role: str) -> str:

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    

    to_encode = {

        "sub": str(user_id),

        "role": role,

        "exp": expire,

        "iat": datetime.utcnow(),

        "type": "access"

    }

    

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

```



### verify_token(credentials)



FastAPI dependency that verifies JWT tokens from Authorization header.



```python

def verify_token(

    credentials: HTTPAuthorizationCredentials = Security(security),

) -> Dict[str, Any]:

    token = credentials.credentials

    

    try:

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        return payload

    except JWTError:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Could not validate credentials",

            headers={"WWW-Authenticate": "Bearer"},

        )

```



## API Endpoints



### Authentication Endpoints



#### POST /auth/register



Register a new user (admin or adopter).



**Request:**

```json

{

  "first_name": "John",

  "last_name": "Doe",

  "email": "admin@example.com",

  "phone_number": "1234567890",

  "password": "password123",

  "requested_role": "admin"

}

```



**Response (201 Created):**

```json

{

  "message": "User registered successfully",

  "user_id": 1,

  "created_at": "2026-06-09T12:00:00Z"

}

```



#### POST /auth/login



Authenticate user and receive access token.



**Request:**

```json

{

  "email": "admin@example.com",

  "password": "password123"

}

```



**Response (200 OK):**

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

  "created_at": "2026-06-09T12:00:00Z"

}

```



**Note:** Only users with role `admin` or `adopter` receive tokens. Regular users receive empty tokens.



### Protected Endpoints



#### GET /admin/dashboard



Admin-only endpoint protected by JWT and role-based authorization.



**Request:**

```http

GET /admin/dashboard

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```



**Response (200 OK):**

```json

{

  "message": "Welcome to Admin Dashboard",

  "user_id": "1",

  "user_role": "admin",

  "dashboard_data": {

    "total_adoptions": 75,

    "pending_requests": 12

  }

}

```



**Error Responses:**

- `401 Unauthorized`: Missing or invalid token

- `403 Forbidden`: User role is not "admin"



#### GET /adopter/home



Adopter-only endpoint protected by JWT and role-based authorization.



**Request:**

```http

GET /adopter/home

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```



**Response (200 OK):**

```json

{

  "message": "Welcome to Adopter Home",

  "user_id": "1",

  "user_role": "adopter",

  "home_data": {

    "available_pets": 45,

    "my_adoptions": 2,

    "favorite_pets": 8

  }

}

```


**Error Responses:**

- `401 Unauthorized`: Unauthorized access

- `403 Forbidden`: User role is not "adopter"



## Usage Examples



### Using JWT Tokens



**Step 1: Login to get token**

```bash

curl -X POST http://localhost:8000/auth/login \

  -H "Content-Type: application/json" \

  -d '{"email":"admin@example.com","password":"password123"}'

```



**Step 2: Use token for protected requests**

```bash

curl -X GET http://localhost:8000/admin/dashboard \

  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

```



## Security Considerations



### Token Expiration



- Tokens expire after 10 minutes by default

- This limits exposure if a token is compromised

- Clients must re-login after expiration

- Expiration time is configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`



### Role-Based Access



- Only admin and adopter roles receive tokens

- Regular users (role: user) receive empty tokens

- This prevents unauthorized access to protected endpoints

- Role is verified during login before token generation

- Role is verified on each protected endpoint request



### Secret Key Management



- `SECRET_KEY` should be changed in production environments

- Use a strong, random key (at least 32 characters)

- Never commit the secret key to version control

- Use environment variables or secret management systems



### HTTPS in Production



- Tokens should be transmitted via HTTPS in production

- This prevents token interception during transmission

- Configure SSL/TLS certificates on your production server



## Troubleshooting



### Common Errors



**401 Unauthorized: "Could not validate credentials"**

- Check token is in `Authorization: Bearer <token>` header

- Verify token is not expired

- Ensure token was received from successful login



**403 Forbidden: "Access denied"**

- Verify user role matches endpoint requirements

- Check role in database

- Only admin can access `/admin/dashboard`

- Only adopter can access `/adopter/home`



**401 Unauthorized: "Invalid token type"**

- Ensure token payload includes `"type": "access"`

- Check token wasn't modified



**Empty token after login**

- User role is not admin or adopter

- Regular users (role: user) receive empty tokens by design



### Debug Commands



```bash

# Check backend logs

docker-compose -f docker-compose-local.yml logs backend



# Verify environment variables

docker-compose -f docker-compose-local.yml exec backend env



# Test token decoding

python -c "from jose import jwt; print(jwt.decode('token', 'secret', algorithms=['HS256']))"

```
