# Tests for adoption application endpoints

from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from jose import jwt
import bcrypt

from app.config import settings
from app.models.user.user import User
from app.models.user.adopter import Adopter
from app.database.mongo.mongo_db import get_mongo_db
from app.main import app

_test_email_counter = 0

# Mock cross-evaluation AI result
MOCK_AI_RESULT = {
    "total_score": 10,
    "total_max_score": 15,
    "main_score": 8,
    "main_max_score": 11,
    "logistics_education_score": 2,
    "logistics_education_max_score": 4,
    "breakdown": [
        {
            "section": "I. Candidate Information",
            "field": "employment_status",
            "label": "Employment Status",
            "answer": "employed",
            "evaluation": "Employed and stable",
            "points": 1,
            "max_points": 1,
        },
        {
            "section": "I. Candidate Information",
            "field": "housing_type",
            "label": "Housing Type",
            "answer": "own_house",
            "evaluation": "Adequate housing",
            "points": 1,
            "max_points": 1,
        },
        {
            "section": "I. Candidate Information",
            "field": "has_natural_space",
            "label": "Has Natural Space",
            "answer": "Yes",
            "evaluation": "Has outdoor space",
            "points": 1,
            "max_points": 1,
        },
        {
            "section": "II. Coexistence and Experience",
            "field": "has_pets",
            "label": "Has Pets",
            "answer": "No",
            "evaluation": "No existing pets",
            "points": 1,
            "max_points": 1,
        },
        {
            "section": "II. Coexistence and Experience",
            "field": "household_energy",
            "label": "Household Energy",
            "answer": "moderate",
            "evaluation": "Balanced energy level",
            "points": 1,
            "max_points": 1,
        },
        {
            "section": "II. Coexistence and Experience",
            "field": "has_children",
            "label": "Has Children",
            "answer": "Yes",
            "evaluation": "Good with children",
            "points": 1,
            "max_points": 1,
        },
        {
            "section": "II. Coexistence and Experience",
            "field": "long_term_commitment",
            "label": "Long Term Commitment",
            "answer": "Yes",
            "evaluation": "Committed to long-term care",
            "points": 1,
            "max_points": 1,
        },
        {
            "section": "III. Pet Preferences",
            "field": "preferred_species",
            "label": "Preferred Species",
            "answer": "dog",
            "evaluation": "Species matches",
            "points": 1,
            "max_points": 1,
        },
        {
            "section": "III. Pet Preferences",
            "field": "preferred_gender",
            "label": "Preferred Gender",
            "answer": "no_preference",
            "evaluation": "No preference",
            "points": 0,
            "max_points": 1,
        },
        {
            "section": "III. Pet Preferences",
            "field": "preferred_energy",
            "label": "Preferred Energy",
            "answer": "medium",
            "evaluation": "Energy level compatible",
            "points": 0,
            "max_points": 1,
        },
        {
            "section": "V. Motivation",
            "field": "motivation",
            "label": "Motivation",
            "answer": "I want to adopt",
            "evaluation": "Clear motivation",
            "points": 0,
            "max_points": 1,
        },
        {
            "section": "IV. Logistics and Education",
            "field": "daily_time_dedication",
            "label": "Daily Time Dedication",
            "answer": "2-6 hours",
            "evaluation": "Adequate time available",
            "points": 1,
            "max_points": 1,
        },
        {
            "section": "IV. Logistics and Education",
            "field": "sleeping_location",
            "label": "Sleeping Location",
            "answer": "inside",
            "evaluation": "Indoor sleeping appropriate",
            "points": 1,
            "max_points": 1,
        },
        {
            "section": "IV. Logistics and Education",
            "field": "behavior_approach",
            "label": "Behavior Approach",
            "answer": "positive_education",
            "evaluation": "Good training approach",
            "points": 0,
            "max_points": 1,
        },
        {
            "section": "IV. Logistics and Education",
            "field": "emergency_plan",
            "label": "Emergency Plan",
            "answer": "family_friend",
            "evaluation": "Has backup plan",
            "points": 0,
            "max_points": 1,
        },
    ],
    "justification": "The applicant demonstrates good compatibility with the pet. Strong in candidate information and coexistence areas. Some concerns in pet preferences and logistics that need discussion.",
}

# Mock form data for MongoDB
TEST_FORM = {
    "_id": "AF1",
    "user_id": 1,
    "neighborhood": "La Floresta",
    "address": "Calle Principal 123",
    "employment_status": "employed",
    "housing_type": "own_house",
    "has_natural_space": True,
    "has_pets": False,
    "household_energy": "moderate",
    "has_children": True,
    "children_ages": [5, 8],
    "long_term_commitment": True,
    "preferred_species": "dog",
    "preferred_gender": "no_preference",
    "preferred_energy": "medium",
    "daily_time_dedication": "2-6",
    "sleeping_location": "inside",
    "behavior_approach": "positive_education",
    "emergency_plan": "family_friend",
    "motivation": "I want to adopt",
    "submission_date": datetime.now(),
}

# Mock pet profile for MongoDB
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
    global _test_email_counter
    _test_email_counter += 1
    if email is None:
        email = f"adopter.app.{_test_email_counter}@test.com"
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


def _create_admin_token():
    token_payload = {
        "sub": "99",
        "role": "admin",
        "exp": 9999999999,
    }
    return jwt.encode(token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _build_app_document(application_id="AP1", pet_profile_id="PR1", user_id=1):
    return {
        "_id": application_id,
        "application_id": application_id,
        "user_id": user_id,
        "pet_profile_id": pet_profile_id,
        "form_id": "AF1",
        "total_score": MOCK_AI_RESULT["total_score"],
        "total_max_score": MOCK_AI_RESULT["total_max_score"],
        "main_score": MOCK_AI_RESULT["main_score"],
        "main_max_score": MOCK_AI_RESULT["main_max_score"],
        "logistics_education_score": MOCK_AI_RESULT["logistics_education_score"],
        "logistics_education_max_score": MOCK_AI_RESULT[
            "logistics_education_max_score"
        ],
        "ai_breakdown": MOCK_AI_RESULT["breakdown"],
        "ai_justification": MOCK_AI_RESULT["justification"],
        "status": "pending",
        "created_at": datetime.now(),
    }


def _override_mongo_db(
    form_exists=True,
    pet_exists=True,
    pet_status="available",
    duplicate=False,
    existing_apps=None,
):
    mock_forms = MagicMock()
    mock_forms.find_one = AsyncMock(return_value=TEST_FORM if form_exists else None)

    mock_profiles = MagicMock()
    if pet_exists:
        profile = dict(TEST_PET_PROFILE)
        profile["status"] = pet_status
        mock_profiles.find_one = AsyncMock(return_value=profile)
    else:
        mock_profiles.find_one = AsyncMock(return_value=None)
    mock_profiles.update_one = AsyncMock()

    mock_applications = MagicMock()
    mock_applications.find_one = AsyncMock(
        return_value=_build_app_document() if duplicate else None
    )
    mock_applications.insert_one = AsyncMock()

    app_list = existing_apps if existing_apps is not None else []
    mock_cursor = AsyncMock()
    mock_cursor.to_list = AsyncMock(return_value=app_list)
    mock_applications.find = MagicMock(return_value=mock_cursor)

    mock_counters = MagicMock()
    mock_counters.find_one_and_update = AsyncMock(
        return_value={"_id": "application_counter", "sequence_value": 1}
    )

    collections_map = {
        "adoption_forms": mock_forms,
        "pet_profiles": mock_profiles,
        "applications": mock_applications,
        "counters": mock_counters,
    }

    class _MockDB:
        def __getitem__(self, name):
            return collections_map.get(name, MagicMock())

    mock_db = _MockDB()
    app.dependency_overrides[get_mongo_db] = lambda: mock_db


def _clear_mongo_override():
    app.dependency_overrides.pop(get_mongo_db, None)


class TestCreateApplication:

    def test_create_application_success(self, client, db_session):
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db()

        with patch(
            "app.services.applications_service.evaluate_adoption_application",
            new_callable=AsyncMock,
        ) as mock_ai:
            mock_ai.return_value = MOCK_AI_RESULT
            response = client.post(
                "/applications/PR1",
                headers={"Authorization": f"Bearer {token}"},
            )

        _clear_mongo_override()
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "Adoption application created successfully"
        assert data["application_id"] == "AP1"
        assert data["pet_profile_id"] == "PR1"
        assert data["status"] == "pending"
        assert "created_at" in data

    def test_create_application_no_form(self, client, db_session):
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db(form_exists=False)

        with patch(
            "app.services.applications_service.evaluate_adoption_application",
            new_callable=AsyncMock,
        ) as mock_ai:
            mock_ai.return_value = MOCK_AI_RESULT
            response = client.post(
                "/applications/PR1",
                headers={"Authorization": f"Bearer {token}"},
            )

        _clear_mongo_override()
        assert response.status_code == 400
        assert "suitability form" in response.json()["detail"]["message"].lower()

    def test_create_application_pet_not_found(self, client, db_session):
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db(pet_exists=False)

        with patch(
            "app.services.applications_service.evaluate_adoption_application",
            new_callable=AsyncMock,
        ) as mock_ai:
            mock_ai.return_value = MOCK_AI_RESULT
            response = client.post(
                "/applications/PR999",
                headers={"Authorization": f"Bearer {token}"},
            )

        _clear_mongo_override()
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]["message"].lower()

    def test_create_application_pet_not_available(self, client, db_session):
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db(pet_status="adopted")

        with patch(
            "app.services.applications_service.evaluate_adoption_application",
            new_callable=AsyncMock,
        ) as mock_ai:
            mock_ai.return_value = MOCK_AI_RESULT
            response = client.post(
                "/applications/PR1",
                headers={"Authorization": f"Bearer {token}"},
            )

        _clear_mongo_override()
        assert response.status_code == 409
        assert "not available" in response.json()["detail"]["message"].lower()

    def test_create_application_duplicate(self, client, db_session):
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db(duplicate=True)

        with patch(
            "app.services.applications_service.evaluate_adoption_application",
            new_callable=AsyncMock,
        ) as mock_ai:
            mock_ai.return_value = MOCK_AI_RESULT
            response = client.post(
                "/applications/PR1",
                headers={"Authorization": f"Bearer {token}"},
            )

        _clear_mongo_override()
        assert response.status_code == 409
        assert "already applied" in response.json()["detail"]["message"].lower()

    def test_create_application_unauthorized_role(self, client, db_session):
        token = _create_admin_token()

        response = client.post(
            "/applications/PR1",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "Access denied" in response.json()["detail"]["message"]

    def test_create_application_no_token(self, client):
        response = client.post("/applications/PR1")
        assert response.status_code == 401


class TestListApplications:

    def test_list_applications_success(self, client, db_session):
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        app_doc = _build_app_document(user_id=user.user_id)
        _override_mongo_db(existing_apps=[app_doc])

        response = client.get(
            "/applications/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        _clear_mongo_override()
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert len(data["applications"]) == 1
        app = data["applications"][0]
        assert app["application_id"] == "AP1"
        assert app["pet_profile_id"] == "PR1"
        assert app["total_score"] == MOCK_AI_RESULT["total_score"]
        assert app["total_max_score"] == MOCK_AI_RESULT["total_max_score"]
        assert app["main_score"] == MOCK_AI_RESULT["main_score"]
        assert app["main_max_score"] == MOCK_AI_RESULT["main_max_score"]
        assert (
            app["logistics_education_score"]
            == MOCK_AI_RESULT["logistics_education_score"]
        )
        assert (
            app["logistics_education_max_score"]
            == MOCK_AI_RESULT["logistics_education_max_score"]
        )
        assert len(app["ai_breakdown"]) == 15
        assert app["ai_justification"] == MOCK_AI_RESULT["justification"]
        assert app["status"] == "pending"
        assert "created_at" in app
        assert app["pet"] is not None
        assert app["pet"]["profile_id"] == "PR1"
        assert app["pet"]["title"] == "Friendly Dog"

    def test_list_applications_empty(self, client, db_session):
        user = _create_adopter_user(db_session)
        token = _create_adopter_token(user.user_id)
        _override_mongo_db(existing_apps=[])

        response = client.get(
            "/applications/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        _clear_mongo_override()
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert data["applications"] == []

    def test_list_applications_unauthorized_role(self, client, db_session):
        token = _create_admin_token()

        response = client.get(
            "/applications/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "Access denied" in response.json()["detail"]["message"]

    def test_list_applications_no_token(self, client):
        response = client.get("/applications/me")
        assert response.status_code == 401
