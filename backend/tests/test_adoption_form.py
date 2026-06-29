# Tests for adoption form endpoints
import asyncio
from unittest.mock import patch, MagicMock
from app.config import settings


def test_submit_adoption_form_success(client, db_session):
    # Test successful adoption form submission (Happy path)
    from app.models.user.user import User
    from app.models.user.adopter import Adopter
    from jose import jwt

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
    from jose import jwt

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
    assert "Access denied" in response.json()["detail"]["message"]


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
    from jose import jwt

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
    from jose import jwt

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
    from jose import jwt

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


def test_update_my_adoption_form_after_submit(client, db_session):
    # Test updating the form after submitting it
    from app.models.user.user import User
    from app.models.user.adopter import Adopter
    from jose import jwt

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
