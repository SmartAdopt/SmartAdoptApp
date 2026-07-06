# Authentication service


# Bcrypt imports for password hashing

import bcrypt

# SQLAlchemy imports

from sqlalchemy.orm import Session

# Model imports

from app.models.user.user import User

from app.models.user.admin import Admin

from app.models.user.adopter import Adopter

# Schema imports

from typing import cast, Dict, Any

# JWT utilities

from app.utils.jwt.jwt_utils import create_access_token, create_refresh_token

import json

from datetime import timedelta, datetime

from app.config import settings

# Logger import

from app.utils.logger.logger_config import logger


def register_user(
    db: Session, redis_client, user_data: Dict[str, Any]
) -> Dict[str, Any]:

    # Register a new user based on requested role

    logger.info(f"Registration attempt for email: {user_data['email']}")

    # Check if email already exists in database using model

    existing_user = db.query(User).filter(User.email == user_data["email"]).first()

    if existing_user:

        # Throw error if email is already registered

        logger.warning(
            f"Registration failed - email already registered: {user_data['email']}"
        )

        raise ValueError("Email already registered")

    # Generate random salt for hashing

    salt = bcrypt.gensalt()

    # Hash password using bcrypt

    hashed = bcrypt.hashpw(user_data["password"].encode("utf-8"), salt).decode("utf-8")

    # Create user based on requested role using SQLAlchemy models

    logger.info(f"Requested role: {user_data.get('requested_role')}")

    if user_data["requested_role"].lower() == "admin":

        # Create Admin type user

        logger.info(f"Creating admin user with email: {user_data['email']}")

        # Create User model instance

        user = User(
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            email=user_data["email"],
            phone_number=user_data.get("phone_number"),
            password_hash=hashed,
            type="admin",
        )

        logger.info(f"User instance created: {user}")

        db.add(user)  # Add to session

        db.flush()  # Flush to get user_id

        # Create Admin model instance

        admin = Admin(user_id=user.user_id)

        db.add(admin)  # Add to session

    elif user_data["requested_role"].lower() == "adopter":

        # Create Adopter type user

        logger.info(f"Creating adopter user with email: {user_data['email']}")

        # Create User model instance

        user = User(
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            email=user_data["email"],
            phone_number=user_data.get("phone_number"),
            password_hash=hashed,
            type="adopter",
        )

        logger.info(f"User instance created: {user}")

        db.add(user)  # Add to session

        db.flush()  # Flush to get user_id

        # Create Adopter model instance

        adopter = Adopter(user_id=user.user_id, created_at=datetime.utcnow())

        db.add(adopter)  # Add to session

    else:

        # By default create base user

        logger.info(f"Creating base user with email: {user_data['email']}")

        # Create User model instance

        user = User(
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            email=user_data["email"],
            phone_number=user_data.get("phone_number"),
            password_hash=hashed,
            type="user",
        )

        db.add(user)  # Add to session

    # Commit changes to database

    db.commit()

    # Get created_at for adopter if applicable

    created_at = None

    if user_data["requested_role"].lower() == "adopter":

        # Refresh to get the adopter relationship

        db.refresh(user)

        if user.adopter:

            created_at = user.adopter.created_at

    logger.info(
        f"Registration successful for user ID: {user.user_id}, email: {user_data['email']}"
    )

    # Return created user as dict

    return {
        "user_id": user.user_id,  # User ID from database
        "first_name": user.first_name,  # User first name
        "last_name": user.last_name,  # User last name
        "email": user.email,  # User email
        "type": user.type,  # User role (admin/adopter)
        "created_at": created_at,  # Account creation timestamp (only for adopter)
    }


def login_user(db: Session, redis_client, login_data: Dict[str, Any]) -> Dict[str, Any]:

    # Authenticate a user with email and password

    logger.info(f"Login attempt for email: {login_data['email']}")

    # Search for user by email in database using model

    user = db.query(User).filter(User.email == login_data["email"]).first()

    if not user:

        # Throw error if user doesn't exist

        logger.warning(f"Login failed - user not found: {login_data['email']}")

        raise ValueError("Invalid email or password")

    # User object from SQLAlchemy model (already has all fields)

    # No need to convert to dict, use user object directly

    # Get created_at for adopter if applicable

    created_at = None

    if user.type.lower() == "adopter":

        # Refresh to get the adopter relationship

        db.refresh(user)

        if user.adopter:

            created_at = user.adopter.created_at

    # Verify password using bcrypt

    if not bcrypt.checkpw(
        login_data["password"].encode("utf-8"),
        user.password_hash.encode("utf-8"),
    ):

        # Throw error if password is incorrect

        logger.warning(
            f"Login failed - invalid password for email: {login_data['email']}"
        )

        raise ValueError("Invalid email or password")

    # Generate JWT token only for admin or adopter roles

    refresh_token = ""

    if user.type.lower() in ["admin", "adopter"]:

        logger.info(f"Generating tokens for user ID: {user.user_id}, role: {user.type}")

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

        logger.warning(f"User type not eligible for tokens: {user.type}")

        access_token = ""

    # Create user response with necessary data and token

    user_response = {
        "token": access_token,  # JWT access token
        "refresh_token": refresh_token,  # JWT refresh token for rotation
        "token_type": "bearer" if access_token else "",  # Token type
        "id": cast(int, user.user_id),  # User ID
        "first_name": cast(str, user.first_name),  # User first name
        "last_name": cast(str, user.last_name),  # User last name
        "email": cast(str, user.email),  # User email
        "role": cast(str, user.type),  # User role (admin/adopter)
        "created_at": created_at,  # Account creation timestamp (only for adopter)
    }

    logger.info(f"Login successful for user ID: {user.user_id}, email: {user.email}")

    # Return user response with token

    return user_response


def oauth_login_or_register(
    db: Session, redis_client, user_info: Dict[str, Any], role: str = "adopter"
) -> Dict[str, Any]:

    # Handle OAuth login or auto-registration

    logger.info(
        f"OAuth login/registration attempt for email: {user_info.get('email')}, role: {role}"
    )

    # Extract user info from Google

    email = user_info.get("email")

    first_name = user_info.get("given_name", "")

    last_name = user_info.get("family_name", "")

    # Check if user exists using model

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:

        # User exists, generate token

        logger.info(f"OAuth login - existing user found: {email}")

        # Get created_at for adopter if applicable

        created_at = None

        if existing_user.type.lower() == "adopter":

            # Refresh to get the adopter relationship

            db.refresh(existing_user)

            if existing_user.adopter:

                created_at = existing_user.adopter.created_at

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
                    "email": str(existing_user.email),  # User email
                    "role": str(existing_user.type),  # User role
                    "id": existing_user.user_id,  # User ID
                }
            )

            redis_client.setex(
                f"refresh_token:{refresh_token}",  # Redis key with token
                timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),  # TTL in days
                user_data_json,  # User data as JSON
            )

        else:

            access_token = ""

        logger.info(
            f"OAuth login successful for user ID: {existing_user.user_id}, email: {email}"
        )

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
            "created_at": created_at,  # Account creation timestamp (only for adopter)
        }

    else:

        # User doesn't exist, auto-register with Google info

        logger.info(f"OAuth auto-registration for new user: {email}")

        salt = bcrypt.gensalt()

        hashed = bcrypt.hashpw(b"google_oauth_user", salt).decode("utf-8")

        # Create user based on role using SQLAlchemy models

        if role.lower() == "admin":

            # Create User model instance

            user = User(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone_number="",
                password_hash=hashed,
                type="admin",
            )

            db.add(user)  # Add to session

            db.flush()  # Flush to get user_id

            # Create Admin model instance

            admin = Admin(user_id=user.user_id)

            db.add(admin)  # Add to session

            user_type = "admin"

        else:

            # Create User model instance

            user = User(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone_number="",
                password_hash=hashed,
                type="adopter",
            )

            db.add(user)  # Add to session

            db.flush()  # Flush to get user_id

            # Create Adopter model instance

            adopter = Adopter(user_id=user.user_id, created_at=datetime.utcnow())

            db.add(adopter)  # Add to session

            user_type = "adopter"

        db.commit()

        # Get created_at for adopter if applicable

        created_at = None

        if user_type == "adopter":

            # Refresh to get the adopter relationship

            db.refresh(user)

            if user.adopter:

                created_at = user.adopter.created_at

        # Generate token for new user

        access_token = create_access_token(str(email), str(user_type))

        refresh_token = create_refresh_token(str(email), str(user_type))

        # Save to Redis

        user_data_json = json.dumps(
            {
                "email": str(email),
                "role": str(user_type),
                "id": user.user_id,
            }
        )

        redis_client.setex(
            f"refresh_token:{refresh_token}",
            timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_data_json,
        )

        logger.info(
            f"OAuth auto-registration successful for user ID: {user.user_id}, email: {email}"
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "message": "Registration successful",
            "id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.type,
            "created_at": created_at,  # Account creation timestamp (only for adopter)
        }


def refresh_tokens(redis_client, refresh_token: str) -> Dict[str, str]:

    # Validate refresh token in Redis

    logger.info("Token refresh attempt")

    user_data_json = redis_client.get(f"refresh_token:{refresh_token}")

    if not user_data_json:

        logger.warning("Token refresh failed - no active session found")

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

    logger.info(f"Token refresh successful for email: {email}")

    return {"access_token": new_access_token, "refresh_token": new_refresh_token}


def logout_user(redis_client, refresh_token: str) -> None:

    # Delete refresh token from Redis

    logger.info("Logout attempt")

    if refresh_token:

        redis_client.delete(f"refresh_token:{refresh_token}")

        logger.info("Logout successful - refresh token deleted")

    else:

        logger.warning("Logout attempt - no refresh token provided")
