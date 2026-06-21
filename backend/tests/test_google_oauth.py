from app.models.user.user import User
from unittest.mock import AsyncMock, patch, MagicMock

# --- Mock Google OAuth user info ---
MOCK_GOOGLE_USER_INFO = {
    "email": "google.user@gmail.com",
    "given_name": "Google",
    "family_name": "User",
    "sub": "123456789",
}


@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_callback_new_user(mock_get_google_oauth, client, db_session):
    # Test Google OAuth callback with a new user (Auto-registration) (Happy path)

    # Mock the OAuth instance
    mock_oauth = MagicMock()
    mock_google = AsyncMock()

    # Mock the token and user info response
    mock_token = {"access_token": "test_token"}
    mock_google.authorize_access_token = AsyncMock(return_value=mock_token)
    mock_google.parse_id_token = AsyncMock(return_value=MOCK_GOOGLE_USER_INFO)

    mock_oauth.google = mock_google
    mock_get_google_oauth.return_value = mock_oauth

    # Make the callback request
    response = client.get("/auth/google/callback?role=adopter")

    # Should return 200 OK with HTML
    assert response.status_code == 200
    html_content = response.text

    # Verify the response contains HTML with postMessage script
    assert "<html>" in html_content
    assert "postMessage" in html_content
    assert "window.close()" in html_content
    assert MOCK_GOOGLE_USER_INFO["email"] in html_content

    # Verify the user was created in the database
    db_user = (
        db_session.query(User)
        .filter(User.email == MOCK_GOOGLE_USER_INFO["email"])
        .first()
    )
    assert db_user is not None
    assert db_user.first_name == MOCK_GOOGLE_USER_INFO["given_name"]
    assert db_user.last_name == MOCK_GOOGLE_USER_INFO["family_name"]


@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_callback_existing_user(mock_get_google_oauth, client, db_session):
    # Test Google OAuth callback with an existing user (Login) (Happy path)

    # Use a different email to avoid conflicts with previous test
    existing_user_info = {
        "email": "existing.user@gmail.com",
        "given_name": "Existing",
        "family_name": "User",
        "sub": "987654321",
    }

    # First, create a user in the database
    from app.services.auth_service import register_user

    user_data_dict = {
        "first_name": existing_user_info["given_name"],
        "last_name": existing_user_info["family_name"],
        "email": existing_user_info["email"],
        "phone_number": "0912345678",
        "password": "Testpassword123",
        "requested_role": "adopter",
    }

    # Create a mock redis client for register_user
    class MockRedis:
        def setex(self, key, ttl, value):
            pass

    mock_redis = MockRedis()
    register_user(db_session, mock_redis, user_data_dict)

    # Mock the OAuth instance
    mock_oauth = MagicMock()
    mock_google = AsyncMock()

    # Mock the token and user info response
    mock_token = {"access_token": "test_token"}
    mock_google.authorize_access_token = AsyncMock(return_value=mock_token)
    mock_google.parse_id_token = AsyncMock(return_value=existing_user_info)

    mock_oauth.google = mock_google
    mock_get_google_oauth.return_value = mock_oauth

    # Make the callback request
    response = client.get("/auth/google/callback?role=adopter")

    # Should return 200 OK with HTML
    assert response.status_code == 200
    html_content = response.text

    # Verify the response contains HTML with postMessage script
    assert "<html>" in html_content
    assert "postMessage" in html_content
    assert "window.close()" in html_content
    assert existing_user_info["email"] in html_content


@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_callback_admin_role(mock_get_google_oauth, client, db_session):
    # Test Google OAuth callback with admin role (Happy path)

    # Use a different email to avoid conflicts
    admin_user_info = {
        "email": "admin.user@gmail.com",
        "given_name": "Admin",
        "family_name": "User",
        "sub": "111111111",
    }

    # Mock the OAuth instance
    mock_oauth = MagicMock()
    mock_google = AsyncMock()

    # Mock the token and user info response
    mock_token = {"access_token": "test_token"}
    mock_google.authorize_access_token = AsyncMock(return_value=mock_token)
    mock_google.parse_id_token = AsyncMock(return_value=admin_user_info)

    mock_oauth.google = mock_google
    mock_get_google_oauth.return_value = mock_oauth

    # Make the callback request with admin role
    response = client.get("/auth/google/callback?role=admin")

    # Should return 200 OK with HTML
    assert response.status_code == 200
    html_content = response.text

    # Verify the response contains HTML with postMessage script
    assert "<html>" in html_content
    assert "postMessage" in html_content
    assert "window.close()" in html_content
    assert admin_user_info["email"] in html_content

    # Verify the user was created as Admin in the database
    db_user = (
        db_session.query(User).filter(User.email == admin_user_info["email"]).first()
    )
    assert db_user is not None
    assert db_user.type == "admin"


@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_callback_error(mock_get_google_oauth, client):
    # Test Google OAuth callback with authentication error (Negative path)

    # Mock the OAuth instance to raise a ValueError (which triggers 401)
    mock_oauth = MagicMock()
    mock_google = AsyncMock()
    mock_google.authorize_access_token = AsyncMock(
        side_effect=ValueError("Google auth failed")
    )

    mock_oauth.google = mock_google
    mock_get_google_oauth.return_value = mock_oauth

    # Make the callback request
    response = client.get("/auth/google/callback?role=adopter")

    # Should return 500 Internal Server Error (changed from 401)
    assert response.status_code == 500
    data = response.json()
    assert "Internal server error" in data["detail"]["message"]


@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_login_redirect(mock_get_google_oauth, client):
    # Test Google OAuth login redirect endpoint (Happy path)

    # Mock the OAuth instance
    mock_oauth = MagicMock()
    mock_google = AsyncMock()

    # Mock the authorize_redirect to return a redirect response
    mock_redirect_response = MagicMock()
    mock_redirect_response.status_code = 302
    mock_google.authorize_redirect = AsyncMock(return_value=mock_redirect_response)

    mock_oauth.google = mock_google
    mock_get_google_oauth.return_value = mock_oauth

    # Make the login request
    client.get("/auth/login/google?role=adopter")

    # TestClient follows redirects automatically, so we get 200
    # Verify that authorize_redirect was called
    mock_google.authorize_redirect.assert_called_once()


@patch("app.routes.auth_routes.get_google_oauth")
def test_google_oauth_login_redirect_error(mock_get_google_oauth, client):
    # Test Google OAuth login redirect endpoint with error (Negative path)

    # Mock the OAuth instance to raise an exception
    mock_oauth = MagicMock()
    mock_google = AsyncMock()
    mock_google.authorize_redirect = AsyncMock(
        side_effect=Exception("OAuth not available")
    )

    mock_oauth.google = mock_google
    mock_get_google_oauth.return_value = mock_oauth

    # Make the login request
    response = client.get("/auth/login/google?role=adopter")

    # Should return 302 Found with error message
    assert response.status_code == 302
    data = response.json()
    assert "Redirect failed - Google OAuth not available" in data["detail"]["message"]
