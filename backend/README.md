# SmartAdopt Backend

SmartAdopt application backend, built with FastAPI, SQLAlchemy, and PostgreSQL.

## 📑 Table of Contents
- [Description](#-description)
- [Project Structure](#-project-structure)
- [Recent Changes](#-recent-changes)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Endpoints](#-endpoints)
- [Data Models](#-data-models)
- [Tests](#-tests)
- [Development Notes](#-development-notes)
- [Security](#-security)

## 📋 Description

SmartAdopt is a platform for pet adoption management. This backend provides a RESTful API for user authentication, admin management, and adopter management.

## 🏗️ Project Structure

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

## ✨ Recent Changes

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

## 🚀 Technologies

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - ORM for database interaction
- **PostgreSQL** - Relational database
- **Pydantic** - Data validation using Python types
- **Uvicorn** - ASGI server to run FastAPI

## 📦 Installation

### Prerequisites
- Docker and Docker Compose
- Python 3.12+ (for local development)

### Environment Variables

Create a `.env` file at the project root with the following variables:

```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartadopt_dev
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST_PORT=5432
```

### Run with Docker

```bash
# Build and start containers
docker-compose -f docker-compose-local.yml up --build

# Stop containers
docker-compose -f docker-compose-local.yml down

# Stop and remove volumes
docker-compose -f docker-compose-local.yml down -v

# Start only backend services (without frontend)
docker compose -f docker-compose-local.yml up backend postgres mongo
```

### Run Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔌 Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "role": "adopter"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### List Users
```http
GET /auth/list?role=adopter
```

## 🗄️ Data Models

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


## 📝 Development Notes

- Models use SQLAlchemy polymorphism to distinguish between Admin and Adopter
- PostgreSQL connection is configured in `app/database/postgres/config.py`
- Endpoints use dependency injection to obtain the database session
- All error responses follow a consistent format with `error_code`, `message`, and `details`

## 🔐 Security

- Passwords are stored as hashes (not in plain text)
- Input validation using Pydantic schemas
- CORS configured to allow requests from the frontend

## 📄 License

This project is part of SmartAdopt.
