# Authentication service

# Bcrypt imports for password hashing
import bcrypt

# SQLAlchemy imports
from sqlalchemy.orm import Session

# Model imports
from app.models import User, Admin, Adopter

# Schema imports
from app.schemas.auth_schemas import RegisterRequest, LoginRequest
from typing import cast, Dict, Any

# JWT utilities
from app.utils.jwt.jwt_utils import create_access_token, create_refresh_token
import json
from datetime import timedelta
from app.config import settings
from app.database.redis import redis_client


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

    # Generate JWT token only for admin or adopter roles
    refresh_token = ""
    if user.type.lower() in ["admin", "adopter"]:
        access_token = create_access_token(cast(str, user.email), cast(str, user.type))
        refresh_token = create_refresh_token(
            cast(str, user.email), cast(str, user.type)
        )

        # Save to Redis
        user_data_json = json.dumps(
            {
                "email": cast(str, user.email),
                "role": cast(str, user.type),
                "id": cast(int, user.user_id),
            }
        )
        redis_client.setex(
            f"refresh_token:{refresh_token}",
            timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_data_json,
        )
    else:
        access_token = ""

    # Create user response with necessary data and token
    user_response = {
        "token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer" if access_token else "",
        "id": cast(int, user.user_id),
        "first_name": cast(str, user.first_name),
        "last_name": cast(str, user.last_name),
        "email": cast(str, user.email),
        "role": cast(str, user.type),
        "created_at": getattr(user, "created_at", None),
    }

    # Return user response with token
    return user_response


def oauth_login_or_register(
    db: Session, user_info: Dict[str, Any], role: str = "adopter"
) -> Dict[str, Any]:
    # Handle OAuth login or auto-registration

    # Extract user info from Google
    email = user_info.get("email")
    first_name = user_info.get("given_name", "")
    last_name = user_info.get("family_name", "")

    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        # User exists, generate token
        refresh_token = ""
        if existing_user.type.lower() in ["adopter"]:
            access_token = create_access_token(
                str(existing_user.email), str(existing_user.type)
            )
            refresh_token = create_refresh_token(
                str(existing_user.email), str(existing_user.type)
            )

            # Save to Redis
            user_data_json = json.dumps(
                {
                    "email": str(existing_user.email),
                    "role": str(existing_user.type),
                    "id": existing_user.user_id,
                }
            )
            redis_client.setex(
                f"refresh_token:{refresh_token}",
                timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
                user_data_json,
            )
        else:
            access_token = ""

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer" if access_token else "",
            "message": "Login successful",
            "id": existing_user.user_id,
            "first_name": existing_user.first_name,
            "last_name": existing_user.last_name,
            "email": existing_user.email,
            "role": existing_user.type,
            "created_at": getattr(existing_user, "created_at", None),
        }
    else:
        # User doesn't exist, auto-register with Google info
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(b"google_oauth_user", salt).decode("utf-8")

        user_common_data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone_number": "",
            "password_hash": hashed,
        }

        # Create user based on role
        if role.lower() == "admin":
            new_user = Admin(**user_common_data)
        else:
            new_user = Adopter(**user_common_data)

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate token for new user
        access_token = create_access_token(str(new_user.email), str(new_user.type))
        refresh_token = create_refresh_token(str(new_user.email), str(new_user.type))

        # Save to Redis
        user_data_json = json.dumps(
            {
                "email": str(new_user.email),
                "role": str(new_user.type),
                "id": new_user.user_id,
            }
        )
        redis_client.setex(
            f"refresh_token:{refresh_token}",
            timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_data_json,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "message": "Registration successful",
            "id": new_user.user_id,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "email": new_user.email,
            "role": new_user.type,
            "created_at": getattr(new_user, "created_at", None),
        }


def refresh_tokens(refresh_token: str) -> Dict[str, str]:
    # Validate refresh token in Redis
    user_data_json = redis_client.get(f"refresh_token:{refresh_token}")
    if not user_data_json:
        raise ValueError("No active session found")

    # Rotate refresh token: delete old one
    redis_client.delete(f"refresh_token:{refresh_token}")

    # Parse user data
    user_data = json.loads(user_data_json)
    email = user_data["email"]
    role = user_data["role"]

    # Generate new tokens
    new_access_token = create_access_token(email, role)
    new_refresh_token = create_refresh_token(email, role)

    # Store new refresh token in Redis
    redis_client.setex(
        f"refresh_token:{new_refresh_token}",
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        user_data_json,
    )

    return {"access_token": new_access_token, "refresh_token": new_refresh_token}


def logout_user(refresh_token: str) -> None:
    # Delete refresh token from Redis
    if refresh_token:
        redis_client.delete(f"refresh_token:{refresh_token}")
