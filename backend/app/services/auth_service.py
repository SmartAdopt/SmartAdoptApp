# Authentication service

# Bcrypt imports for password hashing
import bcrypt

# SQLAlchemy imports
from sqlalchemy.orm import Session
from sqlalchemy import text

# Schema imports
from typing import cast, Dict, Any

# JWT utilities
from app.utils.jwt.jwt_utils import create_access_token, create_refresh_token
import json
from datetime import timedelta, datetime
from app.config import settings
from app.database.redis.redis_db import get_redis_client

# Logger import
from app.utils.logger.logger_config import logger


def register_user(db: Session, user_data: Dict[str, Any]) -> Dict[str, Any]:
    # Register a new user based on requested role
    logger.info(f"Registration attempt for email: {user_data['email']}")

    # Check if email already exists in database
    existing_user = db.execute(
        text('SELECT user_id FROM "user" WHERE email = :email'),
        {"email": user_data["email"]},
    ).first()
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

    # Prepare common user data
    user_common_data = {
        "first_name": user_data["first_name"],
        "last_name": user_data["last_name"],
        "email": user_data["email"],
        "phone_number": user_data.get("phone_number"),
        "password_hash": hashed,
    }

    # Create user based on requested role
    if user_data["requested_role"].lower() == "admin":
        # Create Admin type user
        logger.info(f"Creating admin user with email: {user_data['email']}")
        # Insert into user table
        result = db.execute(
            text("""
                INSERT INTO "user" (first_name, last_name, email, phone_number, password_hash, type)
                VALUES (:first_name, :last_name, :email, :phone_number, :password_hash, 'admin')
                RETURNING user_id
            """),
            user_common_data,
        )
        user_id = result.scalar()
        # Insert into admin table
        db.execute(
            text("INSERT INTO admin (user_id) VALUES (:user_id)"), {"user_id": user_id}
        )
    elif user_data["requested_role"].lower() == "adopter":
        # Create Adopter type user
        logger.info(f"Creating adopter user with email: {user_data['email']}")
        # Insert into user table
        result = db.execute(
            text("""
                INSERT INTO "user" (first_name, last_name, email, phone_number, password_hash, type)
                VALUES (:first_name, :last_name, :email, :phone_number, :password_hash, 'adopter')
                RETURNING user_id
            """),
            user_common_data,
        )
        user_id = result.scalar()
        # Insert into adopter table
        db.execute(
            text("""
                INSERT INTO adopter (user_id, created_at)
                VALUES (:user_id, :created_at)
            """),
            {"user_id": user_id, "created_at": datetime.utcnow()},
        )
    else:
        # By default create base user
        logger.info(f"Creating base user with email: {user_data['email']}")
        # Insert into user table
        result = db.execute(
            text("""
                INSERT INTO "user" (first_name, last_name, email, phone_number, password_hash, type)
                VALUES (:first_name, :last_name, :email, :phone_number, :password_hash, 'user')
                RETURNING user_id
            """),
            user_common_data,
        )
        user_id = result.scalar()

    # Commit changes to database
    db.commit()

    logger.info(
        f"Registration successful for user ID: {user_id}, email: {user_data['email']}"
    )
    # Return created user as dict
    return {
        "user_id": user_id,
        "first_name": user_data["first_name"],
        "last_name": user_data["last_name"],
        "email": user_data["email"],
        "type": user_data["requested_role"].lower(),
    }


def login_user(db: Session, login_data: Dict[str, Any]) -> Dict[str, Any]:
    # Authenticate a user with email and password
    logger.info(f"Login attempt for email: {login_data['email']}")

    # Search for user by email in database
    user = db.execute(
        text("""
            SELECT user_id, first_name, last_name, email, password_hash, type
            FROM "user"
            WHERE email = :email
        """),
        {"email": login_data["email"]},
    ).first()
    if not user:
        # Throw error if user doesn't exist
        logger.warning(f"Login failed - user not found: {login_data['email']}")
        raise ValueError("Invalid email or password")

    # Convert Row to dict
    user_dict = {
        "user_id": user[0],
        "first_name": user[1],
        "last_name": user[2],
        "email": user[3],
        "password_hash": user[4],
        "type": user[5],
    }

    # Verify password using bcrypt
    if not bcrypt.checkpw(
        login_data["password"].encode("utf-8"),
        user_dict["password_hash"].encode("utf-8"),
    ):
        # Throw error if password is incorrect
        logger.warning(
            f"Login failed - invalid password for email: {login_data['email']}"
        )
        raise ValueError("Invalid email or password")

    # Generate JWT token only for admin or adopter roles
    refresh_token = ""
    if user_dict["type"].lower() in ["admin", "adopter"]:
        logger.info(
            f"Generating tokens for user ID: {user_dict['user_id']}, role: {user_dict['type']}"
        )
        access_token = create_access_token(
            cast(str, user_dict["email"]), cast(str, user_dict["type"])
        )
        refresh_token = create_refresh_token(
            cast(str, user_dict["email"]), cast(str, user_dict["type"])
        )

        # Save to Redis
        user_data_json = json.dumps(
            {
                "email": cast(str, user_dict["email"]),
                "role": cast(str, user_dict["type"]),
                "id": cast(int, user_dict["user_id"]),
            }
        )
        redis_client = get_redis_client()
        redis_client.setex(
            f"refresh_token:{refresh_token}",
            timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_data_json,
        )
    else:
        logger.warning(f"User type not eligible for tokens: {user_dict['type']}")
        access_token = ""

    # Create user response with necessary data and token
    user_response = {
        "token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer" if access_token else "",
        "id": cast(int, user_dict["user_id"]),
        "first_name": cast(str, user_dict["first_name"]),
        "last_name": cast(str, user_dict["last_name"]),
        "email": cast(str, user_dict["email"]),
        "role": cast(str, user_dict["type"]),
        "created_at": None,
    }

    logger.info(
        f"Login successful for user ID: {user_dict['user_id']}, email: {user_dict['email']}"
    )
    # Return user response with token
    return user_response


def oauth_login_or_register(
    db: Session, user_info: Dict[str, Any], role: str = "adopter"
) -> Dict[str, Any]:
    # Handle OAuth login or auto-registration
    logger.info(
        f"OAuth login/registration attempt for email: {user_info.get('email')}, role: {role}"
    )

    # Extract user info from Google
    email = user_info.get("email")
    first_name = user_info.get("given_name", "")
    last_name = user_info.get("family_name", "")

    # Check if user exists
    existing_user = db.execute(
        text("""
            SELECT user_id, first_name, last_name, email, type
            FROM "user"
            WHERE email = :email
        """),
        {"email": email},
    ).first()

    if existing_user:
        # User exists, generate token
        logger.info(f"OAuth login - existing user found: {email}")
        user_dict = {
            "user_id": existing_user[0],
            "first_name": existing_user[1],
            "last_name": existing_user[2],
            "email": existing_user[3],
            "type": existing_user[4],
        }
        refresh_token = ""
        if user_dict["type"].lower() in ["adopter"]:
            access_token = create_access_token(
                str(user_dict["email"]), str(user_dict["type"])
            )
            refresh_token = create_refresh_token(
                str(user_dict["email"]), str(user_dict["type"])
            )

            # Save to Redis
            user_data_json = json.dumps(
                {
                    "email": str(user_dict["email"]),
                    "role": str(user_dict["type"]),
                    "id": user_dict["user_id"],
                }
            )
            redis_client = get_redis_client()
            redis_client.setex(
                f"refresh_token:{refresh_token}",
                timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
                user_data_json,
            )
        else:
            access_token = ""

        logger.info(
            f"OAuth login successful for user ID: {user_dict['user_id']}, email: {email}"
        )
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer" if access_token else "",
            "message": "Login successful",
            "id": user_dict["user_id"],
            "first_name": user_dict["first_name"],
            "last_name": user_dict["last_name"],
            "email": user_dict["email"],
            "role": user_dict["type"],
            "created_at": None,
        }
    else:
        # User doesn't exist, auto-register with Google info
        logger.info(f"OAuth auto-registration for new user: {email}")
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
            # Insert into user table
            result = db.execute(
                text("""
                    INSERT INTO "user" (first_name, last_name, email, phone_number, password_hash, type)
                    VALUES (:first_name, :last_name, :email, :phone_number, :password_hash, 'admin')
                    RETURNING user_id
                """),
                user_common_data,
            )
            user_id = result.scalar()
            # Insert into admin table
            db.execute(
                text("INSERT INTO admin (user_id) VALUES (:user_id)"),
                {"user_id": user_id},
            )
            user_type = "admin"
        else:
            # Insert into user table
            result = db.execute(
                text("""
                    INSERT INTO "user" (first_name, last_name, email, phone_number, password_hash, type)
                    VALUES (:first_name, :last_name, :email, :phone_number, :password_hash, 'adopter')
                    RETURNING user_id
                """),
                user_common_data,
            )
            user_id = result.scalar()
            # Insert into adopter table
            db.execute(
                text("""
                    INSERT INTO adopter (user_id, created_at)
                    VALUES (:user_id, :created_at)
                """),
                {"user_id": user_id, "created_at": datetime.utcnow()},
            )
            user_type = "adopter"

        db.commit()

        # Generate token for new user
        access_token = create_access_token(str(email), str(user_type))
        refresh_token = create_refresh_token(str(email), str(user_type))

        # Save to Redis
        user_data_json = json.dumps(
            {
                "email": str(email),
                "role": str(user_type),
                "id": user_id,
            }
        )
        redis_client = get_redis_client()
        redis_client.setex(
            f"refresh_token:{refresh_token}",
            timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_data_json,
        )

        logger.info(
            f"OAuth auto-registration successful for user ID: {user_id}, email: {email}"
        )
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "message": "Registration successful",
            "id": user_id,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "role": user_type,
            "created_at": None,
        }


def refresh_tokens(refresh_token: str) -> Dict[str, str]:
    # Validate refresh token in Redis
    logger.info("Token refresh attempt")
    redis_client = get_redis_client()
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


def logout_user(refresh_token: str) -> None:
    # Delete refresh token from Redis
    logger.info("Logout attempt")
    if refresh_token:
        redis_client = get_redis_client()
        redis_client.delete(f"refresh_token:{refresh_token}")
        logger.info("Logout successful - refresh token deleted")
    else:
        logger.warning("Logout attempt - no refresh token provided")
