from app.models.admin import Admin
from app.models.user import User
from jose import jwt
from app.config import settings


def test_admin_dashboard_success(client, db_session):
    # Test admin dashboard with admin user (Happy path)
    # 1. Create an admin user
    admin_user = Admin(
        first_name="Admin",
        last_name="User",
        email="admin@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
    )
    db_session.add(admin_user)
    db_session.commit()

    # 2. Create a valid admin token
    token_payload = {
        "sub": "admin@test.com",
        "role": "admin",
        "exp": 9999999999,  # Far future
    }
    admin_token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    # 3. Access admin dashboard
    response = client.get(
        "/admin/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to Admin Dashboard"
    assert data["user_email"] == "admin@test.com"
    assert data["user_role"] == "admin"
    assert "dashboard_data" in data


def test_admin_dashboard_unauthorized_role(client, db_session):
    # Test admin dashboard with non-admin user (Negative path)
    # 1. Create a regular user
    from app.models.adopter import Adopter
    regular_user = Adopter(
        first_name="Regular",
        last_name="User",
        email="regular@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
    )
    db_session.add(regular_user)
    db_session.commit()

    # 2. Create a token with adopter role
    token_payload = {
        "sub": "regular@test.com",
        "role": "adopter",
        "exp": 9999999999,
    }
    regular_token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    # 3. Try to access admin dashboard with non-admin role
    response = client.get(
        "/admin/dashboard",
        headers={"Authorization": f"Bearer {regular_token}"}
    )

    # Should return 403 Forbidden
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]


def test_admin_dashboard_no_token(client):
    # Test admin dashboard without token (Negative path)
    response = client.get("/admin/dashboard")

    # Should return 401 Unauthorized (from verify_token)
    assert response.status_code == 401


def test_admin_dashboard_invalid_token(client):
    # Test admin dashboard with invalid token (Negative path)
    response = client.get(
        "/admin/dashboard",
        headers={"Authorization": "Bearer invalid_token"}
    )

    # Should return 401 Unauthorized (from verify_token)
    assert response.status_code == 401


def test_admin_dashboard_with_blacklisted_token(client, db_session):
    # Test admin dashboard with blacklisted token
    from app.models.admin import Admin

    # 1. Create an admin user
    admin_user = Admin(
        first_name="Admin",
        last_name="User",
        email="admin.blacklist@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
    )
    db_session.add(admin_user)
    db_session.commit()

    # 2. Create a valid admin token
    token_payload = {
        "sub": "admin.blacklist@test.com",
        "role": "admin",
        "exp": 9999999999,
    }
    admin_token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    # 3. Add token to blacklist
    from app.utils.jwt.jwt_utils import add_token_to_blacklist
    from datetime import datetime, timedelta
    add_token_to_blacklist(admin_token, datetime.utcnow() + timedelta(hours=1))

    # 4. Try to access admin dashboard with blacklisted token
    response = client.get(
        "/admin/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # Should return 401 Unauthorized (token is blacklisted)
    assert response.status_code == 401
