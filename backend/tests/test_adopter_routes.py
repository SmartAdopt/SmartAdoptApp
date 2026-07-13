import pytest
import bcrypt
from app.models.user.adopter import Adopter
from app.models.user.user import User
from jose import jwt
from app.config import settings


def test_adopter_home_success(client, db_session):
    # Test adopter home with adopter user (Happy path)
    # 1. Create a user first
    from app.models.user.user import User

    user = User(
        first_name="Adopter",
        last_name="User",
        email="adopter@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="adopter",
    )
    db_session.add(user)
    db_session.commit()

    # 2. Create adopter user
    adopter_user = Adopter(user_id=user.user_id)
    db_session.add(adopter_user)
    db_session.commit()

    # 2. Create a valid adopter token
    token_payload = {
        "sub": "1",
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
    assert data["user_id"] == "1"
    assert data["user_role"] == "adopter"
    assert "home_data" in data


def test_adopter_home_unauthorized_role(client, db_session):
    # Test adopter home with non-adopter user (Negative path)
    # 1. Create an admin user
    from app.models.user.user import User
    from app.models.user.admin import Admin

    user = User(
        first_name="Admin",
        last_name="User",
        email="admin.unauth@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="admin",
    )
    db_session.add(user)
    db_session.commit()

    admin_user = Admin(user_id=user.user_id)
    db_session.add(admin_user)
    db_session.commit()

    # 2. Create a token with admin role
    token_payload = {
        "sub": "2",
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


@pytest.mark.skip(reason="Requires complex Redis mocking for blacklist verification")
def test_adopter_home_with_blacklisted_token(client, db_session):
    # Test adopter home with blacklisted token
    from app.models.user.user import User
    from app.models.user.adopter import Adopter

    # 1. Create a user first
    user = User(
        first_name="Adopter",
        last_name="User",
        email="adopter.blacklist@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="adopter",
    )
    db_session.add(user)
    db_session.commit()

    # 2. Create adopter user
    adopter_user = Adopter(user_id=user.user_id)
    db_session.add(adopter_user)
    db_session.commit()

    # 2. Create a valid adopter token
    token_payload = {
        "sub": "3",
        "role": "adopter",
        "exp": 9999999999,
    }
    adopter_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # 3. Add token to blacklist
    from app.utils.jwt.jwt_utils import add_token_to_blacklist
    from datetime import datetime, timedelta

    # Create a mock redis client for the blacklist
    class MockRedis:
        def setex(self, key, ttl, value):
            pass

    mock_redis = MockRedis()
    add_token_to_blacklist(
        mock_redis, adopter_token, datetime.utcnow() + timedelta(hours=1)
    )

    # 4. Try to access adopter home with blacklisted token
    response = client.get(
        "/adopter/home", headers={"Authorization": f"Bearer {adopter_token}"}
    )

    # Should return 401 Unauthorized (token is blacklisted)
    assert response.status_code == 401


_test_email_counter = 0


def _create_adopter_user(db_session, email=None):
    global _test_email_counter
    _test_email_counter += 1
    if email is None:
        email = f"adopter.profile.{_test_email_counter}@test.com"
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw("TestPass123".encode("utf-8"), salt).decode("utf-8")
    user = User(
        first_name="Adopter",
        last_name="User",
        email=email,
        phone_number="0999999999",
        password_hash=hashed,
        type="adopter",
    )
    db_session.add(user)
    db_session.commit()
    adopter_user = Adopter(user_id=user.user_id)
    db_session.add(adopter_user)
    db_session.commit()
    return user


def _create_adopter_token(user_id):
    token_payload = {
        "sub": str(user_id),
        "role": "adopter",
        "exp": 9999999999,
    }
    return jwt.encode(token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def test_update_profile_success(client, db_session):
    # Test updating all profile fields successfully
    user = _create_adopter_user(db_session)
    token = _create_adopter_token(user.user_id)

    response = client.put(
        "/adopter/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "first_name": "NewName",
            "last_name": "NewLastName",
            "phone_number": "0988888888",
            "email": "newemail@test.com",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Profile updated successfully"
    assert data["user_id"] == user.user_id
    assert "updated_at" in data


def test_update_profile_partial_first_name(client, db_session):
    # Test updating only one field
    user = _create_adopter_user(db_session)
    token = _create_adopter_token(user.user_id)

    response = client.put(
        "/adopter/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"first_name": "OnlyName"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Profile updated successfully"
    assert data["user_id"] == user.user_id
    assert "updated_at" in data


def test_update_profile_password_success(client, db_session):
    # Test changing password successfully
    user = _create_adopter_user(db_session)
    token = _create_adopter_token(user.user_id)

    response = client.put(
        "/adopter/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "current_password": "TestPass123",
            "new_password": "NewPass456",
        },
    )

    assert response.status_code == 200

    # Verify the password was actually changed by trying to log in
    from app.services.auth_service import login_user
    from unittest.mock import MagicMock

    mock_redis = MagicMock()
    mock_redis.setex = MagicMock()

    login_result = login_user(
        db_session,
        mock_redis,
        {"email": user.email, "password": "NewPass456"},
    )
    assert login_result["email"] == user.email


def test_update_profile_password_wrong_current(client, db_session):
    # Test changing password with wrong current password
    user = _create_adopter_user(db_session)
    token = _create_adopter_token(user.user_id)

    response = client.put(
        "/adopter/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "current_password": "WrongPass123",
            "new_password": "NewPass456",
        },
    )

    assert response.status_code == 400
    assert "Current password is incorrect" in response.json()["detail"]["message"]


def test_update_profile_password_missing_current(client, db_session):
    # Test providing new_password without current_password
    user = _create_adopter_user(db_session)
    token = _create_adopter_token(user.user_id)

    response = client.put(
        "/adopter/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "new_password": "NewPass456",
        },
    )

    assert response.status_code == 422
    assert "Both current and new password are required" in response.text


def test_update_profile_password_same_password(client, db_session):
    # Test providing same current and new password
    user = _create_adopter_user(db_session)
    token = _create_adopter_token(user.user_id)

    response = client.put(
        "/adopter/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "current_password": "TestPass123",
            "new_password": "TestPass123",
        },
    )

    assert response.status_code == 422
    assert "New password must be different from current password" in response.text


def test_update_profile_email_duplicate(client, db_session):
    # Test updating email to one already in use by another user
    user1 = _create_adopter_user(db_session)

    # Create a second user with a different email
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw("TestPass123".encode("utf-8"), salt).decode("utf-8")
    user2 = User(
        first_name="Other",
        last_name="User",
        email="other@test.com",
        phone_number="0999999998",
        password_hash=hashed,
        type="adopter",
    )
    db_session.add(user2)
    db_session.commit()
    adopter2 = Adopter(user_id=user2.user_id)
    db_session.add(adopter2)
    db_session.commit()

    token = _create_adopter_token(user1.user_id)

    response = client.put(
        "/adopter/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"email": "other@test.com"},
    )

    assert response.status_code == 409
    assert "Email already in use" in response.json()["detail"]["message"]


def test_update_profile_unauthorized_role(client, db_session):
    # Test updating profile with non-adopter token
    from app.models.user.admin import Admin

    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw("TestPass123".encode("utf-8"), salt).decode("utf-8")
    user = User(
        first_name="Admin",
        last_name="User",
        email="admin.profile@test.com",
        phone_number="0999999997",
        password_hash=hashed,
        type="admin",
    )
    db_session.add(user)
    db_session.commit()
    admin_user = Admin(user_id=user.user_id)
    db_session.add(admin_user)
    db_session.commit()

    token_payload = {
        "sub": str(user.user_id),
        "role": "admin",
        "exp": 9999999999,
    }
    admin_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    response = client.put(
        "/adopter/profile",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"first_name": "Hacker"},
    )

    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]["message"]


def test_update_profile_no_token(client):
    # Test updating profile without token
    response = client.put("/adopter/profile", json={"first_name": "NoToken"})

    assert response.status_code == 401


def test_update_profile_invalid_token(client):
    # Test updating profile with invalid token
    response = client.put(
        "/adopter/profile",
        headers={"Authorization": "Bearer invalid_token"},
        json={"first_name": "Invalid"},
    )

    assert response.status_code == 401
