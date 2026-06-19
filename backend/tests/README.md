# Automated Testing Documentation (QA)

This document describes the architecture and purpose of the backend automated test suite (FastAPI), implemented with the **Pytest** framework. The goal of these tests is to validate the system's behavior under different scenarios (Happy Paths, Negative Testing, and Security Cases), thus guaranteeing Software Quality Assurance (QA) standards.

## Running Tests

### Run All Tests
```bash
# Run all backend tests
python -m pytest backend/tests/ -v

# Run with coverage report
python -m pytest backend/ --cov=backend --cov-report=term-missing
```

### Run Specific Test Files
```bash
# Run authentication tests
python -m pytest backend/tests/test_auth.py -v

# Run Google OAuth tests
python -m pytest backend/tests/test_google_oauth.py -v

# Run main test
python -m pytest backend/tests/test_main.py -v

# Run admin routes tests
python -m pytest backend/tests/test_admin_routes.py -v

# Run adopter routes tests
python -m pytest backend/tests/test_adopter_routes.py -v

# Run Google OAuth utils tests
python -m pytest backend/tests/test_google_oauth_utils.py -v

# Run Backblaze routes tests
python -m pytest backend/tests/test_backblaze_routes.py -v
```


### Test Coverage
The backend currently has 90% code coverage with 45 tests passing:
The backend currently has 90% code coverage with 39 tests passing:
- 13 authentication tests (registration, login, refresh tokens, blacklist)
- 4 admin routes tests
- 4 adopter routes tests
- 3 Google OAuth tests
- 1 Google OAuth utils test
- 1 main test
- 13 additional auth tests (error handling, token validation)
- 6 Backblaze B2 tests (image upload, authorization, validation)

---

Below is a detailed explanation, segment by segment, of the constructed test files.

---

## 1. Test Environment Configuration: `conftest.py`

In the Pytest ecosystem, the `conftest.py` file acts as the main configurator. Its function is to provision the necessary resources (such as temporary databases and simulated web clients) before the tests begin. These shared resources are called **fixtures**.

### a) Environment Variables Setup
```python
import os

# Load environment variables from .env file
load_dotenv(BASE_DIR / ".env")

# Set environment variables for CI/CD if not already set
# This ensures tests work in CI/CD without .env file
if not os.getenv("SECRET_KEY"):
    os.environ["SECRET_KEY"] = "test_secret_key_for_ci_cd"
if not os.getenv("ENV"):
    os.environ["ENV"] = "development"
# ... (other variables)
```
**Purpose:**
The test suite automatically sets environment variables using `os.environ` if they are not already set. This ensures that:
- **Local development:** Uses variables from `.env` file if it exists
- **CI/CD environments:** Uses test values automatically, no `.env` file required
- **Centralized configuration:** All configuration is managed through `app/config.py`

### b) Imports and SQLite Database Configuration
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# ... FastAPI and models imports ...

# Path for the temporary in-memory database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Database engine creation
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```
**Purpose:** 
To avoid altering or corrupting data in the production or development database (PostgreSQL), a temporary database is configured using **SQLite** (`test.db`). The engine (`engine`) and the session (`TestingSessionLocal`) are responsible for routing all test operations to this isolated database.

### b) Fixture: Database Initialization (`setup_database`)
```python
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Construction of all tables
    Base.metadata.create_all(bind=engine)
    yield
    # Destruction of tables upon completion
    Base.metadata.drop_all(bind=engine)
```
**Purpose:**
The `@pytest.fixture(autouse=True)` decorator instructs Pytest to execute this function automatically at the start of the test session. The function is responsible for creating the table structure in the temporary database. The `yield` instruction pauses execution to allow the tests to run. Once all tests are concluded, the function resumes and executes the removal of the tables, ensuring a clean environment.

### c) Fixture: Database Session (`db_session`)
```python
@pytest.fixture(scope="function")
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
```
**Purpose:**
Provides an active connection to the test database for each test function individually (`scope="function"`). Upon completion of the specific test, it ensures that the connection is closed correctly in the `finally` block, preventing memory leaks.

### d) Fixture: Test Client (`client`)
```python
@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    # Overriding the main FastAPI dependency
    app.dependency_overrides[get_db] = override_get_db
    
    # Creation of the simulated web client
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()
```
**Purpose:**
This block is fundamental for integration. FastAPI, by default, seeks to inject the PostgreSQL connection into the routes via the `get_db` function. This fixture "intercepts" that behavior through `dependency_overrides`, forcing the application to use the SQLite session (`db_session`). Finally, it returns a `TestClient`, a tool that allows simulating web requests (GET, POST) to our endpoints without the need to start the server.

---

## 2. Authentication Module Tests: `test_auth.py`

This file contains the validation logic for the registration, login, and protected routes endpoints.

### a) Test Data Constant
```python
TEST_USER = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@test.com",
    "phone_number": "1234567890",
    "password": "securepassword123",
    "requested_role": "adopter"
}
```
**Purpose:** 
Standardizes the input data. Providing a reusable dictionary prevents code duplication and ensures consistency in tests that require the creation of a user.

### b) Functional Test: Successful Registration
```python
def test_register_user_success(client):
    response = client.post("/auth/register", json=TEST_USER)
    
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "User registered successfully"
    assert "user_id" in data
```
**Purpose:** 
Validates the Happy Path of registration. It confirms that when correct data is sent, the system creates the user and responds appropriately.
* **HTTP 201 (Created):** This is the standard web status code to indicate that a request has succeeded and, as a result, a new resource has been created (in this case, a new user in the database).

### c) Negative Test: Registration with Existing Email
```python
def test_register_existing_email(client):
    client.post("/auth/register", json=TEST_USER)
    response = client.post("/auth/register", json=TEST_USER)
    
    assert response.status_code in [409, 400]
```
**Purpose:** 
Ensures data integrity. A user is registered, and deliberately, an attempt is made to register again using the same email.
* **HTTP 409 (Conflict):** Indicates that the request could not be processed due to a conflict with the current state of the resource (the email already exists).
* **HTTP 400 (Bad Request):** Indicates that the syntax of the request is incorrect or contains validations that the server rejects.

### d) Negative Test: Incomplete Form Submission
```python
def test_register_incomplete_form(client):
    incomplete_user = {
        "first_name": "Jane",
        "email": "jane@test.com",
    }
    response = client.post("/auth/register", json=incomplete_user)
    
    assert response.status_code == 422
```
**Purpose:** 
Verifies that the schema validation rules (handled by Pydantic) work correctly. 
* **HTTP 422 (Unprocessable Entity):** Means that the server understood the format of the request, but could not process it because the content (the form) is semantically incorrect or incomplete (missing mandatory fields like the password).

### e) Security Test: Password Encryption
```python
def test_password_is_encrypted(client, db_session):
    # ... prior registration with password "my_secret_password" ...
    db_user = db_session.query(User).filter(User.email == new_email).first()
    
    assert db_user.password_hash != "my_secret_password"
    assert db_user.password_hash.startswith("$2")
```
**Purpose:** 
Meets the critical security requirement stipulated by QA. Instead of verifying the API response, the test queries the database directly and asserts (using `assert`) that the password is not stored in plain text. The presence of the `$2` prefix corroborates that the encryption was performed using the **bcrypt** cryptographic algorithm.

### f) Functional Test: Successful Login
```python
def test_login_user_success(client):
    # ... prior registration ...
    login_credentials = {
        "email": "login.test@test.com",
        "password": user_data["password"]
    }
    response = client.post("/auth/login", json=login_credentials)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
```
**Purpose:** 
Validates the legitimate authentication process. After creating the user, it attempts to access with their credentials.
* **HTTP 200 (OK):** This is the standard success code on the web. It indicates that the request processed everything correctly. Additionally, it verifies that the response includes a valid `access_token` (JWT).

### g) Negative Test: Incorrect Credentials
```python
def test_login_wrong_credentials(client):
    login_credentials = {
        "email": "nonexistent@test.com",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", json=login_credentials)
    
    assert response.status_code == 401
```
**Purpose:** 
Confirms access security. Attempts to log in with a non-existent email or invalid password.
* **HTTP 401 (Unauthorized):** Clearly indicates that the client lacks valid authentication credentials for the requested resource.

---

## 3. Google OAuth Module Tests: `test_google_oauth.py`

This file contains the validation logic for Google OAuth authentication, including callback handling for new users, existing users, admin role registration, and error handling.

### a) Mock Google User Info
```python
MOCK_GOOGLE_USER_INFO = {
    "email": "google.user@gmail.com",
    "given_name": "Google",
    "family_name": "User",
    "sub": "123456789",
}
```
**Purpose:** 
Standardizes mock Google user data for OAuth tests. This prevents code duplication and ensures consistency in tests that require simulating Google OAuth responses.

### b) Functional Test: OAuth Callback for New User (Auto-registration)
```python
@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_callback_new_user(mock_get_google_oauth, client, db_session):
    # Mock OAuth client and token response
    # ...
    response = client.get("/auth/google/callback?code=test_code&role=adopter")
    
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "adopter"
    assert "access_token" in data
```
**Purpose:** 
Validates the Happy Path of Google OAuth for new users. It confirms that when a new user authenticates via Google, the system automatically registers them and responds with a JWT token.
* **HTTP 200 (OK):** Indicates successful OAuth callback processing and user auto-registration.

### c) Functional Test: OAuth Callback for Existing User
```python
@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_callback_existing_user(mock_get_google_oauth, client, db_session):
    # Create existing user first
    # ...
    # Mock OAuth client and token response
    # ...
    response = client.get("/auth/google/callback?code=test_code&role=adopter")
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Login successful"
```
**Purpose:** 
Validates that existing users can log in via Google OAuth without being registered again. It confirms that the system correctly identifies existing users and returns a login response instead of a registration response.

### d) Functional Test: OAuth Callback with Admin Role
```python
@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_callback_admin_role(mock_get_google_oauth, client, db_session):
    # Mock OAuth client and token response
    # ...
    response = client.get("/auth/google/callback?code=test_code&role=admin")
    
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"
```
**Purpose:** 
Validates that the role parameter is respected during OAuth auto-registration. It confirms that when `role=admin` is specified, the user is created with admin privileges.

### e) Negative Test: OAuth Callback Error Handling
```python
@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_callback_error(mock_get_google_oauth, client):
    # Mock OAuth client to raise exception
    # ...
    response = client.get("/auth/google/callback?code=test_code&role=adopter")
    
    assert response.status_code == 401
```
**Purpose:** 
Validates error handling in the OAuth callback. It confirms that when OAuth fails (e.g., invalid token, network error), the system returns an appropriate error response.
* **HTTP 401 (Unauthorized):** Indicates that Google authentication failed.

### f) Functional Test: OAuth Login Redirect
```python
@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_login_redirect(mock_get_google_oauth, client):
    # Mock OAuth client and authorize_redirect
    # ...
    client.get("/auth/login/google?role=adopter")
    
    # Verify that authorize_redirect was called
    mock_google.authorize_redirect.assert_called_once()
```
**Purpose:** 
Validates that the OAuth login endpoint correctly initiates the OAuth flow by calling `authorize_redirect`. It confirms that the endpoint properly redirects users to Google OAuth.

### g) Negative Test: OAuth Login Redirect Error
```python
@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_login_redirect_error(mock_get_google_oauth, client):
    # Mock OAuth client to raise exception
    # ...
    response = client.get("/auth/login/google?role=adopter")
    
    assert response.status_code == 302
```
**Purpose:** 
Validates error handling in the OAuth login endpoint. It confirms that when OAuth fails to initialize, the system returns an appropriate error response.
* **HTTP 302 (Found):** Indicates that the redirect failed with an error message.

---

## 4. Admin Routes Tests: `test_admin_routes.py`

This file contains validation logic for admin-specific endpoints, including dashboard access, role verification, and token validation.

### a) Functional Test: Admin Dashboard Success
```python
def test_admin_dashboard_success(client, db_session):
    # Create admin user and valid token
    # ...
    response = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
    
    assert response.status_code == 200
    assert data["message"] == "Welcome to Admin Dashboard"
```
**Purpose:** 
Validates that admin users can successfully access the admin dashboard with valid tokens.

### b) Negative Test: Unauthorized Role Access
```python
def test_admin_dashboard_unauthorized_role(client, db_session):
    # Create regular user with adopter role
    # ...
    response = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {adopter_token}"})
    
    assert response.status_code == 403
```
**Purpose:** 
Ensures that non-admin users cannot access admin endpoints.
* **HTTP 403 (Forbidden):** Indicates insufficient permissions.

### c) Negative Test: Blacklisted Token Access
```python
def test_admin_dashboard_with_blacklisted_token(client, db_session):
    # Add token to blacklist
    # ...
    response = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {blacklisted_token}"})
    
    assert response.status_code == 401
```
**Purpose:** 
Validates that blacklisted tokens are rejected for admin access.

---

## 5. Adopter Routes Tests: `test_adopter_routes.py`

This file contains validation logic for adopter-specific endpoints, including home access, role verification, and token validation.

### a) Functional Test: Adopter Home Success
```python
def test_adopter_home_success(client, db_session):
    # Create adopter user and valid token
    # ...
    response = client.get("/adopter/home", headers={"Authorization": f"Bearer {adopter_token}"})
    
    assert response.status_code == 200
    assert data["message"] == "Welcome to Adopter Home"
```
**Purpose:** 
Validates that adopter users can successfully access the adopter home with valid tokens.

### b) Negative Test: Unauthorized Role Access
```python
def test_adopter_home_unauthorized_role(client, db_session):
    # Create admin user
    # ...
    response = client.get("/adopter/home", headers={"Authorization": f"Bearer {admin_token}"})
    
    assert response.status_code == 403
```
**Purpose:** 
Ensures that non-adopter users cannot access adopter endpoints.

### c) Negative Test: Blacklisted Token Access
```python
def test_adopter_home_with_blacklisted_token(client, db_session):
    # Add token to blacklist
    # ...
    response = client.get("/adopter/home", headers={"Authorization": f"Bearer {blacklisted_token}"})
    
    assert response.status_code == 401
```
**Purpose:** 
Validates that blacklisted tokens are rejected for adopter access.

---

## 6. Google OAuth Utils Tests: `test_google_oauth_utils.py`

This file contains validation logic for Google OAuth utility functions.

### a) Functional Test: Get Google OAuth Instance
```python
def test_get_google_oauth():
    oauth_instance = get_google_oauth()
    
    assert oauth_instance is not None
    assert hasattr(oauth_instance, 'google')
```
**Purpose:** 
Validates that the Google OAuth instance is properly initialized and configured.

---

## 7. Refresh Token & Blacklist Tests (in `test_auth.py`)

Additional tests were added to validate the refresh token lifecycle and token blacklist functionality.

### a) Functional Test: Refresh Token Success
```python
def test_refresh_token_success(client, db_session):
    # Login to get tokens
    # ...
    response = client.post("/auth/refresh", headers={"Authorization": f"Bearer {access_token}"}, cookies={"refresh_token": refresh_token})
    
    assert response.status_code == 200
    assert "access_token" in response.json()
```
**Purpose:** 
Validates that refresh tokens can be used to obtain new access tokens.

### b) Negative Test: Refresh with Valid Access Token
```python
def test_refresh_token_rejects_valid_access_token(client, db_session):
    # Try to refresh with still-valid access token
    # ...
    assert response.status_code == 400
```
**Purpose:** 
Ensures that refresh is rejected when the access token is still valid.

### c) Functional Test: Logout with Blacklist
```python
def test_logout_with_blacklist(client, db_session):
    # Login and logout
    # ...
    response = client.post("/auth/logout", headers={"Authorization": f"Bearer {access_token}"}, cookies={"refresh_token": refresh_token})
    
    assert response.status_code == 200
```
**Purpose:** 
Validates that logout successfully adds tokens to the blacklist.

### d) Negative Test: Blacklisted Token Rejection
```python
def test_blacklisted_token_rejected_in_protected_endpoint(client, db_session):
    # Logout to blacklist token
    # ...
    response = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {blacklisted_token}"})
    
    assert response.status_code == 401
```
**Purpose:** 
Ensures that blacklisted tokens are rejected in protected endpoints.

---

## 8. Backblaze B2 Routes Tests: `test_backblaze_routes.py`

This file contains validation logic for Backblaze B2 cloud storage image upload, including authentication, authorization, file validation, and error handling.

### a) Functional Test: Successful Image Upload
```python
def test_backblaze_upload_success(client, db_session):
    # Create admin user and valid token
    # Mock Backblaze service
    # ...
    response = client.post(
        "/backblaze/upload",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("test.jpg", image_file, "image/jpeg")}
    )
    
    assert response.status_code == 201
    assert data["image_url"] == "https://f002.backblazeb2.com/file/test-bucket/uuid.jpg"
```
**Purpose:** 
Validates the Happy Path of image upload to Backblaze B2. It confirms that admin users can successfully upload images with valid tokens and mocked Backblaze service.
* **HTTP 201 (Created):** Indicates successful image upload.

### b) Negative Test: Unauthorized Role Upload
```python
def test_backblaze_upload_unauthorized_role(client, db_session):
    # Create regular user with adopter role
    # ...
    response = client.post(
        "/backblaze/upload",
        headers={"Authorization": f"Bearer {adopter_token}"},
        files={"file": ("test.jpg", image_file, "image/jpeg")}
    )
    
    assert response.status_code == 403
```
**Purpose:** 
Ensures that non-admin users cannot upload images.
* **HTTP 403 (Forbidden):** Indicates insufficient permissions.

### c) Negative Test: Upload Without Token
```python
def test_backblaze_upload_no_token(client):
    response = client.post(
        "/backblaze/upload",
        files={"file": ("test.jpg", image_file, "image/jpeg")}
    )
    
    assert response.status_code == 401
```
**Purpose:** 
Validates that upload requires authentication.
* **HTTP 401 (Unauthorized):** Indicates missing or invalid token.

### d) Negative Test: Invalid File Type
```python
def test_backblaze_upload_invalid_file_type(client, db_session):
    # Create admin user and valid token
    # ...
    response = client.post(
        "/backblaze/upload",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("test.pdf", image_file, "application/pdf")}
    )
    
    assert response.status_code == 400
```
**Purpose:** 
Ensures that only image files are accepted.
* **HTTP 400 (Bad Request):** Indicates invalid file type.

### e) Negative Test: Bucket Not Found
```python
def test_backblaze_upload_bucket_not_found(client, db_session):
    # Create admin user and valid token
    # Mock bucket_exists to return False
    # ...
    response = client.post(
        "/backblaze/upload",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("test.jpg", image_file, "image/jpeg")}
    )
    
    assert response.status_code == 503
```
**Purpose:** 
Validates error handling when Backblaze bucket is not accessible.
* **HTTP 503 (Service Unavailable):** Indicates bucket not found or not accessible.

### f) Negative Test: Service Error
```python
def test_backblaze_upload_service_error(client, db_session):
    # Create admin user and valid token
    # Mock upload to raise exception
    # ...
    response = client.post(
        "/backblaze/upload",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("test.jpg", image_file, "image/jpeg")}
    )
    
    assert response.status_code == 500
```
**Purpose:** 
Validates error handling when Backblaze service fails.
* **HTTP 500 (Internal Server Error):** Indicates upload service failure.

---

## 9. Redis Mock Implementation
## 8. Redis Mock Implementation

The test suite uses an in-memory mock Redis implementation to simulate Redis behavior without requiring a real Redis instance. This is configured in `conftest.py`:

```python
class MockRedis:
    def __init__(self):
        self.storage = {}
        self.blacklist = set()

    def setex(self, key, ttl, value):
        self.storage[key] = value

    def get(self, key):
        return self.storage.get(key)

    def delete(self, key):
        if key in self.storage:
            del self.storage[key]
        if key in self.blacklist:
            self.blacklist.remove(key)

    def exists(self, key):
        return 1 if key in self.storage or key in self.blacklist else 0
```

**Purpose:** 
Provides isolated testing environment without external dependencies, ensuring tests are fast, reliable, and can run in CI/CD pipelines.
