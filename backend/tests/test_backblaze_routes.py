# Tests for Backblaze B2 image upload routes
from io import BytesIO
from unittest.mock import patch, MagicMock
from jose import jwt
from app.config import settings


def test_backblaze_upload_success(client, db_session):
    # Test successful image upload with admin user (Happy path)
    # 1. Create a user first
    from app.models.user.user import User
    from app.models.user.admin import Admin

    user = User(
        first_name="Admin",
        last_name="User",
        email="backblaze.admin@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="admin",
    )
    db_session.add(user)
    db_session.commit()

    # 2. Create admin user
    admin_user = Admin(user_id=user.user_id)
    db_session.add(admin_user)
    db_session.commit()

    # 2. Create a valid admin token
    token_payload = {
        "sub": "1",
        "role": "admin",
        "exp": 9999999999,
    }
    admin_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # 3. Mock Backblaze service
    mock_bucket = MagicMock()
    mock_bucket.upload_bytes.return_value = MagicMock()
    mock_bucket.upload_bytes.return_value.id = "file_id"

    mock_b2_api = MagicMock()
    mock_b2_api.get_bucket_by_name.return_value = mock_bucket
    mock_b2_api.get_download_url_for_file_name.return_value = (
        "https://f002.backblazeb2.com/file/test-bucket/uuid.jpg"
    )

    # 4. Create test image file
    image_data = b"fake_image_data"
    image_file = BytesIO(image_data)
    image_file.name = "test.jpg"
    image_file.content_type = "image/jpeg"

    # 5. Test upload with mocked Backblaze
    with patch(
        "app.services.backblaze_service.get_b2_api", return_value=mock_b2_api
    ), patch("app.services.backblaze_service.bucket_exists", return_value=True):
        response = client.post(
            "/backblaze/upload",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.jpg", image_file, "image/jpeg")},
        )

    assert response.status_code == 201
    data = response.json()
    assert data["image_url"] == "https://f002.backblazeb2.com/file/test-bucket/uuid.jpg"
    assert data["message"] == "Image uploaded successfully"


def test_backblaze_upload_unauthorized_role(client, db_session):
    # Test upload with non-admin user (Negative path)
    # 1. Create a regular user
    from app.models.user.user import User
    from app.models.user.adopter import Adopter

    user = User(
        first_name="Regular",
        last_name="User",
        email="backblaze.regular@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="adopter",
    )
    db_session.add(user)
    db_session.commit()

    regular_user = Adopter(user_id=user.user_id)
    db_session.add(regular_user)
    db_session.commit()

    # 2. Create a token with adopter role
    token_payload = {
        "sub": "2",
        "role": "adopter",
        "exp": 9999999999,
    }
    regular_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # 3. Try to upload with non-admin role
    image_data = b"fake_image_data"
    image_file = BytesIO(image_data)
    image_file.name = "test.jpg"
    image_file.content_type = "image/jpeg"

    response = client.post(
        "/backblaze/upload",
        headers={"Authorization": f"Bearer {regular_token}"},
        files={"file": ("test.jpg", image_file, "image/jpeg")},
    )

    # Should return 403 Forbidden
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]["message"]


def test_backblaze_upload_no_token(client):
    # Test upload without token (Negative path)
    image_data = b"fake_image_data"
    image_file = BytesIO(image_data)
    image_file.name = "test.jpg"
    image_file.content_type = "image/jpeg"

    response = client.post(
        "/backblaze/upload", files={"file": ("test.jpg", image_file, "image/jpeg")}
    )

    # Should return 401 Unauthorized
    assert response.status_code == 401


def test_backblaze_upload_invalid_file_type(client, db_session):
    # Test upload with non-image file (Negative path)
    # 1. Create a user first
    from app.models.user.user import User
    from app.models.user.admin import Admin

    user = User(
        first_name="Admin",
        last_name="User",
        email="backblaze.admin2@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="admin",
    )
    db_session.add(user)
    db_session.commit()

    # 2. Create admin user
    admin_user = Admin(user_id=user.user_id)
    db_session.add(admin_user)
    db_session.commit()

    # 2. Create a valid admin token
    token_payload = {
        "sub": "3",
        "role": "admin",
        "exp": 9999999999,
    }
    admin_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # 3. Mock bucket_exists to return True
    with patch("app.routes.backblaze_routes.bucket_exists", return_value=True):
        # 4. Try to upload a non-image file
        file_data = b"fake_pdf_data"
        image_file = BytesIO(file_data)
        image_file.name = "test.pdf"
        image_file.content_type = "application/pdf"

        response = client.post(
            "/backblaze/upload",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.pdf", image_file, "application/pdf")},
        )

    # Should return 400 Bad Request
    assert response.status_code == 400
    assert "Only image files are allowed" in response.json()["detail"]["message"]


def test_backblaze_upload_bucket_not_found(client, db_session):
    # Test upload when bucket doesn't exist (Negative path)
    # 1. Create a user first
    from app.models.user.user import User
    from app.models.user.admin import Admin

    user = User(
        first_name="Admin",
        last_name="User",
        email="backblaze.admin3@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="admin",
    )
    db_session.add(user)
    db_session.commit()

    # 2. Create admin user
    admin_user = Admin(user_id=user.user_id)
    db_session.add(admin_user)
    db_session.commit()

    # 2. Create a valid admin token
    token_payload = {
        "sub": "4",
        "role": "admin",
        "exp": 9999999999,
    }
    admin_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # 3. Mock bucket_exists to return False
    image_data = b"fake_image_data"
    image_file = BytesIO(image_data)
    image_file.name = "test.jpg"
    image_file.content_type = "image/jpeg"

    with patch("app.routes.backblaze_routes.bucket_exists", return_value=False):
        response = client.post(
            "/backblaze/upload",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.jpg", image_file, "image/jpeg")},
        )

    # Should return 503 Service Unavailable
    assert response.status_code == 503
    assert "Backblaze bucket not found" in response.json()["detail"]["message"]


def test_backblaze_upload_service_error(client, db_session):
    # Test upload when Backblaze service fails (Negative path)
    # 1. Create a user first
    from app.models.user.user import User
    from app.models.user.admin import Admin

    user = User(
        first_name="Admin",
        last_name="User",
        email="backblaze.admin4@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="admin",
    )
    db_session.add(user)
    db_session.commit()

    # 2. Create admin user
    admin_user = Admin(user_id=user.user_id)
    db_session.add(admin_user)
    db_session.commit()

    # 2. Create a valid admin token
    token_payload = {
        "sub": "5",
        "role": "admin",
        "exp": 9999999999,
    }
    admin_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # 3. Mock upload to raise exception
    mock_bucket = MagicMock()
    mock_bucket.upload_bytes.side_effect = Exception("Upload failed")

    mock_b2_api = MagicMock()
    mock_b2_api.get_bucket_by_name.return_value = mock_bucket

    image_data = b"fake_image_data"
    image_file = BytesIO(image_data)
    image_file.name = "test.jpg"
    image_file.content_type = "image/jpeg"

    with patch(
        "app.services.backblaze_service.get_b2_api", return_value=mock_b2_api
    ), patch("app.services.backblaze_service.bucket_exists", return_value=True):
        response = client.post(
            "/backblaze/upload",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.jpg", image_file, "image/jpeg")},
        )

    # Should return 500 Internal Server Error
    assert response.status_code == 500
    assert "Failed to upload image" in response.json()["detail"]["message"]
