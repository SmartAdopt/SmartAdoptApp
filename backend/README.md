# SmartAdopt Backend

SmartAdopt application backend, built with FastAPI, SQLAlchemy, and PostgreSQL.

## Table of Contents
- [Description](#description)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Run Locally](#run-locally)
- [Testing](#testing)
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
│   ├── config.py              # Application configuration using pydantic_settings
│   ├── main.py                # FastAPI application entry point
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
│   │   ├── auth_routes.py     # Authentication endpoints
│   │   ├── admin_routes.py    # Admin-protected endpoints
│   │   └── adopter_routes.py  # Adopter-protected endpoints
│   ├── schemas/               # Pydantic schemas
│   │   ├── __init__.py
│   │   └── auth_schemas.py    # Request/response schemas for auth
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   └── auth_service.py    # Authentication services
│   └── utils/                 # Utilities
│       ├── __init__.py
│       ├── jwt/               # JWT authentication utilities
│       │   ├── __init__.py
│       │   ├── jwt_config.py  # JWT configuration using pydantic_settings
│       │   └── jwt_utils.py   # JWT token creation and verification
│       └── oauth/             # OAuth 2.0 utilities
│           ├── __init__.py
│           ├── oauth_config.py    # OAuth configuration using pydantic_settings
│           └── google_oauth.py     # Google OAuth integration
├── docs/                      # Documentation
│   └── README_JWT.md          # Complete JWT documentation
├── tests/                     # Unit tests
├── Dockerfile                 # Docker configuration
└── requirements.txt           # Python dependencies
```

## Technologies

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - ORM for database interaction
- **PostgreSQL** - Relational database
- **Pydantic** - Data validation using Python types
- **Uvicorn** - ASGI server to run FastAPI
- **python-jose** - JWT token creation and verification
- **Bcrypt** - Password hashing and verification
- **Authlib** - OAuth 2.0 integration for Google login


### Run Locally

#### Prerequisites
- Python 3.12+
- A PostgreSQL database running (can be started locally using the root orchestration: `docker compose -f docker-compose-local.yml up -d postgres`)
- A `.env` file configured at the root repository directory (refer to `.env.example` for required variables)

#### Start the Server
```bash
# Go to the backend folder
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Testing

The backend uses Python 3.12 in the remote pipeline. Static analysis and code quality work includes a set of modern, high-speed toolsets:

### Linter (ruff)
```bash
python -m ruff check backend/
```

### Format (black)
```bash
python -m black --check backend/
```

### Static Types (mypy)
```bash
python -m mypy backend/ --ignore-missing-imports
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
- The token expires after 10 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)

**Error Responses**
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Server error

#### Google OAuth Login

**Request**
```http
GET /auth/login/google?role=adopter
```

**Query Parameters:**
- `role` (optional): Role for auto-registration if user doesn't exist (default: "adopter")

**Response:** Redirect to Google OAuth consent screen

#### Google OAuth Callback

**Request**
```http
GET /auth/google/callback?code=...&role=adopter
```

**Query Parameters:**
- `code` (required): Authorization code from Google
- `role` (optional): Role for auto-registration (default: "adopter")

**Response (200 OK) - Existing User:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "message": "Login successful",
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@gmail.com",
  "role": "adopter",
  "created_at": "2026-06-05T12:00:00Z"
}
```

**Response (200 OK) - New User (Auto-registered):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "message": "Registration successful",
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@gmail.com",
  "role": "adopter",
  "created_at": "2026-06-05T12:00:00Z"
}
```

**Note:** Google OAuth automatically registers users if they don't exist in the system. The user's email, first name, and last name are obtained from Google. A default password is set for OAuth users.

**Error Responses**
- `302 Found`: Redirect failed - Google OAuth not available
- `401 Unauthorized`: Google authentication failed

### Protected Endpoints

#### GET /admin/dashboard

Admin-only endpoint protected by JWT and role-based authorization.

**Request**
```http
GET /admin/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**
```json
{
  "message": "Welcome to Admin Dashboard",
  "user_email": "admin@example.com",
  "user_role": "admin",
  "dashboard_data": {
    "total_adoptions": 75,
    "pending_requests": 12
  }
}
```

**Error Responses**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User role is not "admin"

#### GET /adopter/home

Adopter-only endpoint protected by JWT and role-based authorization.

**Request**
```http
GET /adopter/home
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**
```json
{
  "message": "Welcome to Adopter Home",
  "user_email": "adopter@example.com",
  "user_role": "adopter",
  "home_data": {
    "available_pets": 45,
    "my_adoptions": 2,
    "favorite_pets": 8
  }
}
```

**Error Responses**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User role is not "adopter"

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

The application implements JSON Web Token (JWT) authentication for protecting sensitive endpoints. For complete documentation on JWT implementation, refer to `docs/README_JWT.md`.

### Overview

- Access tokens with 10-minute expiration
- Role-based authorization (admin, adopter)
- Token type checking (access/refresh ready for future implementation)
- Protected endpoints with role verification

### Configuration

JWT configuration is managed through environment variables. Refer to the `.env.example` file in the project root for the required variables:

- `SECRET_KEY`: Secret key used to sign JWT tokens
- `ALGORITHM`: Hashing algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes (default: 10)

### Google OAuth Configuration

Google OAuth is configured through environment variables:

- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

To obtain these credentials, refer to the complete Google OAuth documentation in `docs/README_JWT.md`.

### Token Usage

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
   GET /admin/dashboard
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Security Considerations

- Tokens expire after 10 minutes to limit exposure if compromised
- Only admin and adopter roles receive tokens
- Regular users cannot access protected endpoints
- SECRET_KEY should be changed in production environments
- Tokens are transmitted via HTTPS in production (recommended)

## License

This project is part of SmartAdopt.
