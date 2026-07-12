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
│   │   ├── models/          # SQLAlchemy ORM and MongoDB models
│   │   │   ├── user/            # User models (User, Admin, Adopter)
│   │   │   ├── pet/             # Pet models (Python models for MongoDB)
│   │   │   ├── adoption_form/  # Adoption form models (Python models for MongoDB)
│   │   │   ├── applications/   # Adoption application models (Python models for MongoDB)
│   │   │   ├── favorites/      # Favorite model (SQLAlchemy, PostgreSQL)
│   │   │   └── foundation/     # Foundation model (SQLAlchemy, PostgreSQL)
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth_routes.py         # Authentication endpoints
│   │   │   ├── admin_routes.py        # Admin-protected endpoints
│   │   │   ├── adopter_routes.py      # Adopter-protected endpoints
│   │   │   ├── backblaze_routes.py   # Backblaze B2 image upload endpoints
│   │   │   ├── pet_routes.py          # Pet management endpoints
│   │   │   ├── adoption_form_routes.py # Adoption form endpoints
│   │   │   ├── applications_routes.py # Adoption application endpoints
│   │   │   ├── favorite_routes.py     # Favorite endpoints
│   │   │   └── foundation_routes.py  # Foundation info endpoints
│   │   ├── schemas/         # Pydantic schemas for validation
│   │   │   ├── auth_schemas.py            # Authentication schemas
│   │   │   ├── backblaze_schemas.py       # Backblaze B2 schemas
│   │   │   ├── pet_schemas.py             # Pet management schemas
│   │   │   ├── pet_profile_schemas.py     # Pet profile schemas
│   │   │   ├── adoption_form_schemas.py   # Adoption form schemas
│   │   │   ├── applications_schemas.py   # Adoption application schemas
│   │   │   ├── favorite_schemas.py       # Favorite schemas
│   │   │   └── foundation_schemas.py     # Foundation schemas
│   │   ├── services/        # Business logic layer
│   │   │   ├── auth_service.py        # Authentication services
│   │   │   ├── backblaze_service.py   # Backblaze B2 service
│   │   │   ├── pet_service.py          # Pet management service
│   │   │   ├── ai_service.py           # AI service (BLIP + LLM)
│   │   │   ├── adoption_form_service.py # Adoption form service (MongoDB)
│   │   │   ├── applications_service.py # Adoption application service (MongoDB)
│   │   │   ├── favorite_service.py    # Favorite service
│   │   │   └── foundation_service.py  # Foundation service
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
│   │   ├── README_LOGS.md   # Complete logging system documentation
│   │   ├── README_APPLICATIONS.md # Complete adoption applications documentation
│   │   └── README_AI.md     # Complete AI integration documentation (BLIP + LLM)
│   ├── tests/              # Backend tests
│   │   ├── conftest.py              # Test configuration
│   │   ├── test_auth.py             # Authentication tests
│   │   ├── test_google_oauth.py      # Google OAuth tests
│   │   ├── test_admin_routes.py     # Admin routes tests
│   │   ├── test_adopter_routes.py   # Adopter routes tests
│   │   ├── test_backblaze_routes.py # Backblaze B2 tests
│   │   ├── test_pet.py              # Pet management tests
│   │   ├── test_adoption_form.py    # Adoption form tests
│   │   ├── test_ai.py               # AI service tests (BLIP + LLM)
│   │   ├── test_applications.py     # Adoption application tests
│   │   ├── test_favorite_routes.py  # Favorite tests
│   │   ├── test_google_oauth_utils.py # Google OAuth utility tests
│   │   └── test_main.py             # Main endpoint tests
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container configuration
```

## Technologies

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - ORM for database interaction
- **PostgreSQL** - Relational database
- **MongoDB** - NoSQL database for pet profiles and adoption forms
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation using Python types
- **Uvicorn** - ASGI server to run FastAPI
- **python-jose** - JWT token creation and verification
- **Bcrypt** - Password hashing and verification
- **Authlib** - OAuth 2.0 integration for Google login
- **Redis** - Token storage and management
- **b2sdk** - Backblaze B2 cloud storage integration
- **requests** - HTTP library for external API calls
- **huggingface-hub** - Hugging Face Hub client for model downloads (BLIP)
- **transformers** - NLP library for BLIP image captioning
- **PIL (pillow)** - Image processing library
- **itsdangerous** - Secure data signing for cookies
- **loguru** - Structured logging library


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

**Hugging Face**
- `HF_TOKEN`: your_hugging_face_token

**API URLs**
- `VITE_API_URL`:api_url

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

## Running Tests

The project includes **12 test files** covering authentication, routes, services, and AI integration:

| File | Coverage |
|---|---|
| `test_auth.py` | Authentication & registration |
| `test_google_oauth.py` | Google OAuth login flow |
| `test_google_oauth_utils.py` | Token decoding & verification utilities |
| `test_admin_routes.py` | Admin CRUD endpoints |
| `test_adopter_routes.py` | Adopter user management |
| `test_adoption_form.py` | Adoption form submission & review |
| `test_applications.py` | Adoption application lifecycle |
| `test_pet.py` | Pet CRUD + AI enrichment |
| `test_favorite_routes.py` | Favorite pets management |
| `test_backblaze_routes.py` | Backblaze B2 media upload |
| `test_ai.py` | AI service unit tests (BLIP caption, LLM call) |
| `test_main.py` | Root health-check endpoint |

### Run All Tests
```bash
# Run all backend tests
python -m pytest backend/tests/ -v

# Run with coverage report
python -m pytest backend/ --cov=backend --cov-report=term-missing

# Run a specific test file
python -m pytest backend/tests/test_applications.py -v

# Run tests matching a keyword
python -m pytest backend/tests/ -k "pet" -v
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
  "phone_number": "+1234567890",
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
  "phone_number": "+1234567890",
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
  "phone_number": "",
  "role": "adopter",
  "created_at": "2026-06-05T12:00:00Z"
}
```

**Note:** Google OAuth automatically registers users if they don't exist in the system. The user's email, first name, and last name are obtained from Google. A default password is set for OAuth users.

**Error Responses**
- `302 Found`: Redirect failed - Google OAuth not available
- `401 Unauthorized`: Google authentication failed

### Token Management

#### Refresh Token

**POST** `/auth/refresh`

Refreshes expired access tokens using the refresh token stored in an HTTP-Only cookie.

**Request**
```http
POST /auth/refresh
Authorization: Bearer <expired_access_token>
Cookie: refresh_token=<refresh_token>
```

**Response (200 OK)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Note:**
- The refresh token must be sent as an HTTP-Only cookie
- The access token in the Authorization header must be expired (not valid)
- The refresh token is rotated on each refresh for security

**Error Responses**
- `401 Unauthorized`: No credentials provided, token revoked, or no active session
- `400 Bad Request`: Access token is still valid, refresh not needed

#### Logout

**POST** `/auth/logout`

Logs out the user and revokes both access and refresh tokens.

**Request**
```http
POST /auth/logout
Authorization: Bearer <access_token>
Cookie: refresh_token=<refresh_token>
```

**Response (200 OK)**
```json
{
  "message": "Logged out successfully"
}
```

**Note:**
- The access token is added to a blacklist in Redis
- The refresh token is revoked in Redis
- The refresh token cookie is deleted
- Both tokens are immediately invalidated

**Error Responses**
- `401 Unauthorized`: No active session found

---

## Protected Endpoints

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
  "user_id": "1",
  "user_role": "admin",
  "dashboard_data": {
    "total_pets": 15,
    "available_pets": 8,
    "in_process_pets": 3,
    "adopted_pets": 4,
    "total_applications": 25,
    "pending_applications": 10,
    "approved_applications": 5,
    "rejected_applications": 2
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
  "user_id": "2",
  "user_role": "adopter",
  "home_data": {
    "available_pets": 8,
    "my_adoptions": 1,
    "favorite_pets": 3
  }
}
```

**Error Responses**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User role is not "adopter"

#### PUT /adopter/profile

Updates the authenticated adopter's profile. Only the adopter themselves can update their own profile. All fields are optional.

**Authorization:** `Adopter` role required

**Request**
```http
PUT /adopter/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "0987654321",
  "email": "newemail@example.com",
  "current_password": "OldPass123",
  "new_password": "NewPass456"
}
```

**Response (200 OK)**
```json
{
  "message": "Profile updated successfully",
  "user_id": 1,
  "updated_at": "2026-07-03T12:00:00.000000"
}
```

**Validation Rules:**
- `first_name`, `last_name`: Only letters allowed, 2-50 characters
- `phone_number`: Exactly 10 digits, must start with "09" (Ecuador mobile)
- `email`: Valid email format
- `current_password` and `new_password`: Both required together for password change, must be different
- `new_password`: Minimum 8 characters, must contain uppercase, lowercase, and number

**Error Responses**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User role is not "adopter"
- `409 Conflict`: Email already in use
- `400 Bad Request`: Validation error

---

## Adoption Form API Endpoints

The adoption form system allows users with the **adopter** role to submit, view, and update their adoption applications. All endpoints require a valid JWT token with the `adopter` role.

**Base URL:** `/adoption-forms`

### Submit Adoption Form

**POST** `/adoption-forms/submit`

Creates a new adoption form for the authenticated user.

**Authorization:** `Adopter` role required

**Request Body**
```json
{
  "neighborhood": "La Floresta",
  "address": "Calle Principal 123",
  "employment_status": "employed",
  "employment_status_other": null,
  "housing_type": "apartment",
  "housing_type_other": null,
  "has_natural_space": true,
  "has_pets": false,
  "current_pets_details": null,
  "household_energy": "moderate",
  "has_children": true,
  "children_ages": [5, 8],
  "long_term_commitment": true,
  "preferred_species": "dog",
  "preferred_gender": "male",
  "preferred_energy": "medium",
  "daily_time_dedication": "2-6",
  "sleeping_location": "inside",
  "sleeping_location_other": null,
  "behavior_approach": "positive_education",
  "behavior_approach_other": null,
  "emergency_plan": "family_friend",
  "emergency_plan_other": null,
  "motivation": "I want to provide a loving home to a pet in need."
}
```

**Response (201 Created)**
```json
{
  "message": "Adoption form registered successfully",
  "form_id": "AF1",
  "submission_date": "2026-06-28T10:30:00.000Z"
}
```

**Validation Rules:**
- `neighborhood`: must be at least 2 characters
- `address`: must be at least 5 characters
- `employment_status`: must be one of `employed`, `independent`
- `housing_type`: must be one of `apartment`, `rented_house`, `own_house`
- `household_energy`: must be one of `very_active`, `moderate`, `quiet`
- `preferred_species`: must be one of `dog`, `cat`, `no_preference`
- `preferred_gender`: must be one of `male`, `female`, `no_preference`
- `preferred_energy`: must be one of `low`, `medium`, `high`
- `daily_time_dedication`: must be `>2` (low), `2-6` (medium), or `6+` (high)
- `sleeping_location`: must be one of `inside`, `patio`, `other`
- `behavior_approach`: must be one of `positive_education`, `trainer`, `other`
- `emergency_plan`: must be one of `family_friend`, `kennel`, `take_with_me`, `other`
- `motivation`: must be at least 10 characters

**Error Responses**
- `403 Forbidden`: User role is not `adopter`
- `400 Bad Request`: Validation error (invalid field value or too short fields)
- `500 Internal Server Error`: Unexpected server error
- `401 Unauthorized`: Missing or invalid token


---

### Get My Adoption Form

**GET** `/adoption-forms/me`

Retrieves the adoption form for the authenticated user.

**Authorization:** `Adopter` role required

**Response (200 OK)**
```json
{
  "user_id": "user@example.com",
  "neighborhood": "Quito - Center",
  "address": "Av. Amazonas N12-45 y República",
  "employment_status": "employed",
  "employment_status_other": null,
  "housing_type": "own_house",
  "housing_type_other": null,
  "has_natural_space": true,
  "has_pets": true,
  "current_pets_details": "3-year-old Golden Retriever, very sociable with other animals",
  "household_energy": "moderate",
  "has_children": true,
  "children_ages": [
    8,
    12
  ],
  "long_term_commitment": true,
  "preferred_species": "dog",
  "preferred_gender": "female",
  "preferred_energy": "medium",
  "daily_time_dedication": "6+",
  "sleeping_location": "inside",
  "sleeping_location_other": null,
  "behavior_approach": "positive_education",
  "behavior_approach_other": null,
  "emergency_plan": "family_friend",
  "emergency_plan_other": null,
  "motivation": "I want to adopt",
  "submission_date": "2026-06-28T17:19:18.549000",
  "last_updated": "2026-06-28T17:20:10.849000"
}
```

**Error Responses**
- `403 Forbidden`: User role is not `adopter`
- `404 Not Found`: No adoption form found for this user
- `500 Internal Server Error`: Unexpected server error
- `401 Unauthorized`: Missing or invalid token

---

### Update My Adoption Form

**PUT** `/adoption-forms/me`

Updates the adoption form for the authenticated user. All fields are optional in the update request.

**Authorization:** `Adopter` role required

**Request Body** *(all fields are optional)*
```json
{
  "neighborhood": "La Floresta",
  "address": "Calle Principal 123",
  "employment_status": "employed",
  "employment_status_other": null,
  "housing_type": "apartment",
  "housing_type_other": null,
  "has_natural_space": true,
  "has_pets": false,
  "current_pets_details": null,
  "household_energy": "moderate",
  "has_children": true,
  "children_ages": [5, 8],
  "long_term_commitment": true,
  "preferred_species": "dog",
  "preferred_gender": "male",
  "preferred_energy": "medium",
  "daily_time_dedication": "2-6",
  "sleeping_location": "inside",
  "sleeping_location_other": null,
  "behavior_approach": "positive_education",
  "behavior_approach_other": null,
  "emergency_plan": "family_friend",
  "emergency_plan_other": null,
  "motivation": "I want to provide a loving home to a pet in need."
}
```

**Response (200 OK)**
```json
{
  "message": "Adoption form updated successfully",
  "form": {
    "user_id": "user@example.com",
    "neighborhood": "La Floresta",
    "address": "Calle Principal 123",
    "employment_status": "employed",
    "employment_status_other": null,
    "housing_type": "apartment",
    "housing_type_other": null,
    "has_natural_space": true,
    "has_pets": false,
    "current_pets_details": "3-year-old Golden Retriever, very sociable with other animals",
    "household_energy": "moderate",
    "has_children": true,
    "children_ages": [
      5,
      8
    ],
    "long_term_commitment": true,
    "preferred_species": "dog",
    "preferred_gender": "male",
    "preferred_energy": "medium",
    "daily_time_dedication": "2-6",
    "sleeping_location": "inside",
    "sleeping_location_other": null,
    "behavior_approach": "positive_education",
    "behavior_approach_other": null,
    "emergency_plan": "family_friend",
    "emergency_plan_other": null,
    "motivation": "I want to provide a loving home to a pet in need.",
    "submission_date": "2026-06-28T17:19:18.549000",
    "last_updated": "2026-06-28T17:33:29.981000"
  }
}
```

**Validation Rules:** Same as the submit endpoint, but only for fields that are provided in the request.

**Error Responses**
- `403 Forbidden`: User role is not `adopter`
- `400 Bad Request`: Validation error (invalid field value)
- `500 Internal Server Error`: Unexpected server error
- `401 Unauthorized`: Missing or invalid token

---

## Admin Adoption Form Endpoints

### List All Forms (Admin)

**GET** `/adoption-forms/admin`

Lists all adoption forms with their embedded applications. Supports filtering by pet name and application status.

**Authorization:** `Admin` role required

**Query Parameters**
- `pet_name` (optional): Filter forms containing applications for a pet whose name matches (case-insensitive partial match)
- `status` (optional): Filter applications within forms by status (`approved`, `rejected`, `pending`). Forms with no matching applications after filtering are excluded. Multiple statuses can be combined (e.g., `?status=approved&status=pending`).

**Response (200 OK)**
```json
{
  "forms": [
    {
      "_id": "AF1",
      "user_id": 3,
      "neighborhood": "Centro",
      "address": "Calle 123",
      "status": "approved",
      "reviewed_by": 1,
      "reviewed_at": "2026-07-10T12:00:00",
      "applications": [
        {
          "application_id": "AP1",
          "pet_profile_id": "PR3",
          "pet_name": "Pepe",
          "total_score": 12,
          "main_score": 9,
          "logistics_education_score": 3,
          "ai_justification": "El adoptante demuestra...",
          "needs_manual_review": false,
          "status": "approved",
          "created_at": "2026-07-10T10:00:00"
        }
      ]
    }
  ],
  "applications_count": 1
}
```

**Error Responses**
- `403 Forbidden`: User role is not `admin`
- `401 Unauthorized`: Missing or invalid token

---

### Review Application (Admin)

**PUT** `/adoption-forms/{application_id}/review`

Reviews an adoption application, approving or rejecting it. An application can only be reviewed once (subsequent attempts return 400). Approving an application will also update the associated pet profile's status to `adopted`, while rejecting it will revert the pet's status to `available` if necessary.

**Authorization:** `Admin` role required

**Request Body**
```json
{
  "status": "approved"
}
```

**Response (200 OK)**
```json
{
  "message": "Application reviewed successfully",
  "review_result": {
    "application_id": "AP1",
    "status": "approved"
  }
}
```

**Error Responses**
- `400 Bad Request`: Application is not pending (already reviewed) or invalid state transition
- `404 Not Found`: Application not found
- `403 Forbidden`: User role is not `admin`
- `401 Unauthorized`: Missing or invalid token

---

## Adoption Applications API Endpoints

The adoption applications system allows adopters to apply for a specific pet and view their submitted applications. All endpoints require a valid JWT token with the `adopter` role.

**Base URL:** `/applications`

### Submit Adoption Application

**POST** `/applications/{pet_profile_id}`

Creates a new adoption application for a specific pet. The pet's form must be submitted before applying. The application is cross-evaluated by AI using the adopter's form and the pet's profile.

**Authorization:** `Adopter` role required

**Request**
```http
POST /applications/PR1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (201 Created)**
```json
{
  "message": "Application submitted successfully",
  "application_id": "APP1",
  "pet_profile_id": "PR1",
  "status": "pending",
  "created_at": "2026-07-05T12:00:00.000Z"
}
```

**Validation Rules:**
- Adopter must have an existing adoption form (submit via `POST /adoption-forms/submit` first)
- Pet must exist in MongoDB and have status `available`
- Duplicate applications for the same pet are not allowed
- Pet status is updated to `in_process` on successful application

**AI Cross-Evaluation:**
- Uses the LLM to evaluate 15 fields across main criteria and logistics
- Each field scored 0 or 1 (max 15 total)
- Main score: sum of 11 main fields (compatibility, housing, lifestyle, etc.)
- Logistics score: sum of 4 logistics fields (transport, costs, time, paperwork)
- AI justification text explaining the evaluation
- Scores are recalculated server-side from the breakdown to ensure accuracy
- If AI returns fewer than 15 fields, padded with "Unavailable" placeholders (points=0)

**Error Responses**
- `403 Forbidden`: User role is not `adopter`
- `400 Bad Request`: Missing adoption form, pet not available, or duplicate application
- `404 Not Found`: Pet not found
- `503 Service Unavailable`: AI service error
- `500 Internal Server Error`: Unexpected server error
- `401 Unauthorized`: Missing or invalid token

---

### Get My Applications

**GET** `/applications/me`

Retrieves all adoption applications for the authenticated adopter, including full pet profile data.

**Authorization:** `Adopter` role required

**Request**
```http
GET /applications/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**
```json
{
  "applications": [
    {
      "application_id": "APP1",
      "user_id": 2,
      "pet_profile_id": "PR1",
      "status": "pending",
      "total_score": 10,
      "total_max_score": 15,
      "main_score": 8,
      "main_max_score": 11,
      "logistics_education_score": 2,
      "logistics_education_max_score": 4,
      "ai_breakdown": [
        {"section": "Main Criteria", "field": "Pet Compatibility", "points": 1, "max_points": 1, "evaluation": "Good match with current pets"},
        {"section": "Main Criteria", "field": "Housing Suitability", "points": 1, "max_points": 1, "evaluation": "Apartment with natural space"},
        {"section": "Main Criteria", "field": "Lifestyle Match", "points": 1, "max_points": 1, "evaluation": "Energy level matches"},
        {"section": "Main Criteria", "field": "Family Dynamics", "points": 1, "max_points": 1, "evaluation": "Good with children"},
        {"section": "Main Criteria", "field": "Commitment Level", "points": 1, "max_points": 1, "evaluation": "Long-term commitment confirmed"},
        {"section": "Main Criteria", "field": "Pet Care Knowledge", "points": 1, "max_points": 1, "evaluation": "Previous pet experience"},
        {"section": "Main Criteria", "field": "Responsibility Indicators", "points": 1, "max_points": 1, "evaluation": "Employed and stable"},
        {"section": "Main Criteria", "field": "Sleeping Arrangements", "points": 0, "max_points": 1, "evaluation": "Indoor sleeping"},
        {"section": "Main Criteria", "field": "Behavior & Training", "points": 0, "max_points": 1, "evaluation": "Will use positive education"},
        {"section": "Main Criteria", "field": "Emergency Preparedness", "points": 0, "max_points": 1, "evaluation": "Has emergency plan"},
        {"section": "Main Criteria", "field": "Motivation & Intent", "points": 1, "max_points": 1, "evaluation": "Strong motivation to adopt"},
        {"section": "Logistics & Education", "field": "Daily Time Dedication", "points": 1, "max_points": 1, "evaluation": "2-6 hours daily"},
        {"section": "Logistics & Education", "field": "Financial Capacity", "points": 0, "max_points": 1, "evaluation": "Employed"},
        {"section": "Logistics & Education", "field": "Adoption Process Knowledge", "points": 0, "max_points": 1, "evaluation": "Familiar with process"},
        {"section": "Logistics & Education", "field": "Transport & Accessibility", "points": 1, "max_points": 1, "evaluation": "Accessible location"}
      ],
      "ai_justification": "The applicant demonstrates strong compatibility with the pet...",
      "created_at": "2026-07-05T12:00:00.000Z",
      "pet": {
        "profile_id": "PR1",
        "title": "Buddy: Your new best friend",
        "tags": ["#Peludo", "#Juguetón"],
        "emotional_description": "Buddy is a special being looking for a loving home...",
        "status": "in_process",
        "creation_date": "2026-06-18T05:53:30.061000",
        "pet": {
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
      }
    }
  ],
  "count": 1
}
```

**Scoring Breakdown:**
- **Main Criteria** (11 fields, max 11 points): Pet Compatibility, Housing Suitability, Lifestyle Match, Family Dynamics, Commitment Level, Pet Care Knowledge, Responsibility Indicators, Sleeping Arrangements, Behavior & Training, Emergency Preparedness, Motivation & Intent
- **Logistics & Education** (4 fields, max 4 points): Daily Time Dedication, Financial Capacity, Adoption Process Knowledge, Transport & Accessibility
- **Total**: Sum of all 15 fields (max 15 points)

**Error Responses**
- `403 Forbidden`: User role is not `adopter`
- `500 Internal Server Error`: Unexpected server error
- `401 Unauthorized`: Missing or invalid token

---

## Favorite Pets

The favorites system allows adopters to save and manage their favorite pets. Favorites are stored in PostgreSQL (relational) while pet profile data is fetched from MongoDB.

**Base URL:** `/adopter/favorites`

### Add Favorite

**POST** `/adopter/favorites/{pet_profile_id}`

Adds a pet to the authenticated adopter's favorites. Validates that the pet profile exists in MongoDB before creating the favorite.

**Authorization:** `Adopter` role required

**Request**
```http
POST /adopter/favorites/PR1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (201 Created)**
```json
{
  "message": "Pet added to favorites",
  "favorite": {
    "favorite_id": 1,
    "user_id": 2,
    "pet_profile_id": "PR1"
  }
}
```

**Error Responses**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User role is not "adopter"
- `404 Not Found`: Pet profile not found in MongoDB
- `409 Conflict`: Pet already in favorites

### Remove Favorite

**DELETE** `/adopter/favorites/{pet_profile_id}`

Removes a pet from the authenticated adopter's favorites.

**Authorization:** `Adopter` role required

**Request**
```http
DELETE /adopter/favorites/PR1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**
```json
{
  "message": "Pet removed from favorites"
}
```

**Error Responses**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User role is not "adopter"
- `404 Not Found`: Favorite not found

### List Favorites

**GET** `/adopter/favorites/`

Returns all favorites for the authenticated adopter, including full pet profile data from MongoDB.

**Authorization:** `Adopter` role required

**Request**
```http
GET /adopter/favorites/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**
```json
{
  "favorites": [
    {
      "favorite_id": 1,
      "user_id": 2,
      "pet_profile_id": "PR1",
      "pet": {
        "profile_id": "PR1",
        "title": "Buddy: Your new best friend",
        "tags": ["#Peludo", "#Juguetón"],
        "emotional_description": "Buddy is a special being...",
        "status": "available",
        "creation_date": "2026-06-18T05:53:30.061000",
        "pet": {
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
      }
    }
  ],
  "count": 1
}
```

**Error Responses**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User role is not "adopter"

---

## Backblaze B2 Image Upload

The application uses Backblaze B2 cloud storage for image upload:

- **Admin-only access**: Only users with admin role can upload images
- **UUID filenames**: Unique filenames prevent conflicts
- **Automatic URL generation**: Public URLs are generated automatically
- **Bucket validation**: Checks bucket existence before upload
- **Image type validation**: Only image files are accepted

**Endpoint:**
```http
POST /backblaze/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <image_file>
```

**Request**
```http
POST /backblaze/upload
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

file: dog.jpg
```

**Response (201 Created)**
```json
{
  "message": "Image uploaded successfully",
  "image_url": "https://f000.backblazeb2.com/file/bucket-name/dog-12345.jpg"
}
```

**Error Responses**
- `403 Forbidden`: User role is not "admin"
- `400 Bad Request`: Invalid file type (not an image)
- `503 Service Unavailable`: Backblaze bucket not found or not accessible
- `500 Internal Server Error`: Failed to upload image

**Configuration:**
- `BACKBLAZE_KEY_ID`: Backblaze application key ID
- `BACKBLAZE_APPLICATION_KEY`: Backblaze application key
- `BACKBLAZE_BUCKET_NAME`: Backblaze bucket name

For complete documentation, refer to `docs/README_BACKBLAZE.md`.

## Foundation Info

The foundation info system stores the organization's legal and contact information as a singleton record in PostgreSQL.

**Base URL:** `/foundation`

### Create Foundation Info

**POST** `/foundation/`

Creates the foundation record. Only one record is allowed (singleton pattern).

**Authorization:** `Admin` role required

**Request Body**
```json
{
  "name": "Fundación Patitas Felices",
  "phone": "0993456789",
  "address": "Av. República E7-123 y Av. Amazonas, Quito",
  "email": "info@patitasfelices.ec",
  "legal_representative": "Carlos Andrés Mejía",
  "business_hours": "Lun-Vie 9:00-18:00, Sáb 9:00-13:00"
}
```

**Response (201 Created)**
```json
{
  "message": "Foundation created successfully",
  "foundation_id": 1
}
```

**Validation Rules:**
- `name`, `legal_representative`: Only letters allowed (including accented characters and ñ)
- `phone`: Exactly 10 digits, must start with "09" (Ecuador mobile)
- `address`: Letters, numbers, dots, commas, dashes, slashes, and hash
- `email`: Valid email format
- `business_hours`: Letters, numbers, dots, commas, colons, and dashes

**Error Responses**
- `403 Forbidden`: User role is not "admin"
- `409 Conflict`: Foundation already exists
- `422 Unprocessable Entity`: Validation error

### Get Foundation Info

**GET** `/foundation/`

Retrieves the foundation's information. Public endpoint (no authentication required).

**Response (200 OK)**
```json
{
  "foundation_id": 1,
  "name": "Fundación Patitas Felices",
  "phone": "0993456789",
  "address": "Av. República E7-123 y Av. Amazonas, Quito",
  "email": "info@patitasfelices.ec",
  "legal_representative": "Carlos Andrés Mejía",
  "business_hours": "Lun-Vie 9:00-18:00, Sáb 9:00-13:00"
}
```

**Error Responses**
- `404 Not Found`: Foundation not created yet

### Update Foundation Info

**PUT** `/foundation/`

Updates the foundation's information. All fields are optional in the update request.

**Authorization:** `Admin` role required

**Request Body** *(all fields optional)*
```json
{
  "phone": "0998887777",
  "business_hours": "Lun-Vie 8:00-17:00"
}
```

**Response (200 OK)**
```json
{
  "message": "Foundation updated successfully",
  "foundation_id": 1
}
```

**Error Responses**
- `403 Forbidden`: User role is not "admin"
- `404 Not Found`: Foundation not created yet
- `422 Unprocessable Entity`: Validation error

---

## Pet Management System

The application includes a comprehensive pet management system with AI-powered profile generation using BLIP (image captioning) and the LLM (text enrichment).

### Pet Registration with AI

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
  "vaccines_up_to_date": ["rabies", "parvovirus", "distemper"],
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
  "profile": {
    "id": "PR1",
    "title": "Buddy: Your new best friend",
    "tags": ["#Peludo", "#Juguetón", "#AmigoPeludo"],
    "emotional_description": "Buddy is a special being looking for a loving home...",
    "status": "available",
    "creation_date": "2026-06-18T05:53:30.061000",
    "pet": {
      "name": "Buddy",
      "pet_image_url": "https://example.com/dog.jpg",
      "animal_breed": ["dog", "Golden Retriever"],
      "age": 3,
      "gender": "male",
      "is_sterilized": true,
      "vaccines_up_to_date": ["rabies", "parvovirus", "distemper"],
      "dewormed": true,
      "weight_kg": 8.5,
      "special_conditions": [],
      "brief_description": "Friendly dog looking for a home"
    }
  }
}
```

**AI Integration:**
- BLIP model generates image description from pet photo
- The LLM enriches profile with engaging title, hashtags, and emotional description
- All AI-generated content is stored in MongoDB `pet_profiles` collection

**Validation Rules:**
- Age: 0-20 years (realistic range for pets)
- Weight: 0-45 kg (realistic range for pets)
- Image URL: Must be valid HTTP/HTTPS URL and is mandatory
- Animal Breed: First element must be "dog" or "cat"
- Gender: Must be "male" or "female"
- Vaccines: Validated against animal type (dog vs cat vaccines)

### Pet Update (Including AI Fields)

**Request**
```http
PUT /pets/{profile_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Buddy",
  "age": 4,
  "is_sterilized": false,
  "weight_kg": 9.0,
  "special_conditions": ["Needs daily exercise"],
  "brief_description": "Active dog looking for an active family",
  "title": "Buddy: Your active companion",
  "tags": ["#Peludo", "#Juguetón", "#Explorador"],
  "emotional_description": "Buddy is an energetic dog looking for an active family..."
}
```

**Response (200 OK)**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "PR1",
    "title": "Buddy: Your active companion",
    "tags": ["#Peludo", "#Juguetón", "#Explorador"],
    "emotional_description": "Buddy is an energetic dog looking for an active family...",
    "status": "available",
    "creation_date": "2026-06-18T05:53:30.061000",
    "pet": {
      "name": "Buddy",
      "pet_image_url": "https://example.com/dog.jpg",
      "animal_breed": ["dog", "Golden Retriever"],
      "age": 4,
      "gender": "male",
      "is_sterilized": false,
      "vaccines_up_to_date": ["rabies", "parvovirus", "distemper"],
      "dewormed": true,
      "weight_kg": 9.0,
      "special_conditions": ["Needs daily exercise"],
      "brief_description": "Active dog looking for an active family"
    }
  }
}
```

**Allowed Fields for Update:**
- Pet fields: name, age, is_sterilized, vaccines_up_to_date, dewormed, weight_kg, special_conditions, brief_description
- AI fields: title, tags, emotional_description (optional, for manual editing)

**Note:** Empty strings or whitespace-only values are ignored and the original value is preserved.

### Pet Regenerate AI Content

**Request**
```http
POST /pets/{profile_id}/regenerate
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**
```json
{
  "message": "Profile regenerated successfully",
  "profile": {
    "id": "PR1",
    "title": "Buddy: Your new best friend",
    "tags": ["#Peludo", "#Juguetón", "#AmigoPeludo"],
    "emotional_description": "Buddy is a special being looking for a loving home...",
    "status": "available",
    "creation_date": "2026-06-18T05:53:30.061000",
    "pet": {
      "name": "Buddy",
      "pet_image_url": "https://example.com/dog.jpg",
      "animal_breed": ["dog", "Golden Retriever"],
      "age": 4,
      "gender": "male",
      "is_sterilized": false,
      "vaccines_up_to_date": ["rabies", "parvovirus", "distemper"],
      "dewormed": true,
      "weight_kg": 9.0,
      "special_conditions": ["Needs daily exercise"],
      "brief_description": "Active dog looking for an active family"
    }
  }
}
```

**Note:** This endpoint regenerates only the AI-generated fields (title, tags, emotional_description) via the LLM. Pet fields remain unchanged.

### Pet Listing

**Request**
```http
GET /pets/
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**
```json
{
  "pets": [
    {
      "profile_id": "PR1",
      "title": "Buddy: Your new best friend",
      "tags": ["#Peludo", "#Juguetón", "#AmigoPeludo"],
      "emotional_description": "Buddy is a special being looking for a loving home...",
      "status": "available",
      "creation_date": "2026-06-18T05:53:30.061000",
      "pet": {
        "name": "Buddy",
        "pet_image_url": "https://example.com/dog.jpg",
        "animal_breed": ["dog", "Golden Retriever"],
        "age": 3,
        "gender": "male",
        "is_sterilized": true,
        "vaccines_up_to_date": ["rabies", "parvovirus", "distemper"],
        "dewormed": true,
        "weight_kg": 8.5,
        "special_conditions": [],
        "brief_description": "Friendly dog looking for a home"
      }
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
- `type`: String (admin/adopter/user)
- `adopter`: Relationship to Adopter (one-to-one)

### Admin
- `user_id`: Integer (Foreign Key to User, Primary Key)
- Uses composition pattern with User table

### Adopter
- `user_id`: Integer (Foreign Key to User, Primary Key)
- `created_at`: DateTime
- Uses composition pattern with User table

### Favorite
- `favorite_id`: Integer (Primary Key, auto-increment)
- `user_id`: Integer (Foreign Key to User, NOT NULL)
- `pet_profile_id`: String (VARCHAR, NOT NULL)
- Unique constraint on (`user_id`, `pet_profile_id`)

### Pet
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

### PetProfile (MongoDB)
- `id`: String (Primary Key, auto-generated: PR####)
- `title`: String (AI-generated engaging title)
- `tags`: List[String] (AI-generated hashtags)
- `emotional_description`: String (AI-generated emotional description)
- `status`: String ("available", "in_process", "adopted")
- `creation_date`: DateTime
- `pet`: Object (Pet basic information)

### Foundation
- `foundation_id`: Integer (Primary Key, auto-increment)
- `name`: String — Foundation legal name
- `phone`: String — Contact phone number (10 digits, starts with 09)
- `address`: String — Physical address
- `email`: String — Official email
- `legal_representative`: String — Legal representative name
- `business_hours`: String — Business hours

### AdoptionForm
- `form_id`: String (Primary Key, auto-generated: AF####)
- `user_id`: Integer (Foreign Key to User)
- `submission_date`: DateTime
- `neighborhood`: String
- `address`: String
- `employment_status`: String
- `employment_status_other`: String (Optional)
- `housing_type`: String
- `housing_type_other`: String (Optional)
- `has_natural_space`: Boolean
- `has_pets`: Boolean
- `current_pets_details`: String (Optional)
- `household_energy`: String
- `has_children`: Boolean
- `children_ages`: List[int] (Optional)
- `long_term_commitment`: Boolean
- `preferred_species`: String
- `preferred_gender`: String
- `preferred_energy`: String
- `daily_time_dedication`: String (>2, 2-6, 6+)
- `sleeping_location`: String
- `sleeping_location_other`: String (Optional)
- `behavior_approach`: String
- `behavior_approach_other`: String (Optional)
- `emergency_plan`: String
- `emergency_plan_other`: String (Optional)
- `motivation`: String

### Application (MongoDB)
- `application_id`: String (Primary Key, auto-generated: APP####)
- `user_id`: Integer
- `pet_profile_id`: String
- `form_id`: String (Foreign Key to AdoptionForm)
- `adopter_name`: String (Optional, fetched from PostgreSQL on creation)
- `status`: String ("pending", "approved", "rejected")
- `total_score`: Integer (sum of all 15 fields, max 15)
- `total_max_score`: Integer (always 15)
- `main_score`: Integer (sum of 11 main fields, max 11)
- `main_max_score`: Integer (always 11)
- `logistics_education_score`: Integer (sum of 4 logistics fields, max 4)
- `logistics_education_max_score`: Integer (always 4)
- `ai_breakdown`: List[Object] (15 items: section, field, points, max_points, evaluation)
- `ai_justification`: String (AI evaluation text)
- `created_at`: DateTime
- `needs_manual_review`: Bool (false if AI evaluated, true if AI failed and requires manual review)

## Development Notes

- Models use composition pattern instead of inheritance for Admin and Adopter
- User table contains base user information with type field
- Admin and Adopter tables reference User via foreign key with CASCADE delete
- Adopter table includes `created_at` field for registration timestamp
- PostgreSQL connection is configured in `app/database/postgres/postgres_db.py`
- Endpoints use dependency injection to obtain the database session
- All error responses follow a consistent format with `error_code`, `message`, and `details`
- BLIP model is loaded eagerly at startup; the LLM is called via external API

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
  - DEBUG: Default terminal color
  - INFO: Green
  - WARNING: Yellow
  - ERROR: Red
- **File-based logging**: Logs are written to files for persistent storage
  - `logs/app.log`: All logs (INFO and above)
  - `logs/error.log`: Error logs only (ERROR and above)
- **Log rotation**: Files are rotated when they reach 500 MB
- **Log retention**: Logs are retained for 10 days (app.log) or 30 days (error.log)

### Log Levels Usage

We manage four levels in the backend to categorize events properly and avoid clutter:

1. **DEBUG**: Detailed information, typically of interest only when diagnosing problems. Successful field/input validations (e.g., Pydantic schema validator outputs) are logged as `DEBUG` to keep the logs clean in production.
2. **INFO**: General operational events showing application flow (e.g., successful user/pet registration, successful logins, OAuth callbacks).
3. **WARNING**: Expected non-critical exceptions or bad requests from clients/users (e.g., schema validation failures, attempting to register an existing email, invalid login credentials).
4. **ERROR**: System exceptions, server-side errors, or integration failures (e.g., MongoDB insertion failure, Google OAuth api redirect failed, database connection errors).

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
logger.debug("Validating name: John Doe")
logger.info("User registered successfully")
logger.warning("Registration failed - Email already registered")
logger.error("Failed to insert profile into MongoDB")
```