# Authentication routes

# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

# SQLAlchemy imports
from sqlalchemy.orm import Session

# Database imports
from app.database.postgres.postgres_db import get_db

# Schema imports
from app.schemas.auth_schemas import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
)

# Service imports
from app.services.auth_service import (
    register_user,
    login_user,
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
            return RegisterResponse(
                message="User registered successfully",
                user_id=new_user.user_id,
                created_at=getattr(new_user, "created_at", None),
            )
        else:  # adopter
            return RegisterResponse(
                message="User registered successfully",
                user_id=new_user.user_id,
                created_at=getattr(new_user, "created_at", None),
            )
    except ValueError as e:
        if "Email already registered" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"message": "Email already registered"},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Validation error",
                },
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Internal server error",
            },
        )


@router.post("/login", status_code=status.HTTP_200_OK)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # Endpoint for traditional login with email/password

    try:
        # Call service to authenticate the user
        user_response = login_user(db, login_data)

        # Generate mock JWT token
        access_token = ""

        # Return login response with all fields
        return LoginResponse(
            access_token=access_token,
            message="Login successful",
            id=user_response["id"],
            first_name=user_response["first_name"],
            last_name=user_response["last_name"],
            email=user_response["email"],
            role=user_response["role"],
            created_at=user_response["created_at"],
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": "Invalid email or password",
            },
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Internal server error",
            },
        )

"""
@router.get("/list", response_model=UserListResponse, status_code=status.HTTP_200_OK)
def get_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    # Endpoint to get all users, optionally filtered by role

    try:
        # Call service to get users
        users = get_all_users(db, role)

        # Return user list
        return UserListResponse(users=users, total=len(users))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Internal server error",
            },
        )
"""