# Automated Testing Documentation (QA)

This document describes the architecture and purpose of the backend automated test suite (FastAPI), implemented with the **Pytest** framework. The goal of these tests is to validate the system's behavior under different scenarios (Happy Paths, Negative Testing, and Security Cases), thus guaranteeing Software Quality Assurance (QA) standards.

Below is a detailed explanation, segment by segment, of the constructed test files.

---

## 1. Test Environment Configuration: `conftest.py`

In the Pytest ecosystem, the `conftest.py` file acts as the main configurator. Its function is to provision the necessary resources (such as temporary databases and simulated web clients) before the tests begin. These shared resources are called **fixtures**.

### a) Imports and SQLite Database Configuration
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

### h) Comprehensive Test: Access to Protected Routes
```python
def test_protected_route_list_users(client):
    # 1. Request without token
    response_no_token = client.get("/auth/list")
    assert response_no_token.status_code == 401
    
    # 2. Obtaining valid token through Login
    # ...
    
    # 3. Request injecting the token into the Headers
    headers = {"Authorization": f"Bearer {token}"}
    response_with_token = client.get("/auth/list", headers=headers)
    
    assert response_with_token.status_code == 200
```
**Purpose:** 
Ensures that the security barrier of Private Endpoints (e.g., `/auth/list`) is impassable without authorization. 
1. First, it validates that an attempt without a token returns **HTTP 401 (Unauthorized)**.
2. Then, it obtains a legitimate JWT simulating a login.
3. Finally, it injects the JWT into the HTTP header (`Authorization: Bearer <token>`) and confirms that the server grants access returning **HTTP 200 (OK)**.
