# Authentication routes

# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

# SQLAlchemy imports
from sqlalchemy.orm import Session

# Database imports
from app.database.postgres.postgres_db import get_db

# Schema imports
from app.schemas.auth_schemas import (
    RegisterRequest,
    RegisterResponseAdmin,
    RegisterResponseAdopter,
    LoginRequest,
    LoginResponseAdmin,
    LoginResponseAdopter,
    UserResponseAdmin,
    UserResponseAdopter,
    UserListResponse,
)

# Service imports
from app.services.auth_service import (
    register_user,
    login_user,
    get_all_users,
)

# Create router with prefix and tags
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    # Endpoint to register a new user (Adopter/Admin)

    try:
        # Call service to register the user
        new_user = register_user(db, user_data)

        # Conditional based on requested role
        if user_data.requested_role.lower() == "admin":
            return RegisterResponseAdmin(
                message="User registered successfully", user_id=new_user.user_id
            )
        else:  # adopter
            created_at = getattr(new_user, "created_at", None)
            return RegisterResponseAdopter(
                message="User registered successfully",
                user_id=new_user.user_id,
                created_at=created_at if created_at else datetime.utcnow(),
            )
    except ValueError as e:
        if "Email already registered" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error_code": "EMAIL_EXISTS",
                    "message": "Email already registered",
                    "details": str(e),
                },
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error_code": "VALIDATION_ERROR",
                "message": "Validation error",
                "details": str(e),
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_code": "INTERNAL_ERROR",
                "message": "Internal server error",
                "details": str(e),
            },
        )


@router.post("/login", status_code=status.HTTP_200_OK)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # Endpoint for traditional login with email/password

    try:
        # Call service to authenticate the user
        user_response = login_user(db, login_data)

        # Conditional based on role
        if user_response.role == "admin":
            return LoginResponseAdmin(
                message="User successfully logged in",
                access_token="",
                token_type="bearer",
                user=UserResponseAdmin(
                    id=user_response.id,
                    first_name=user_response.first_name,
                    last_name=user_response.last_name,
                    email=user_response.email,
                    role=user_response.role,
                ),
            )
        else:  # adopter
            created_at = getattr(user_response, "created_at", None)
            return LoginResponseAdopter(
                message="User successfully logged in",
                access_token="",
                token_type="bearer",
                user=UserResponseAdopter(
                    id=user_response.id,
                    first_name=user_response.first_name,
                    last_name=user_response.last_name,
                    email=user_response.email,
                    role=user_response.role,
                    created_at=created_at if created_at else datetime.utcnow(),
                ),
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_code": "INVALID_CREDENTIALS",
                "message": "Invalid email or password",
                "details": str(e),
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_code": "INTERNAL_ERROR",
                "message": "Internal server error",
                "details": str(e),
            },
        )


@router.get("/list", response_model=UserListResponse, status_code=status.HTTP_200_OK)
def get_users(role: str = None, db: Session = Depends(get_db)):
    # Endpoint to get all users, optionally filtered by role

    try:
        # Call service to get users
        users = get_all_users(db, role)

        # Return user list
        return UserListResponse(users=users, total=len(users))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_code": "INTERNAL_ERROR",
                "message": "Internal server error",
                "details": str(e),
            },
        )
