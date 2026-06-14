# fmt: off
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
from datetime import datetime
from jose import jwt

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

# Logger import
from app.utils.logger.logger_config import logger

# Create router with prefix and tags
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    # Endpoint to register a new user (Adopter/Admin)
    logger.info(
        f"POST /auth/register - Registration request for email: {user_data.email}"
    )
    try:
        # Call service to register the user
        new_user = register_user(db, user_data)
        # Conditional based on requested role
        if user_data.requested_role.lower() == "admin":
            logger.info(f"Registration successful - Admin user ID: {new_user.user_id}")
            return RegisterResponse(
                message="User registered successfully",
                user_id=new_user.user_id,
                created_at=getattr(new_user, "created_at", None),
            )

        else:  # adopter
            logger.info(
                f"Registration successful - Adopter user ID: {new_user.user_id}"
            )
            return RegisterResponse(
                message="User registered successfully",
                user_id=new_user.user_id,
                created_at=getattr(new_user, "created_at", None),
            )

    except ValueError as e:
        if "Email already registered" in str(e):
            logger.warning(
                f"Registration failed - Email already registered: {user_data.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"message": "Email already registered"},
            )

        else:
            logger.warning(
                f"Registration failed - Validation error for email: {user_data.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Validation error",
                },
            )

    except Exception as e:
        logger.error(
            f"Registration failed - Internal server error for email: {user_data.email}, error: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Internal server error",
            },
        )


@router.post("/login", status_code=status.HTTP_200_OK)
def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    # Endpoint for traditional login with email/password
    logger.info(f"POST /auth/login - Login request for email: {login_data.email}")
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

        logger.info(
            f"Login successful for user ID: {user_response['id']}, email: {login_data.email}"
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
        logger.warning(
            f"Login failed - Invalid credentials for email: {login_data.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": "Invalid email or password",
            },
        )

    except Exception as e:
        logger.error(
            f"Login failed - Internal server error for email: {login_data.email}, error: {str(e)}"
        )
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
    logger.info(f"GET /auth/login/google - OAuth login request with role: {role}")
    try:
        oauth = get_google_oauth()
# IMPORTANT: redirect_uri must use the same domain/host as the incoming request
        # so that the session cookie (with the OAuth state) is sent back in the callback.
        # The frontend opens the popup via VITE_API_URL=/api, which nginx proxies to the back
        # That is why the Host the browser sees is smartadoptlocal.programacionwebuce.net.
        # If redirect_uri were localhost:8000 (a different domain), the browser would not send
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
        
        logger.info(f"Redirecting to Google OAuth with redirect URI: {redirect_uri}")
        return await oauth.google.authorize_redirect(request, redirect_uri)
    except Exception as e:
        logger.error(f"OAuth redirect failed - error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_302_FOUND,
            detail={
                "message": "Redirect failed - Google OAuth not available",
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
    logger.info("GET /auth/google/callback - OAuth callback received")
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

        logger.info(
            f"OAuth callback - User info received for email: {user_info.get('email')}"
        )
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
        # We use BroadcastChannel as primary because Google sets
        # Cross-Origin-Opener-Policy:same-origin, which breaks window.opener
        # after the popup goes through Google's pages.
        # Fallback to window.opener.postMessage for test compatibility.
        html_content = f"""
        <html>
            <head><title>Autenticando...</title></head>
            <body>
                <p>Autenticando, por favor espere...</p>
                <script>
try {{
                        // Try BroadcastChannel first (works with Google's COOP)
                        const channel = new BroadcastChannel('oauth_channel');
                        channel.postMessage({json.dumps(response_data)});
                        channel.close();
                    }} catch (e) {{
                        console.error('BroadcastChannel error:', e);
                        // Fallback to window.opener.postMessage for tests
                        try {{
                            if (window.opener) {{
                                window.opener.postMessage({json.dumps(response_data)}, '*');
                            }}
                        }} catch (e2) {{
                            console.error('postMessage error:', e2);
                        }}
                    }}
                    // Cerramos el popup después de enviar el mensaje
                    setTimeout(() => window.close(), 300);
                </script>
            </body>
        </html>
        """
        logger.info(f"OAuth callback successful for user ID: {user_response.get('id')}")
        return HTMLResponse(content=html_content)

    except Exception as e:
        logger.exception(f"OAuth callback failed - error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


# Bearer scheme for access token validation
_bearer = HTTPBearer(auto_error=False)


@router.post(
    "/refresh", response_model=RefreshTokenResponse, status_code=status.HTTP_200_OK
)
def refresh(
    request: Request,
    response: Response,
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
):
    logger.info("POST /auth/refresh - Token refresh request")
    # Check if credentials are provided
    if credentials is None:
        logger.warning("Token refresh failed - No credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Not authenticated"},
        )
    # Check if access token is blacklisted (revoked)
    if is_token_blacklisted(credentials.credentials):
        logger.warning("Token refresh failed - Token has been revoked")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": "Token has been revoked",
            },
        )

    # Reject refresh if the current access token is still valid (not expired)
    token_status = decode_token_status(credentials.credentials)
    if token_status == "valid":
        logger.warning("Token refresh rejected - Access token is still valid")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Access token is still valid, refresh is not needed",
            },
        )

    # Validate that the refresh token cookie exists
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        logger.warning(
            "Token refresh failed - No active session found (no refresh token cookie)"
        )
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
        logger.info("Token refresh successful")
        return RefreshTokenResponse(
            access_token=tokens["access_token"],
            token_type="bearer",
        )
    except ValueError:
        logger.warning("Token refresh failed - No active session found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": "No active session found",
            },
        )
    except Exception as e:
        logger.error(f"Token refresh failed - Internal server error: {str(e)}")
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
credentials: Optional[HTTPAuthorizationCredentials] = Security(_optional_bearer),
):
    logger.info("POST /auth/logout - Logout request")
    try:
        # Validate that there is an active session cookie before attempting logout
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            logger.warning(
                "Logout failed - No active session found (no refresh token cookie)"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "message": "No active session found",
                },
            )

        # Add access token to blacklist if provided
        if credentials:
            try:
                token = credentials.credentials
                payload = jwt.decode(
                    token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
                )
                exp_timestamp = payload.get("exp")
                if exp_timestamp:
                    exp_datetime = datetime.fromtimestamp(exp_timestamp)
                    add_token_to_blacklist(token, exp_datetime)
                    logger.info("Access token added to blacklist")
            except HTTPException as e:
                raise e
            except jwt.ExpiredSignatureError:
                logger.warning("Logout - Access token already expired")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={
                        "message": "No active session found",
                    },
                )
            except jwt.JWTError:
                logger.warning("Logout - Invalid access token")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={
                        "message": "No active session found",
                    },
                )
            except Exception as e:
                logger.error(f"Logout - Error processing access token: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail={
                        "message": "Internal server error",
                    },
                )

        # Revoke the refresh token in Redis and clear the cookie
        logout_user(refresh_token)
        response.delete_cookie(
            key="refresh_token",
            secure=True,
            samesite="lax",
            httponly=True,
        )
        logger.info("Logout successful")
        return {"message": "Logged out successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout failed - Internal server error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Internal server error",
            },
        )
