# Authentication routes
# FastAPI imports
# Fix CI formatting
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Request,
    Response,
    Security,
)
from fastapi.responses import HTMLResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import json
import traceback

# SQLAlchemy imports
from sqlalchemy.orm import Session

# Database imports
from app.database.postgres.postgres_db import get_db
from app.config import settings

# Schema imports
from app.schemas.auth_schemas import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    RefreshTokenResponse,
)

# Service imports
from app.services.auth_service import (
    register_user,
    login_user,
    oauth_login_or_register,
    refresh_tokens,
    logout_user,
)

# Google OAuth
from app.utils.oauth.google_oauth import get_google_oauth
from app.utils.jwt.jwt_utils import (
    decode_token_status,
    add_token_to_blacklist,
    is_token_blacklisted,
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
def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    # Endpoint for traditional login with email/password
    try:
        # Call service to authenticate the user
        user_response = login_user(db, login_data)

        # Set the refresh token in an HTTP-Only cookie
        refresh_token = user_response.get("refresh_token")
        if refresh_token:
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,  # HTTPS only (cookies sent only over secure connections)
                samesite="lax",  # CSRF protection
                max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            )

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
        # IMPORTANT: redirect_uri must use the same domain/host as the
        # incoming request
        # so that the session cookie (with the OAuth state) is sent back
        # in the callback.
        # The frontend opens the popup via VITE_API_URL=/api, which nginx
        # PROXIES to the back
        # That is why the Host the browser sees is
        # smartadoptlocal.programacionwebuce.net.
        # If redirect_uri were localhost:8000 (a different domain),
        # the browser would not send
        # the session cookie -> CSRF state mismatch.
        # We detect the host of the incoming request and build the
        # redirect_uri dynamically.
        forwarded_proto = request.headers.get("X-Forwarded-Proto", "http")
        host = request.headers.get("X-Forwarded-Host") or request.headers.get(
            "Host", "localhost:8000"
        )
        redirect_uri = f"{forwarded_proto}://{host}/api/auth/google/callback"
        # Save the role in session to retrieve it in the callback
        request.session["oauth_role"] = role
        print(f"[OAuth] redirect_uri={redirect_uri}")
        return await oauth.google.authorize_redirect(request, redirect_uri)
    except Exception as e:
        print(f"ERROR en login_google: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": (
                    f"Redirect failed - Google OAuth not available: "
                    f"{str(e)}"
                )
            },
        )


@router.get("/google/callback", name="google_callback")
async def google_callback(
    request: Request,
    response: Response,
    role: str = "adopter",
    db: Session = Depends(get_db),
):
    # Handle Google OAuth callback
    #   role: Role for auto-registration (default: adopter)
    oauth = get_google_oauth()
    try:
        token = await oauth.google.authorize_access_token(request)

        # Extract user info from token
        user_info = token.get("userinfo")
        if not user_info:
            user_info = await oauth.google.parse_id_token(request, token)

        # The role can come from the session (set in login_google)
        # or from the query parameter (default to "adopter").
        # If not in session, use the query parameter or default
        role = request.session.pop("oauth_role", role)

        # Call service layer to handle OAuth login or registration
        user_response = oauth_login_or_register(db, user_info, role)

        # Set the refresh token in an HTTP-Only cookie
        # NOTA: secure=False for develop
        refresh_token = user_response.get("refresh_token")
        if refresh_token:
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=False,  # False para HTTP local, True en producción HTTPS
                samesite="lax",
                max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            )

        # Prepare JSON response data
        response_data = {
            "access_token": user_response.get("access_token"),
            "refresh_token": refresh_token,
            "id": user_response.get("id"),
            "first_name": user_response.get("first_name"),
            "last_name": user_response.get("last_name"),
            "email": user_response.get("email"),
            "role": user_response.get("role"),
        }

        # IMPORTANT: The origin must match exactly where the frontend is running
        # Local: http://smartadoptlocal.programacionwebuce.net (port 80)
        # We use BroadcastChannel instead of window.opener.postMessage bC Google
        # sets Cross-Origin-Opener-Policy:same-origin, which breaks window.opener
        # after the popup goes through Google's pages.
        html_content = f"""
        <html>
            <head><title>Autenticando...</title></head>
            <body>
                <p>Autenticando, por favor espere...</p>
                <script>
                    try {{
                        // BroadcastChannel funciona entre páginas del mismo origen
                        // sin depender de window.opener (que COOP de Google rompe)
                        const channel = new BroadcastChannel('oauth_channel');
                        channel.postMessage({json.dumps(response_data)});
                        channel.close();
                    }} catch (e) {{
                        console.error('BroadcastChannel error:', e);
                    }}
                    // Cerramos el popup después de enviar el mensaje
                    setTimeout(() => window.close(), 300);
                </script>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content)

    except Exception as e:
        # Log del error real para debugging
        print(f"ERROR FATAL EN OAUTH CALLBACK: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": f"OAuth callback error: {str(e)}"},
        )


# Bearer scheme for access token validation
_bearer = HTTPBearer(auto_error=True)
_optional_bearer = HTTPBearer(auto_error=False)


@router.post(
    "/refresh", response_model=RefreshTokenResponse, status_code=status.HTTP_200_OK
)
def refresh(
    request: Request,
    response: Response,
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
):
    # Check if access token is blacklisted (revoked)
    if is_token_blacklisted(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": "Token has been revoked",
            },
        )

    # Reject refresh if the current access token is still valid (not expired)
    token_status = decode_token_status(credentials.credentials)
    if token_status == "valid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Access token is still valid, refresh is not needed",
            },
        )

    # Validate that the refresh token cookie exists
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": "No active session found",
            },
        )

    try:
        tokens = refresh_tokens(refresh_token)
        # Set the new rotated refresh token in the cookie
        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=True,
            secure=True,  # HTTPS only
            samesite="lax",  # CSRF protection
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        )
        return RefreshTokenResponse(
            access_token=tokens["access_token"],
            token_type="bearer",
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": "No active session found",
            },
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Internal server error",
            },
        )


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    request: Request,
    response: Response,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(
        _optional_bearer
    ),
):
    try:
        # Validate that there is an active session cookie before attempting logout
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "message": "No active session found",
                },
            )

        # Add access token to blacklist if provided
        if credentials:
            from jose import jwt
            from app.config import settings
            from datetime import datetime

            try:
                token = credentials.credentials
                payload = jwt.decode(
                    token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
                )
                exp_timestamp = payload.get("exp")
                if exp_timestamp:
                    exp_datetime = datetime.fromtimestamp(exp_timestamp)
                    add_token_to_blacklist(token, exp_datetime)
            except HTTPException as e:
                raise e
            except jwt.ExpiredSignatureError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={
                        "message": "No active session found",
                    },
                )
            except jwt.JWTError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={
                        "message": "No active session found",
                    },
                )
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail={
                        "message": "Internal server error",
                    },
                )
            except Exception:
                pass  # If token is invalid, just continue with logout

        # Revoke the refresh token in Redis and clear the cookie
        logout_user(refresh_token)
        response.delete_cookie(
            key="refresh_token",
            secure=True,
            samesite="lax",
            httponly=True,
        )
        return {"message": "Logged out successfully"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Internal server error",
            },
        )