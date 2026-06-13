from app.models.user import User

# --- Constants for testing ---
TEST_USER = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@test.com",
    "phone_number": "0912345678",
    "password": "Securepassword123",
    "requested_role": "adopter",
}


def test_register_user_success(client):
    # Test successful registration (Happy path)
    response = client.post("/auth/register", json=TEST_USER)

    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "User registered successfully"
    assert "user_id" in data


def test_register_existing_email(client):
    # Test registration with an already existing email (Negative path)
    # 1. Register the user for the first time
    client.post("/auth/register", json=TEST_USER)

    # 2. Try to register exactly the same user again
    response = client.post("/auth/register", json=TEST_USER)

    # Depending on the backend implementation, it might be 409 Conflict or 400 Bad Request
    assert response.status_code in [409, 400]
    data = response.json()
    assert (
        "Email already registered" in str(data)
        or "already registered" in str(data).lower()
    )


def test_register_incomplete_form(client):
    # Test registration with missing mandatory fields (Negative path)
    incomplete_user = {
        "first_name": "Jane",
        "email": "jane@test.com",
        # Missing last_name, password, etc.
    }

    response = client.post("/auth/register", json=incomplete_user)

    # Pydantic will throw a 422 Unprocessable Entity for missing required fields
    assert response.status_code == 422


def test_password_is_encrypted(client, db_session):
    # Test that the password is NOT saved in plain text in the database (Security test)
    new_email = "secure.user@test.com"
    user_data = TEST_USER.copy()
    user_data["email"] = new_email
    user_data["password"] = "My_secret_password123"

    # Register the user
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 201

    # Query the user directly from the database
    db_user = db_session.query(User).filter(User.email == new_email).first()

    assert db_user is not None
    # Verify the hash is NOT the plain text password
    assert db_user.password_hash != "my_secret_password"
    # Usually bcrypt hashes start with $2b$ or $2a$
    assert db_user.password_hash.startswith("$2")


def test_login_user_success(client):
    # Test successful login (Happy path)
    # 1. Ensure the user exists
    user_data = TEST_USER.copy()
    user_data["email"] = "login.test@test.com"
    client.post("/auth/register", json=user_data)

    # 2. Login with correct credentials
    login_credentials = {
        "email": "login.test@test.com",
        "password": user_data["password"],
    }
    response = client.post("/auth/login", json=login_credentials)

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["message"] == "Login successful"
    assert data["email"] == "login.test@test.com"


def test_login_wrong_credentials(client):
    # Test login with wrong password or unregistered email (Negative path)
    login_credentials = {"email": "nonexistent@test.com", "password": "wrongpassword"}
    response = client.post("/auth/login", json=login_credentials)

    # Should return 401 Unauthorized
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]["message"]
