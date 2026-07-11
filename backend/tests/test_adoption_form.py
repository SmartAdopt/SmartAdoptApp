# Tests for adoption form endpoints

from jose import jwt
from app.config import settings
from app.database.mongo.mongo_db import get_mongo_db
from app.main import app
from unittest.mock import MagicMock, AsyncMock
from datetime import datetime


def test_submit_adoption_form_success(client, db_session):
    # Test successful adoption form submission (Happy path)
    from app.models.user.user import User
    from app.models.user.adopter import Adopter

    user = User(
        first_name="Test",
        last_name="Adopter",
        email="testadopter_unique@test.com",
        phone_number="0934567890",
        password_hash="hashed_password",
        type="adopter",
    )
    db_session.add(user)
    db_session.commit()

    adopter = Adopter(user_id=user.user_id)
    db_session.add(adopter)
    db_session.commit()

    token_payload = {
        "sub": str(user.user_id),
        "role": "adopter",
        "exp": 9999999999,
    }
    adopter_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    form_data = {
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
        "preferred_gender": "female",
        "preferred_energy": "medium",
        "daily_time_dedication": "2-6",
        "sleeping_location": "inside",
        "behavior_approach": "positive_education",
        "emergency_plan": "family_friend",
        "motivation": "I want to provide a loving home to a pet in need.",
    }

    response = client.post(
        "/adoption-forms/submit",
        headers={"Authorization": f"Bearer {adopter_token}"},
        json=form_data,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Adoption form registered successfully"
    assert "form_id" in data
    assert "submission_date" in data


def test_submit_adoption_form_unauthorized_role(client, db_session):
    # Test submission with non-adopter role (Negative path)
    from app.models.user.user import User
    from app.models.user.admin import Admin

    user = User(
        first_name="Admin",
        last_name="User",
        email="admin_unique@test.com",
        phone_number="0934567891",
        password_hash="hashed_password",
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

    form_data = {
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
        "preferred_gender": "female",
        "preferred_energy": "medium",
        "daily_time_dedication": "2-6",
        "sleeping_location": "inside",
        "behavior_approach": "positive_education",
        "emergency_plan": "family_friend",
        "motivation": "I want to provide a living home to a pet in need.",
    }

    response = client.post(
        "/adoption-forms/submit",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=form_data,
    )

    assert response.status_code == 403


def test_review_adoption_form_success(client):
    # Admin reviews a pending application approving it
    app_doc = {
        "_id": "AP1",
        "form_id": "AF1",
        "pet_profile_id": "PR1",
        "total_score": 10,
        "total_max_score": 15,
        "main_score": 8,
        "main_max_score": 11,
        "logistics_education_score": 2,
        "logistics_education_max_score": 4,
        "ai_breakdown": [],
        "ai_justification": "ok",
        "status": "pending",
        "created_at": datetime.now(),
        "needs_manual_review": False,
    }
    pet_profile = {"_id": "PR1", "pet": {"name": "Max"}}

    app.dependency_overrides[get_mongo_db] = lambda: _make_mock_db(
        [], [app_doc], pet_profile
    )

    response = client.put(
        "/adoption-forms/AP1/review",
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )

    # Get the db mock to verify assertions
    mock_db = app.dependency_overrides[get_mongo_db]()
    app.dependency_overrides.pop(get_mongo_db, None)
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Application reviewed successfully"
    assert data["application_id"] == "AP1"
    assert data["status"] == "approved"
    
    # Verify that the applications collection update_one was called correctly
    apps_col = mock_db["applications"]
    assert apps_col.update_one.called
    call_args = apps_col.update_one.call_args[0]
    assert call_args[0] == {"_id": "AP1"}
    
    set_obj = call_args[1]["$set"]
    assert set_obj["status"] == "approved"
    assert set_obj["reviewed_by"] == 99  # 99 is the admin_id from _admin_token()
    assert "reviewed_at" in set_obj


def test_review_adoption_form_already_reviewed(client):
    # Re-reviewing an already reviewed application (with reviewed_by set) must fail
    app_doc = {
        "_id": "AP2",
        "form_id": "AF2",
        "pet_profile_id": "PR2",
        "status": "approved",
        "reviewed_by": 1,
        "reviewed_at": datetime.now(),
    }

    app.dependency_overrides[get_mongo_db] = lambda: _make_mock_db(
        [], [app_doc], {}
    )

    response = client.put(
        "/adoption-forms/AP2/review",
        json={"status": "rejected"},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )

    app.dependency_overrides.pop(get_mongo_db, None)
    assert response.status_code == 400
    msg = response.json()["detail"]["message"].lower()
    assert "already reviewed" in msg


def test_review_adoption_form_not_found(client):
    # Reviewing a non-existent application must fail
    app.dependency_overrides[get_mongo_db] = lambda: _make_mock_db(
        [], [], {}
    )

    response = client.put(
        "/adoption-forms/NOEXISTE/review",
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )

    app.dependency_overrides.pop(get_mongo_db, None)
    assert response.status_code == 400
    msg = response.json()["detail"]["message"].lower()
    assert "not found" in msg


def test_review_adoption_form_unauthorized_role(client):
    # Non-admin must be denied with 403
    app.dependency_overrides.pop(get_mongo_db, None)

    response = client.put(
        "/adoption-forms/AF1/review",
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {_adopter_token()}"},
    )

    assert response.status_code == 403

def test_submit_adoption_form_missing_token(client):
    # Test submission without token (Negative path)
    form_data = {
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
        "preferred_gender": "female",
        "preferred_energy": "medium",
        "daily_time_dedication": "2-6",
        "sleeping_location": "inside",
        "behavior_approach": "positive_education",
        "emergency_plan": "family_friend",
        "motivation": "I want to provide a living home to a pet in need.",
    }

    response = client.post(
        "/adoption-forms/submit",
        json=form_data,
    )

    assert response.status_code == 401


def test_get_my_adoption_form_no_form(client, db_session):
    # Test getting adoption form when user has none (should return 404)
    from app.models.user.user import User
    from app.models.user.adopter import Adopter

    user = User(
        first_name="Test",
        last_name="Adopter",
        email="no_form@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="adopter",
    )
    db_session.add(user)
    db_session.commit()

    adopter = Adopter(user_id=user.user_id)
    db_session.add(adopter)
    db_session.commit()

    token_payload = {
        "sub": str(user.user_id),
        "role": "adopter",
        "exp": 9999999999,
    }
    adopter_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    response = client.get(
        "/adoption-forms/me",
        headers={"Authorization": f"Bearer {adopter_token}"},
    )

    assert response.status_code == 404


def test_update_my_adoption_form_no_form(client, db_session):
    # Test updating adoption form when user has none (should return 400)
    from app.models.user.user import User
    from app.models.user.adopter import Adopter

    user = User(
        first_name="Test",
        last_name="Adopter",
        email="no_form_update@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="adopter",
    )
    db_session.add(user)
    db_session.commit()

    adopter = Adopter(user_id=user.user_id)
    db_session.add(adopter)
    db_session.commit()

    token_payload = {
        "sub": str(user.user_id),
        "role": "adopter",
        "exp": 9999999999,
    }
    adopter_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    update_data = {
        "neighborhood": "La Floresta",
    }

    response = client.put(
        "/adoption-forms/me",
        headers={"Authorization": f"Bearer {adopter_token}"},
        json=update_data,
    )

    assert response.status_code == 400


def test_get_my_adoption_form_after_submit(client, db_session):
    # Test getting the form immediately after submitting it
    from app.models.user.user import User
    from app.models.user.adopter import Adopter

    user = User(
        first_name="Test",
        last_name="Adopter",
        email="get_after_submit@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="adopter",
    )
    db_session.add(user)
    db_session.commit()

    adopter = Adopter(user_id=user.user_id)
    db_session.add(adopter)
    db_session.commit()

    token_payload = {
        "sub": str(user.user_id),
        "role": "adopter",
        "exp": 9999999999,
    }
    adopter_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # Submit a form
    form_data = {
        "neighborhood": "Quito - Center",
        "address": "Av. Amazonas N12-45 y Republica",
        "employment_status": "employed",
        "housing_type": "own_house",
        "has_natural_space": True,
        "has_pets": False,
        "household_energy": "moderate",
        "has_children": True,
        "children_ages": [5, 8],
        "long_term_commitment": True,
        "preferred_species": "dog",
        "preferred_gender": "female",
        "preferred_energy": "medium",
        "daily_time_dedication": "2-6",
        "sleeping_location": "inside",
        "behavior_approach": "positive_education",
        "emergency_plan": "family_friend",
        "motivation": "I want to adopt",
    }

    response = client.post(
        "/adoption-forms/submit",
        headers={"Authorization": f"Bearer {adopter_token}"},
        json=form_data,
    )

    assert response.status_code == 201

    # Now get the form
    response = client.get(
        "/adoption-forms/me",
        headers={"Authorization": f"Bearer {adopter_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["neighborhood"] == "Quito - Center"
    assert data["daily_time_dedication"] == "2-6"
    assert "applications" in data
    assert isinstance(data["applications"], list)


def test_update_my_adoption_form_after_submit(client, db_session):
    # Test updating the form after submitting it
    from app.models.user.user import User
    from app.models.user.adopter import Adopter

    user = User(
        first_name="Test",
        last_name="Adopter",
        email="update_after_submit@test.com",
        phone_number="1234567890",
        password_hash="hashed_password",
        type="adopter",
    )
    db_session.add(user)
    db_session.commit()

    adopter = Adopter(user_id=user.user_id)
    db_session.add(adopter)
    db_session.commit()

    token_payload = {
        "sub": str(user.user_id),
        "role": "adopter",
        "exp": 9999999999,
    }
    adopter_token = jwt.encode(
        token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    # Submit a form
    form_data = {
        "neighborhood": "Quito - Center",
        "address": "Av. Amazonas N12-45 y Republica",
        "employment_status": "employed",
        "housing_type": "own_house",
        "has_natural_space": True,
        "has_pets": False,
        "household_energy": "moderate",
        "has_children": True,
        "children_ages": [5, 8],
        "long_term_commitment": True,
        "preferred_species": "dog",
        "preferred_gender": "female",
        "preferred_energy": "medium",
        "daily_time_dedication": "2-6",
        "sleeping_location": "inside",
        "behavior_approach": "positive_education",
        "emergency_plan": "family_friend",
        "motivation": "I want to adopt",
    }

    response = client.post(
        "/adoption-forms/submit",
        headers={"Authorization": f"Bearer {adopter_token}"},
        json=form_data,
    )

    assert response.status_code == 201

    # Now update the form
    update_data = {
        "neighborhood": "La Floresta",
        "address": "Calle Principal 456",
        "daily_time_dedication": "6+",
    }

    response = client.put(
        "/adoption-forms/me",
        headers={"Authorization": f"Bearer {adopter_token}"},
        json=update_data,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Adoption form updated successfully"
    assert data["form"]["neighborhood"] == "La Floresta"
    assert data["form"]["address"] == "Calle Principal 456"
    assert data["form"]["daily_time_dedication"] == "6+"


def _make_mock_db(forms, applications, pet_profile):
    def _cursor(items):
        c = AsyncMock()
        c.to_list = AsyncMock(return_value=items)
        return c

    forms_col = MagicMock()
    forms_col.find = MagicMock(return_value=_cursor(forms))
    forms_col.find_one = AsyncMock(return_value=forms[0] if forms else None)
    forms_col.update_one = AsyncMock()
    apps_col = MagicMock()
    apps_col.find = MagicMock(return_value=_cursor(applications))
    apps_col.find_one = AsyncMock(side_effect=lambda q: next(
        (a for a in applications if a.get("_id") == q.get("_id")), None
    ))
    apps_col.update_one = AsyncMock()
    apps_col.update_many = AsyncMock()
    profiles_col = MagicMock()
    profiles_col.find_one = AsyncMock(return_value=pet_profile)
    profiles_col.update_one = AsyncMock()
    profiles_col.update_many = AsyncMock()

    collections = {
        "adoption_forms": forms_col,
        "applications": apps_col,
        "pet_profiles": profiles_col,
    }

    class _DB:
        def __getitem__(self, name):
            return collections.get(name, MagicMock())

    return _DB()


def _admin_token():
    payload = {"sub": "99", "role": "admin", "exp": 9999999999}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _adopter_token(sub="98"):
    payload = {"sub": sub, "role": "adopter", "exp": 9999999999}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def test_get_all_adoption_forms_admin_pet_name_match(client):
    # Admin list filtered by status + pet_name should return the matching form
    now = datetime.now()
    form_doc = {
        "_id": "AF1",
        "user_id": 5,
        "status": "approved",
        "submitted_at": now,
        "reviewed_at": now,
    }
    app_docs = [
        {
            "_id": "APP1",
            "form_id": "AF1",
            "pet_profile_id": "PR1",
            "total_score": 10,
            "total_max_score": 15,
            "main_score": 8,
            "main_max_score": 11,
            "logistics_education_score": 2,
            "logistics_education_max_score": 4,
            "ai_breakdown": [],
            "ai_justification": "ok",
            "status": "approved",
            "created_at": datetime.now(),
            "needs_manual_review": False,
        }
    ]
    pet_profile = {"_id": "PR1", "pet": {"name": "Max"}}

    app.dependency_overrides[get_mongo_db] = lambda: _make_mock_db(
        [form_doc], app_docs, pet_profile
    )

    response = client.get(
        "/adoption-forms/admin?status=approved&pet_name=Max",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )

    app.dependency_overrides.pop(get_mongo_db, None)
    assert response.status_code == 200
    data = response.json()
    assert data["applications_count"] == 1
    assert len(data["forms"]) == 1
    assert data["forms"][0]["applications"][0]["pet_name"] == "Max"
    assert data["forms"][0]["applications"][0]["needs_manual_review"] is False


def test_get_all_adoption_forms_admin_pet_name_no_match(client):
    # A pet_name with no match must return 404 (empty list)
    form_doc = {
        "_id": "AF1",
        "user_id": 5,
        "status": "approved",
        "submitted_at": datetime.now(),
    }
    app_docs = [
        {
            "_id": "APP1",
            "form_id": "AF1",
            "pet_profile_id": "PR1",
            "total_score": 10,
            "total_max_score": 15,
            "main_score": 8,
            "main_max_score": 11,
            "logistics_education_score": 2,
            "logistics_education_max_score": 4,
            "ai_breakdown": [],
            "ai_justification": "ok",
            "status": "approved",
            "created_at": datetime.now(),
            "needs_manual_review": False,
        }
    ]
    pet_profile = {"_id": "PR1", "pet": {"name": "Max"}}

    app.dependency_overrides[get_mongo_db] = lambda: _make_mock_db(
        [form_doc], app_docs, pet_profile
    )

    response = client.get(
        "/adoption-forms/admin?pet_name=Zoe",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )

    app.dependency_overrides.pop(get_mongo_db, None)
    assert response.status_code == 404


def test_get_all_adoption_forms_admin_requires_admin_role(client):
    # Non-admin (adopter) role must be denied with 403
    app.dependency_overrides.pop(get_mongo_db, None)

    response = client.get(
        "/adoption-forms/admin",
        headers={"Authorization": f"Bearer {_adopter_token()}"},
    )

    assert response.status_code == 403
