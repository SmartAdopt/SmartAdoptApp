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
- [Logging](#logging)

## Description

SmartAdopt is a platform for pet adoption management. This backend provides a RESTful API for user authentication, admin management, and adopter management.

## Project Structure

```
backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── config.py        # Application configuration using pydantic_settings
│   │   ├── main.py          # FastAPI application entry point
│   │   ├── database/        # Database configurations (PostgreSQL, MongoDB, Redis)
│   │   │   ├── postgres/    # PostgreSQL configuration
│   │   │   │   └── postgres_db.py # SQLAlchemy configuration (Base, Session)
│   │   │   ├── mongo/       # MongoDB configuration
│   │   │   │   └── mongo_db.py     # Motor async MongoDB client
│   │   │   └── redis/       # Redis configuration for token management
│   │   │       └── redis_db.py    # Redis client configuration
│   │   ├── models/          # SQLAlchemy ORM models (User, Admin, Adopter, Pet)
│   │   │   ├── user/       # User models (User, Admin, Adopter)
│   │   │   └── pet/        # Pet models
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth_routes.py     # Authentication endpoints
│   │   │   ├── admin_routes.py    # Admin-protected endpoints
│   │   │   ├── adopter_routes.py  # Adopter-protected endpoints
│   │   │   ├── backblaze_routes.py # Backblaze B2 image upload endpoints
│   │   │   └── pet_routes.py      # Pet management endpoints
│   │   ├── schemas/         # Pydantic schemas for validation
│   │   │   ├── auth_schemas.py     # Authentication schemas
│   │   │   ├── backblaze_schemas.py # Backblaze B2 schemas
│   │   │   └── pet_schemas.py      # Pet management schemas
│   │   ├── services/        # Business logic layer
│   │   │   ├── auth_service.py    # Authentication services
│   │   │   ├── backblaze_service.py # Backblaze B2 service
│   │   │   └── pet_service.py      # Pet management service
│   │   └── utils/           # Utility functions
│   │       ├── jwt/         # JWT authentication utilities
│   │       │   └── jwt_utils.py   # JWT token creation, verification, and blacklist management
│   │       ├── oauth/       # OAuth 2.0 utilities
│   │       │   └── google_oauth.py     # Google OAuth integration
│   │       └── logger/      # Logging configuration
│   │           └── logger_config.py    # Loguru logging configuration
│   ├── docs/               # Documentation
│   │   ├── README_JWT.md    # Complete JWT documentation
│   │   ├── README_OAUTH.md  # Complete OAuth documentation
│   │   ├── README_BACKBLAZE.md # Complete Backblaze B2 documentation
│   │   └── README_LOGS.md   # Complete logging system documentation
│   ├── tests/              # Backend tests
│   │   ├── conftest.py      # Test configuration
│   │   ├── test_auth.py     # Authentication tests
│   │   ├── test_google_oauth.py  # Google OAuth tests
│   │   ├── test_admin_routes.py   # Admin routes tests
│   │   ├── test_adopter_routes.py # Adopter routes tests
│   │   ├── test_backblaze_routes.py # Backblaze B2 tests
│   │   ├── test_pet.py      # Pet management tests
│   │   └── test_main.py     # Main endpoint tests
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container configuration
```

## Technologies

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - ORM for database interaction
- **PostgreSQL** - Relational database
- **MongoDB** - NoSQL database for pet profiles
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation using Python types
- **Uvicorn** - ASGI server to run FastAPI
- **python-jose** - JWT token creation and verification
- **Bcrypt** - Password hashing and verification
- **Authlib** - OAuth 2.0 integration for Google login
- **Redis** - Token storage and management
- **b2sdk** - Backblaze B2 cloud storage integration


### Run Locally

#### Prerequisites
- Python 3.12+
- A PostgreSQL database running (can be started locally using the root orchestration: `docker compose -f docker-compose-local.yml up -d postgres`)
- A `.env` file configured at the root repository directory (refer to `.env.example` for required variables)

#### Environment Variables

The backend requires the following environment variables (defined in `.env.example`):

**Database Configuration:**
- `POSTGRES_HOST`: PostgreSQL host address
- `POSTGRES_PORT`: PostgreSQL port
- `POSTGRES_DB`: PostgreSQL database name
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_HOST_PORT`: PostgreSQL port exposed to host

**JWT Configuration:**
- `SECRET_KEY`: Secret key for JWT token signing
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration time in minutes
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time in days

**Redis Configuration:**
- `REDIS_HOST`: Redis host address
- `REDIS_PORT`: Redis port
- `REDIS_DB`: Redis database number
- `REDIS_PASSWORD`: Redis password
- `REDIS_EXTERNAL_PORT`: Redis port exposed to host

**Google OAuth:**
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

**Backblaze B2:**
- `BACKBLAZE_KEY_ID`: Backblaze application key ID
- `BACKBLAZE_APPLICATION_KEY`: Backblaze application key
- `BACKBLAZE_BUCKET_NAME`: Backblaze bucket name

**MongoDB:**
- `MONGO_HOST`: MongoDB host address
- `MONGO_PORT`: MongoDB port
- `MONGO_DB`: MongoDB database name
- `MONGO_USER`: MongoDB username
- `MONGO_PASSWORD`: MongoDB password
- `MONGO_EXTERNAL_PORT`: MongoDB port exposed to host

**Docker & Ports:**
- `BACKEND_INTERNAL_PORT`: Backend FastAPI port (internal, default: 9090)
- `BACKEND_EXTERNAL_PORT`: Backend port exposed to host (default: 8000)
- `FRONTEND_INTERNAL_PORT`: Frontend port (internal, default: 80)
- `FRONTEND_EXTERNAL_PORT`: Frontend port exposed to host (default: 8080)

**Dozzle:**
- `DOZZLE_PORT`: Dozzle log viewer port (internal)
- `DOZZLE_EXTERNAL_PORT`: Dozzle port exposed to host (default: 8080)

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
- **Password:** Admin1234
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

## Pet Management System

The application includes a comprehensive pet management system for managing pet profiles and adoption information.

### Pet Registration

**Request**
```http
POST /pets/register
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Buddy",
  "pet_image_url": "https://example.com/dog.jpg",
  "animal_breed": ["dog", "cat"],
  "age": 3,
  "gender": "male",
  "is_sterilized": true,
  "vaccines_up_to_date": ["rabies", "parvovirus",...],
  "dewormed": true,
  "weight_kg": 8.5,
  "special_conditions": [],
  "brief_description": "Friendly dog looking for a home"
}
```

**Response (201 Created)**
```json
{
  "message": "Pet registered successfully",
  "pet_id": "P1"
}
```

**Validation Rules:**
- Age: 0-15 years (realistic range for pets)
- Weight: 0-10 kg (realistic range for pets)
- Image URL: Must be valid HTTP/HTTPS URL and is mandatory
- Animal Breed: First element must be "dog" or "cat"
- Gender: Must be "male" or "female"
- Vaccines: Validated against animal type (dog vs cat vaccines)

### Pet Update

**Request**
```http
PUT /pets/{pet_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "age": 4,
  "is_sterilized": false,
  "weight_kg": 9.0,
  "special_conditions": ["Needs daily exercise"],
  "brief_description": "Active dog looking for an active family"
}
```

**Response (200 OK)**
```json
{
  "message": "Pet updated successfully",
  "pet_id": "P0001"
}
```

**Restricted Fields (cannot be modified):**
- name
- pet_image_url
- animal_breed
- gender

**Allowed Fields for Update:**
- age
- is_sterilized
- vaccines_up_to_date
- dewormed
- weight_kg
- special_conditions
- brief_description

### Pet Listing

**Request**
```http
GET /pets/
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**
```json
{
  "message": "Pets retrieved successfully",
  "pets": [
    {
      "pet_id": "P0001",
      "name": "Buddy",
      "pet_image_url": "https://example.com/dog.jpg",
      "animal_breed": ["dog", "Golden Retriever"],
      "age": 3,
      "gender": "male",
      "is_sterilized": true,
      "vaccines_up_to_date": ["rabies"],
      "dewormed": true,
      "weight_kg": 8.5,
      "special_conditions": [],
      "brief_description": "Friendly dog looking for a home"
    }
  ],
  "count": 1
}
```

**Error Responses**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User role is not "admin"
- `404 Not Found`: Pet not found
- `422 Unprocessable Entity`: Validation error

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

### Pet
- `pet_id`: String (Primary Key, auto-generated: P#### for dogs, G#### for cats)
- `name`: String
- `pet_image_url`: String (HTTP/HTTPS URL, mandatory)
- `animal_breed`: List[String] (First element must be "dog" or "cat")
- `age`: Integer (0-15 years)
- `gender`: String ("male" or "female")
- `is_sterilized`: Boolean
- `vaccines_up_to_date`: List[String]
- `dewormed`: Boolean
- `weight_kg`: Float (0-10 kg)
- `special_conditions`: List[String]
- `brief_description`: String
- `created_at`: DateTime


## Development Notes

- Models use SQLAlchemy polymorphism to distinguish between Admin and Adopter
- PostgreSQL connection is configured in `app/database/postgres/config.py`
- Endpoints use dependency injection to obtain the database session
- All error responses follow a consistent format with `error_code`, `message`, and `details`

## Security

The application implements industry-standard security practices to protect user data (Admins and Adopters):

- **Input Validation:** Done automatically using Pydantic schemas with custom field validators:
  - Names (first_name, last_name): Only letters allowed (including accented characters), 2-50 characters
  - Phone number: Exactly 10 digits, numeric only
  - Password: Minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, and one number
  - Role: Only accepts 'admin' or 'adopter'
  - Email: Validated format using EmailStr
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
- Refresh tokens with configurable expiration (default: 7 days)
- Role-based authorization (admin, adopter)
- Token type checking (access/refresh)
- Token blacklist for immediate revocation
- Protected endpoints with role verification
- Redis-based token storage and management

### Configuration

JWT configuration is managed through environment variables. Refer to the `.env.example` file in the project root for the required variables:

- `SECRET_KEY`: Secret key used to sign JWT tokens
- `ALGORITHM`: Hashing algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes (default: 10)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time in days (default: 7)

### Google OAuth Configuration

Google OAuth is configured through environment variables:

- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

To obtain these credentials, refer to the complete Google OAuth documentation in `docs/README_OAUTH.md`.

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

3. **Refresh expired token:**
   ```http
   POST /auth/refresh
   Authorization: Bearer <expired_access_token>
   Cookie: refresh_token=<refresh_token>
   ```

4. **Logout (revoke tokens):**
   ```http
   POST /auth/logout
   Authorization: Bearer <access_token>
   Cookie: refresh_token=<refresh_token>
   ```

### Token Blacklist

The application implements a token blacklist mechanism using Redis to immediately revoke access tokens:

- When a user logs out, their access token is added to a blacklist in Redis
- Blacklisted tokens are rejected even if they haven't expired
- Blacklisted tokens automatically expire from Redis when the original token would have expired
- All protected endpoints check the blacklist before accepting a token
- This provides immediate security by allowing token revocation without waiting for natural expiration

### Security Considerations

- Tokens expire after 10 minutes to limit exposure if compromised
- Refresh tokens are stored in Redis with rotation on each refresh
- Token blacklist allows immediate revocation of compromised tokens
- Only admin and adopter roles receive tokens
- Regular users cannot access protected endpoints
- SECRET_KEY should be changed in production environments
- Tokens are transmitted via HTTPS in production (recommended)
- HTTP-Only cookies prevent XSS attacks on refresh tokens

## Backblaze B2 Image Upload

The application uses Backblaze B2 cloud storage for image upload:

- **Admin-only access**: Only users with admin role can upload images
- **UUID filenames**: Unique filenames prevent conflicts
- **Automatic URL generation**: Public URLs are generated automatically
- **Bucket validation**: Checks bucket existence before upload

**Endpoint:**
```http
POST /backblaze/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <image_file>
```

**Configuration:**
- `BACKBLAZE_KEY_ID`: Backblaze application key ID
- `BACKBLAZE_APPLICATION_KEY`: Backblaze application key
- `BACKBLAZE_BUCKET_NAME`: Backblaze bucket name

For complete documentation, refer to `docs/README_BACKBLAZE.md`.

## Logging

The application uses **Loguru** for structured logging with color-coded console output and file-based persistent logging.

### Logging Configuration

The logging system is configured in `app/utils/logger/logger_config.py` with the following features:

- **Color-coded console output**: Entire log lines are colored based on log level
  - INFO: Green
  - WARNING: Yellow
  - ERROR: Red
- **File-based logging**: Logs are written to files for persistent storage
  - `logs/app.log`: All logs (INFO and above)
  - `logs/error.log`: Error logs only (ERROR and above)
- **Log rotation**: Files are rotated when they reach 500 MB
- **Log retention**: Logs are retained for 10 days (app.log) or 30 days (error.log)

### Log Format

Console logs use the following format:
```
{timestamp} | {level} | {name}:{function}:{line} - {message}
```

Example:
```
2026-06-13 21:45:00 | INFO     | app.main:main:13 - Initializing FastAPI application
```

### Usage

Import the logger in your Python files:
```python
from app.utils.logger.logger_config import logger

# Log at different levels
logger.info("User logged in successfully")
logger.warning("Invalid credentials attempt")
logger.error("Database connection failed")
```

### Documentation Access Logging

The application includes a middleware that logs when users access the FastAPI documentation at `/docs`:
```
User accessing FastAPI documentation
```

For complete documentation on the logging system, refer to `docs/README_LOGS.md`.

## License

This project is part of SmartAdopt.