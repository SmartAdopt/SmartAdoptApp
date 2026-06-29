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
│   │   ├── models/          # SQLAlchemy ORM models (User, Admin, Adopter, Pet) and MongoDB models
│   │   │   ├── user/            # User models (User, Admin, Adopter)
│   │   │   ├── pet/             # Pet models (Python models for MongoDB)
│   │   │   └── adoption_form/  # Adoption form models (Python models for MongoDB)
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth_routes.py         # Authentication endpoints
│   │   │   ├── admin_routes.py        # Admin-protected endpoints
│   │   │   ├── adopter_routes.py      # Adopter-protected endpoints
│   │   │   ├── backblaze_routes.py   # Backblaze B2 image upload endpoints
│   │   │   ├── pet_routes.py          # Pet management endpoints
│   │   │   └── adoption_form_routes.py # Adoption form endpoints
│   │   ├── schemas/         # Pydantic schemas for validation
│   │   │   ├── auth_schemas.py            # Authentication schemas
│   │   │   ├── backblaze_schemas.py       # Backblaze B2 schemas
│   │   │   ├── pet_schemas.py             # Pet management schemas
│   │   │   ├── pet_profile_schemas.py     # Pet profile schemas
│   │   │   └── adoption_form_schemas.py   # Adoption form schemas
│   │   ├── services/        # Business logic layer
│   │   │   ├── auth_service.py        # Authentication services
│   │   │   ├── backblaze_service.py   # Backblaze B2 service
│   │   │   ├── pet_service.py          # Pet management service
│   │   │   ├── ai_service.py           # AI service (BLIP + Llama 3 8B)
│   │   │   └── adoption_form_service.py # Adoption form service (MongoDB)
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
│   │   └── README_AI.md     # Complete AI integration documentation (BLIP + Llama 3 8B)
│   ├── tests/              # Backend tests
│   │   ├── conftest.py              # Test configuration
│   │   ├── test_auth.py             # Authentication tests
│   │   ├── test_google_oauth.py      # Google OAuth tests
│   │   ├── test_admin_routes.py     # Admin routes tests
│   │   ├── test_adopter_routes.py   # Adopter routes tests
│   │   ├── test_backblaze_routes.py # Backblaze B2 tests
│   │   ├── test_pet.py              # Pet management tests
│   │   ├── test_adoption_form.py    # Adoption form tests
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
- **huggingface-hub** - Hugging Face Hub client for Llama 3 8B
- **transformers** - NLP library for BLIP and Llama 3 8B
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

### Run All Tests
```bash
# Run all backend tests
python -m pytest backend/tests/ -v

# Run with coverage report
python -m pytest backend/ --cov=backend --cov-report=term-missing
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

## Pet Management System

The application includes a comprehensive pet management system with AI-powered profile generation using BLIP and Llama 3 8B models.

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
    "tags": ["#Adoptable", "#LoyalFriend", "#ReadyForLove"],
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
- Llama 3 8B model enriches profile with engaging title, hashtags, and emotional description
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
  "age": 4,
  "is_sterilized": false,
  "weight_kg": 9.0,
  "special_conditions": ["Needs daily exercise"],
  "brief_description": "Active dog looking for an active family",
  "title": "Buddy: Your active companion",
  "tags": ["#Adoptable", "#Active", "#NeedsExercise"],
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
    "tags": ["#Adoptable", "#Active", "#NeedsExercise"],
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
- Pet fields: age, is_sterilized, vaccines_up_to_date, dewormed, weight_kg, special_conditions, brief_description
- AI fields: title, tags, emotional_description (optional, for manual editing)

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
    "tags": ["#Adoptable", "#LoyalFriend", "#ReadyForLove"],
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

**Note:** This endpoint regenerates only the AI-generated fields (title, tags, emotional_description) using BLIP and Llama 3 8B. Pet fields remain unchanged.

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
      "tags": ["#Adoptable", "#LoyalFriend", "#ReadyForLove"],
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


## Development Notes

- Models use composition pattern instead of inheritance for Admin and Adopter
- User table contains base user information with type field
- Admin and Adopter tables reference User via foreign key with CASCADE delete
- Adopter table includes `created_at` field for registration timestamp
- PostgreSQL connection is configured in `app/database/postgres/postgres_db.py`
- Endpoints use dependency injection to obtain the database session
- All error responses follow a consistent format with `error_code`, `message`, and `details`
- AI models (BLIP, Llama 3 8B) are loaded eagerly at startup (no lazy loading)

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
