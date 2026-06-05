# SmartAdopt Backend

SmartAdopt application backend, built with FastAPI, SQLAlchemy, and PostgreSQL.

## Table of Contents
- [Description](#description)
- [Project Structure](#project-structure)
- [Recent Changes](#recent-changes)
- [Technologies](#technologies)
- [Run Locally](#run-locally)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Development Notes](#development-notes)
- [Security](#security)
- [JWT Authentication](#jwt-authentication)

## Description

SmartAdopt is a platform for pet adoption management. This backend provides a RESTful API for user authentication, admin management, and adopter management.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── database/              # Database configuration
│   │   ├── __init__.py
│   │   └── postgres/
│   │       ├── __init__.py    # Created to enable imports
│   │       ├── config.py      # PostgreSQL connection configuration
│   │       ├── postgres_db.py # SQLAlchemy configuration (Base, Session)
│   │       └── init_postgres.sql # Table initialization script
│   ├── models/                # SQLAlchemy models
│   │   ├── __init__.py        # Exports User, Admin, Adopter
│   │   ├── user.py            # Base user model
│   │   ├── admin.py           # Admin model (inherits from User)
│   │   └── adopter.py         # Adopter model (inherits from User)
│   ├── routes/                # API routes
│   │   ├── __init__.py
│   │   └── auth_routes.py     # Authentication endpoints
│   ├── schemas/               # Pydantic schemas
│   │   ├── __init__.py
│   │   └── auth_schemas.py    # Request/response schemas for auth
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   └── auth_service.py    # Authentication services
│   └── utils/                 # Utilities
│       ├── __init__.py
│       └── jwt/               # JWT authentication utilities
│           ├── __init__.py
│           ├── jwt_config.py  # JWT configuration using pydantic_settings
│           └── jwt_utils.py   # JWT token creation and verification
├── docs/                      # Documentation
├── tests/                     # Unit tests
├── Dockerfile                 # Docker configuration
└── requirements.txt           # Python dependencies
```

## Recent Changes

### JWT Authentication Implementation 

**Changes:**
1. **JWT Configuration** - Added `app/utils/jwt/` folder with:
   - `jwt_config.py`: Configuration using pydantic_settings to read JWT environment variables
   - `jwt_utils.py`: Token creation and verification functions
2. **Token Generation** - Modified `login_user` in `auth_service.py` to generate JWT tokens for admin and adopter roles only
3. **Protected Endpoint** - Reactivated `/auth/list` endpoint with JWT protection using `verify_token` dependency
4. **Environment Variables** - Added JWT variables to `docker-compose-local.yml` for container configuration

**Impact:**
- Admin and Adopter users receive JWT tokens upon successful login
- Regular users (role: user) receive empty tokens
- Protected endpoints require valid JWT token in Authorization header
- Tokens expire after 5 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)

### Import Fix

**Problem:** The backend failed to start with the error:
```
ImportError: cannot import name 'User' from 'app.models'
```

**Solution:**
1. **`app/models/__init__.py`** - Added model exports:
   ```python
   from .user import User
   from .admin import Admin
   from .adopter import Adopter

   __all__ = ["User", "Admin", "Adopter"]
   ```

2. **`app/database/postgres/__init__.py`** - Created this missing file to enable relative imports from `postgres_db.py`

**Impact:** The backend now starts correctly and can import SQLAlchemy models without errors.

## Technologies

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - ORM for database interaction
- **PostgreSQL** - Relational database
- **Pydantic** - Data validation using Python types
- **Uvicorn** - ASGI server to run FastAPI
- **python-jose** - JWT token creation and verification
- **Bcrypt** - Password hashing and verification


### Run Locally

#### Prerequisites
- Python 3.12+
- A PostgreSQL database running (can be started locally using the root orchestration: `docker compose -f docker-compose-local.yml up -d postgres`)
- A `.env` file configured at the root repository directory (the backend configuration loads it automatically from `../../.env`).

#### Start the Server
```bash
# Go to the backend folder
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Default Admin User

When the PostgreSQL database is initialized using the provided script, a default admin user is automatically created with the following credentials:

- **Email:** admin@smartadopt.com
- **Password:** admin123
- **Role:** admin

This user can be used to:
- Test the authentication system
- Access protected endpoints that require admin privileges
- Manage other users and system resources

**Note:** For production environments, change the default admin password immediately after the first login.

## Endpoints

### Authentication

#### Register User

**Request**
```http
POST /auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "phone_number": "+1234567890",
  "password": "password123",
  "requested_role": "adopter"
}
```

**Response (201 Created)**
```json
{
  "message": "User registered successfully",
  "user_id": 1,
  "created_at": "2026-06-05T12:00:00Z"
}
```

**Error Responses**
- `409 Conflict`: Email already registered
- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

#### Login

**Request**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "message": "Login successful",
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "role": "adopter",
  "created_at": "2026-06-05T12:00:00Z"
}
```

**Note:**
- Admin and Adopter users receive a valid JWT token in `access_token`
- Regular users (role: user) receive an empty `access_token` and `token_type`
- The token expires after 5 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)

**Error Responses**
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Server error

#### Get Users List (Protected)

**Request**
```http
GET /auth/list?user_id=123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters**
- `user_id`: Filter users by ID. If not provided, returns all users.

**Response (200 OK)**
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

**Error Responses**
- `401 Unauthorized`: Missing or invalid JWT token
- `500 Internal Server Error`: Server error

**Note:** This endpoint requires a valid JWT token in the `Authorization` header. Only users with admin or adopter roles receive tokens upon login.

## Data Models

### User (Base)
- `user_id`: Integer (Primary Key)
- `first_name`: String
- `last_name`: String
- `email`: String (Unique)
- `phone_number`: String (Optional)
- `password_hash`: String
- `type`: String (Polymorphism)

### Admin
- Inherits from User
- `user_id`: Integer (Foreign Key to User)

### Adopter
- Inherits from User
- `user_id`: Integer (Foreign Key to User)
- `created_at`: DateTime


## Development Notes

- Models use SQLAlchemy polymorphism to distinguish between Admin and Adopter
- PostgreSQL connection is configured in `app/database/postgres/config.py`
- Endpoints use dependency injection to obtain the database session
- All error responses follow a consistent format with `error_code`, `message`, and `details`

## Security

The application implements industry-standard security practices to protect user data (Admins and Adopters):

- **Input Validation:** Done automatically using Pydantic schemas.
- **CORS Configuration:** Strictly configured to allow requests only from trusted frontend origins.
- **Password Protection:** Passwords are never stored in plain text.

### Password Hashing Flow (Bcrypt)

We use **Bcrypt** to handle credentials securely through an adaptive, one-way hashing function.

#### 1. User Registration (`/auth/register`)
* **Data Submission:** The user sends their data (email, password, name, etc.).
* **Email Verification:** The system checks the database to ensure the email is not already registered.
* **Password Hashing:** A random salt is generated, and the password is secure-hashed using `bcrypt.hashpw()`.
* **Secure Storage:** Only the resulting hash is stored in the database. The original plain-text password is permanently discarded from memory.

#### 2. User Login (`/auth/login`)
* **Credentials Submission:** The user enters their email and password.
* **User Lookup:** The system retrieves the user profile by email.
* **Password Verification (`bcrypt.checkpw`):** The system mathematically compares the incoming plain-text password with the stored database hash.
  * **If it matches:** Access is authorized (proceeding to generate the JWT access token).
  * **If it fails:** Returns a generic `401 Unauthorized` ("Invalid email or password") error for security.

### Why Bcrypt?
* **Random Salt:** Each user gets a unique salt, making rainbow table attacks completely useless.
* **One-Way Algorithm:** It is mathematically impossible to "decrypt" the hash back into the original password.
* **Adaptive Work Factor (Slow):** It is intentionally designed to be computationally slow, protecting the database against brute-force attacks.

## JWT Authentication

The application implements JSON Web Token (JWT) authentication for protecting sensitive endpoints.

### Architecture

JWT authentication is implemented in a modular way using the following structure:

```
app/utils/jwt/
├── __init__.py
├── jwt_config.py  # Configuration using pydantic_settings
└── jwt_utils.py   # Token creation and verification
```

### Configuration

JWT configuration is managed through environment variables:

- `SECRET_KEY`: Secret key used to sign JWT tokens
- `ALGORITHM`: Hashing algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes (default: 5)

These variables are loaded using `pydantic_settings` from the system environment, which are passed via Docker Compose from the root `.env` file.

### Token Creation

The `create_access_token(email, role)` function in `jwt_utils.py`:

1. Receives user email and role as parameters
2. Calculates expiration time (current time + configured minutes)
3. Creates token payload with:
   - `sub`: User email (subject)
   - `role`: User role (admin/adopter)
   - `exp`: Expiration timestamp
   - `iat`: Issued at timestamp
4. Encodes and signs the token using the SECRET_KEY and ALGORITHM
5. Returns the encoded JWT string

### Token Verification

The `verify_token(credentials)` function in `jwt_utils.py`:

1. Uses FastAPI's `Depends` to extract the token from the `Authorization` header
2. Decodes and verifies the token signature
3. Checks if the token has expired
4. Returns the token payload if valid
5. Raises `401 Unauthorized` if token is invalid, expired, or missing

### Token Usage in Login

In `auth_service.py`, the `login_user` function:

1. Authenticates user credentials (email and password)
2. Checks user role:
   - If role is `admin` or `adopter`: Generates JWT token
   - If role is `user`: Returns empty token
3. Returns user data with token in the response

### Protected Endpoints

Endpoints can be protected by adding the `verify_token` dependency:

```python
@router.get("/protected-endpoint")
def protected_route(token_payload: dict = Depends(verify_token)):
    # token_payload contains the decoded JWT payload
    return {"message": "Access granted", "user": token_payload}
```

The `/auth/list` endpoint is protected and requires:
- Valid JWT token in `Authorization: Bearer <token>` header
- Token must not be expired
- Token must be signed with the correct SECRET_KEY

### Using JWT Tokens

1. **Login to get token:**
   ```http
   POST /auth/login
   {
     "email": "admin@example.com",
     "password": "password123"
   }
   ```

2. **Use token in protected requests:**
   ```http
   GET /auth/list
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Security Considerations

- Tokens expire after 5 minutes to limit exposure if compromised
- Only admin and adopter roles receive tokens
- Regular users cannot access protected endpoints
- SECRET_KEY should be changed in production environments
- Tokens are transmitted via HTTPS in production (recommended)

## License

This project is part of SmartAdopt.
