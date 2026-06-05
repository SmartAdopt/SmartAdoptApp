# Authentication service

# Bcrypt imports for password hashing
import bcrypt

# SQLAlchemy imports
from sqlalchemy.orm import Session

# Model imports
from app.models import User, Admin, Adopter

# Schema imports
from app.schemas.auth_schemas import RegisterRequest, LoginRequest
from typing import Optional, cast


def register_user(db: Session, user_data: RegisterRequest):
    # Register a new user based on requested role

    # Check if email already exists in database
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        # Throw error if email is already registered
        raise ValueError("Email already registered")

    # Generate random salt for hashing
    salt = bcrypt.gensalt()
    # Hash password using bcrypt
    hashed = bcrypt.hashpw(user_data.password.encode("utf-8"), salt).decode("utf-8")

    # Prepare common user data
    user_common_data = {
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "email": user_data.email,
        "phone_number": user_data.phone_number,
        "password_hash": hashed,
    }

    # Create user based on requested role
    if user_data.requested_role.lower() == "admin":
        # Create Admin type user
        new_user = Admin(**user_common_data)
    elif user_data.requested_role.lower() == "adopter":
        # Create Adopter type user
        new_user = Adopter(**user_common_data)
    else:
        # By default create base user
        new_user = User(**user_common_data)

    # Add user to database session
    db.add(new_user)
    # Commit changes to database
    db.commit()
    # Refresh object to get database-generated data
    db.refresh(new_user)

    # Return created user
    return new_user


def login_user(db: Session, login_data: LoginRequest):
    # Authenticate a user with email and password

    # Search for user by email in database
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        # Throw error if user doesn't exist
        raise ValueError("Invalid email or password")

    # Verify password using bcrypt
    if not bcrypt.checkpw(
        login_data.password.encode("utf-8"), user.password_hash.encode("utf-8")
    ):
        # Throw error if password is incorrect
        raise ValueError("Invalid email or password")

    # Create user response with necessary data
    user_response = {
        "id": cast(int, user.user_id),
        "first_name": cast(str, user.first_name),
        "last_name": cast(str, user.last_name),
        "email": cast(str, user.email),
        "role": cast(str, user.type),
        "created_at": getattr(user, "created_at", None),
    }

    # Return user response
    return user_response


"""
def get_all_users(db: Session, role: Optional[str] = None):
    # Get all users, optionally filtered by role

    # Create base query for users
    query = db.query(User)

    # Filter by role if provided
    if role:
        query = query.filter(User.type == role.lower())

    # Execute query and get all users
    users = query.all()

    # Convert users to dictionary responses
    user_responses = [
        {
            "id": cast(int, user.user_id),
            "first_name": cast(str, user.first_name),
            "last_name": cast(str, user.last_name),
            "email": cast(str, user.email),
            "role": cast(str, user.type),
            "created_at": getattr(user, "created_at", None),
        }
        for user in users
    ]

    # Return list of user responses
    return user_responses
"""
