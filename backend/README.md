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
│       └── __init__.py
├── tests/                     # Unit tests
├── Dockerfile                 # Docker configuration
└── requirements.txt           # Python dependencies
```

## Recent Changes

### Import Fix (Jun 4, 2026)

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
  "access_token": "",
  "message": "Login successful",
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "role": "adopter",
  "created_at": "2026-06-05T12:00:00Z"
}
```

**Error Responses**
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Server error

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

## License

This project is part of SmartAdopt.
