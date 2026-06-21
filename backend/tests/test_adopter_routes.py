from app.models.user.adopter import Adopter
from jose import jwt
from app.config import settings


def test_adopter_home_success(client, db_session):
    # Test adopter home with adopter user (Happy path)
    # 1. Create an adopter user
    adopter_user = Adopter(
        first_name="Adopter",
        last_name="User",
        email="adopter@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
    )
    db_session.add(adopter_user)
    db_session.commit()

    # 2. Create a valid adopter token
    token_payload = {
        "sub": "adopter@test.com",
        "role": "adopter",
        "exp": 9999999999,  # Far future
    }
    adopter_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # 3. Access adopter home
    response = client.get(
        "/adopter/home", headers={"Authorization": f"Bearer {adopter_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to Adopter Home"
    assert data["user_email"] == "adopter@test.com"
    assert data["user_role"] == "adopter"
    assert "home_data" in data


def test_adopter_home_unauthorized_role(client, db_session):
    # Test adopter home with non-adopter user (Negative path)
    # 1. Create an admin user
    from app.models.user.admin import Admin

    admin_user = Admin(
        first_name="Admin",
        last_name="User",
        email="admin.unauth@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
    )
    db_session.add(admin_user)
    db_session.commit()

    # 2. Create a token with admin role
    token_payload = {
        "sub": "admin.unauth@test.com",
        "role": "admin",
        "exp": 9999999999,
    }
    admin_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # 3. Try to access adopter home with non-adopter role
    response = client.get(
        "/adopter/home", headers={"Authorization": f"Bearer {admin_token}"}
    )

    # Should return 403 Forbidden
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]["message"]


def test_adopter_home_no_token(client):
    # Test adopter home without token (Negative path)
    response = client.get("/adopter/home")

    # Should return 401 Unauthorized (from verify_token)
    assert response.status_code == 401


def test_adopter_home_invalid_token(client):
    # Test adopter home with invalid token (Negative path)
    response = client.get(
        "/adopter/home", headers={"Authorization": "Bearer invalid_token"}
    )

    # Should return 401 Unauthorized (from verify_token)
    assert response.status_code == 401


def test_adopter_home_with_blacklisted_token(client, db_session):
    # Test adopter home with blacklisted token
    from app.models.user.adopter import Adopter

    # 1. Create an adopter user
    adopter_user = Adopter(
        first_name="Adopter",
        last_name="User",
        email="adopter.blacklist@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
    )
    db_session.add(adopter_user)
    db_session.commit()

    # 2. Create a valid adopter token
    token_payload = {
        "sub": "adopter.blacklist@test.com",
        "role": "adopter",
        "exp": 9999999999,
    }
    adopter_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # 3. Add token to blacklist
    from app.utils.jwt.jwt_utils import add_token_to_blacklist
    from datetime import datetime, timedelta

    add_token_to_blacklist(adopter_token, datetime.utcnow() + timedelta(hours=1))

    # 4. Try to access adopter home with blacklisted token
    response = client.get(
        "/adopter/home", headers={"Authorization": f"Bearer {adopter_token}"}
    )

    # Should return 401 Unauthorized (token is blacklisted)
    assert response.status_code == 401
