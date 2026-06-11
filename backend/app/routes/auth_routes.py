# Authentication routes
# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, status, Request

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
    oauth_login_or_register,
)

# Google OAuth
from app.utils.oauth.google_oauth import get_google_oauth

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
        # Return login response with all fields
        return LoginResponse(
            access_token=user_response["token"],
            token_type="bearer",
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


@router.get("/login/google")
async def login_google(request: Request, role: str = "adopter"):
    # Redirect to Google OAuth login
    #   role: Optional role for auto-registration (default: adopter)
    try:
        oauth = get_google_oauth()
        redirect_uri = request.url_for("google_callback")
        return await oauth.google.authorize_redirect(request, redirect_uri)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_302_FOUND,
            detail={"message": "Redirect failed - Google OAuth not available"},
        )


@router.get("/google/callback", name="google_callback")
async def google_callback(
    request: Request, role: str = "adopter", db: Session = Depends(get_db)
):
    # Handle Google OAuth callback
    #   role: Role for auto-registration (default: adopter)
    oauth = get_google_oauth()
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = await oauth.google.parse_id_token(request, token)

        # Call service layer to handle OAuth login or registration
        user_response = oauth_login_or_register(db, user_info, role)

        return LoginResponse(
            access_token=user_response["access_token"],
            token_type=user_response["token_type"],
            message=user_response["message"],
            id=user_response["id"],
            first_name=user_response["first_name"],
            last_name=user_response["last_name"],
            email=user_response["email"],
            role=user_response["role"],
            created_at=user_response["created_at"],
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Google authentication failed"},
        )
