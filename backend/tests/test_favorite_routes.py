# Favorite routes tests for add, remove, and list operations

# Bcrypt imports for password hashing
import bcrypt

# Datetime imports
from datetime import datetime

# Mock imports
from unittest.mock import AsyncMock, MagicMock

# JWT imports
from jose import jwt

# Config import
from app.config import settings

# Model imports
from app.models.user.user import User
from app.models.user.adopter import Adopter

# MongoDB import
from app.database.mongo.mongo_db import get_mongo_db

# App import for dependency overrides
from app.main import app

# Counter for unique test emails
_test_email_counter = 0

# Mock pet profile data for MongoDB validation tests
TEST_PET_PROFILE = {
    "_id": "PR1",
    "title": "Friendly Dog",
    "tags": ["#Peludo", "#Juguetón"],
    "emotional_description": "A very friendly dog looking for a home.",
    "status": "available",
    "creation_date": datetime.now(),
    "pet": {
        "name": "Buddy",
        "pet_image_url": "https://example.com/dog.jpg",
        "animal_breed": ["dog", "Golden Retriever"],
        "age": 3,
        "gender": "male",
        "is_sterilized": True,
        "vaccines_up_to_date": ["rabies"],
        "dewormed": True,
        "weight_kg": 8.5,
        "special_conditions": [],
        "brief_description": "Friendly dog looking for a home",
    },
}


def _create_adopter_user(db_session, email=None):
    # Create a test adopter user in the database
    global _test_email_counter
    _test_email_counter += 1
    if email is None:
        email = f"adopter.fav.{_test_email_counter}@test.com"
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
    # Generate a JWT token with adopter role for testing
    token_payload = {
        "sub": str(user_id),
        "role": "adopter",
        "exp": 9999999999,
    }
    return jwt.encode(token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _create_admin_token():
    # Generate a JWT token with admin role for unauthorized role tests
    token_payload = {
        "sub": "99",
        "role": "admin",
        "exp": 9999999999,
    }
    return jwt.encode(token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _override_mongo_db_with_pet(profile_data: dict):
    # Override MongoDB dependency to return mock pet profile data
    mock_collection = MagicMock()
    mock_collection.find_one = AsyncMock(return_value=profile_data)

    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(return_value=mock_collection)

    app.dependency_overrides[get_mongo_db] = lambda: mock_db


def _clear_mongo_override():
    # Remove the MongoDB dependency override after each test
    app.dependency_overrides.pop(get_mongo_db, None)


class TestAddFavorite:
    # Tests for the add favorite endpoint

    def test_add_favorite_success(self, client, db_session):
        # Happy path: adopter adds a valid pet to favorites
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db_with_pet(TEST_PET_PROFILE)

        response = client.post(
            "/adopter/favorites/PR1",
            headers={"Authorization": f"Bearer {token}"},
        )

        _clear_mongo_override()
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "Pet added to favorites"
        assert data["favorite"]["pet_profile_id"] == "PR1"
        assert data["favorite"]["user_id"] == user.user_id

    def test_add_favorite_duplicate(self, client, db_session):
        # Negative: duplicate favorite returns 409 Conflict
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db_with_pet(TEST_PET_PROFILE)

        client.post(
            "/adopter/favorites/PR1",
            headers={"Authorization": f"Bearer {token}"},
        )
        response = client.post(
            "/adopter/favorites/PR1",
            headers={"Authorization": f"Bearer {token}"},
        )

        _clear_mongo_override()
        assert response.status_code == 409
        assert "Pet already in favorites" in response.json()["detail"]["message"]

    def test_add_favorite_pet_not_found(self, client, db_session):
        # Negative: non-existent pet in MongoDB returns 404
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db_with_pet(None)

        response = client.post(
            "/adopter/favorites/PR999",
            headers={"Authorization": f"Bearer {token}"},
        )

        _clear_mongo_override()
        assert response.status_code == 404
        assert "Pet profile not found" in response.json()["detail"]["message"]

    def test_add_favorite_unauthorized_role(self, client, db_session):
        # Negative: admin role cannot add favorites
        token = _create_admin_token()

        response = client.post(
            "/adopter/favorites/PR1",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "Access denied" in response.json()["detail"]["message"]

    def test_add_favorite_no_token(self, client):
        # Negative: missing token returns 401
        response = client.post("/adopter/favorites/PR1")

        assert response.status_code == 401

    def test_add_favorite_invalid_token(self, client):
        # Negative: invalid token returns 401
        response = client.post(
            "/adopter/favorites/PR1",
            headers={"Authorization": "Bearer invalid_token"},
        )

        assert response.status_code == 401


class TestRemoveFavorite:
    # Tests for the remove favorite endpoint

    def test_remove_favorite_success(self, client, db_session):
        # Happy path: adopter removes an existing favorite
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db_with_pet(TEST_PET_PROFILE)

        client.post(
            "/adopter/favorites/PR1",
            headers={"Authorization": f"Bearer {token}"},
        )
        response = client.delete(
            "/adopter/favorites/PR1",
            headers={"Authorization": f"Bearer {token}"},
        )

        _clear_mongo_override()
        assert response.status_code == 200
        assert response.json()["message"] == "Pet removed from favorites"

    def test_remove_favorite_not_found(self, client, db_session):
        # Negative: removing non-existent favorite returns 404
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)

        response = client.delete(
            "/adopter/favorites/PR999",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404
        assert "Favorite not found" in response.json()["detail"]["message"]

    def test_remove_favorite_unauthorized_role(self, client, db_session):
        # Negative: admin role cannot remove favorites
        token = _create_admin_token()

        response = client.delete(
            "/adopter/favorites/PR1",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403

    def test_remove_favorite_no_token(self, client):
        # Negative: missing token returns 401
        response = client.delete("/adopter/favorites/PR1")

        assert response.status_code == 401


class TestListFavorites:
    # Tests for the list favorites endpoint

    def test_list_favorites_success(self, client, db_session):
        # Happy path: list favorites returns pet data from MongoDB
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db_with_pet(TEST_PET_PROFILE)

        client.post(
            "/adopter/favorites/PR1",
            headers={"Authorization": f"Bearer {token}"},
        )
        response = client.get(
            "/adopter/favorites/",
            headers={"Authorization": f"Bearer {token}"},
        )

        _clear_mongo_override()
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert len(data["favorites"]) == 1
        assert data["favorites"][0]["pet_profile_id"] == "PR1"
        assert data["favorites"][0]["pet"] is not None
        assert data["favorites"][0]["pet"]["profile_id"] == "PR1"
        assert data["favorites"][0]["pet"]["title"] == "Friendly Dog"

    def test_list_favorites_empty(self, client, db_session):
        # Happy path: empty favorites list returns count 0
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)

        response = client.get(
            "/adopter/favorites/",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert data["favorites"] == []

    def test_list_favorites_unauthorized_role(self, client, db_session):
        # Negative: admin role cannot list favorites
        token = _create_admin_token()

        response = client.get(
            "/adopter/favorites/",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403

    def test_list_favorites_no_token(self, client):
        # Negative: missing token returns 401
        response = client.get("/adopter/favorites/")

        assert response.status_code == 401
