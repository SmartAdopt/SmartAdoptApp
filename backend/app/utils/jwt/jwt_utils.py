# JWT utilities for authentication

from datetime import datetime, timedelta
from typing import Dict, Any
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt, ExpiredSignatureError
from app.config import settings
from app.database.redis.redis_db import get_redis_client

# Logger import
from app.utils.logger.logger_config import logger

# JWT Configuration
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

# HTTP Bearer scheme for token extraction
security = HTTPBearer(auto_error=False)


def create_access_token(email: str, role: str) -> str:
    # Create a JWT access token with user data and expiration
    logger.debug(f"Creating access token for email: {email}, role: {role}")
    # Calculate expiration time (current time + configured minutes)
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Create token payload with user data and expiration
    to_encode = {
        "sub": email,
        "role": role,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
    }

    # Encode and sign the token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.debug(f"Access token created for email: {email}")
    return encoded_jwt


def create_refresh_token(email: str, role: str) -> str:
    # Create a JWT refresh token with user data and expiration
    logger.debug(f"Creating refresh token for email: {email}, role: {role}")
    # Calculate expiration time (current time + configured days)
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    # Create token payload with user data and expiration
    to_encode = {
        "sub": email,
        "role": role,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh",
    }

    # Encode and sign the token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.debug(f"Refresh token created for email: {email}")
    return encoded_jwt


def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> Dict[str, Any]:
    # FastAPI dependency to verify JWT token from Authorization header
    logger.debug("Verifying JWT token")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"message": "Could not validate credentials"},
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        logger.warning("Token verification failed - No credentials provided")
        raise credentials_exception

    try:
        # Extract token from credentials
        token = credentials.credentials

        # Check if token is blacklisted (revoked)
        if is_token_blacklisted(token):
            logger.warning("Token verification failed - Token is blacklisted")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Token has been revoked"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Decode and verify the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.debug(f"Token verified successfully for email: {payload.get('sub')}")
        return payload

    except ExpiredSignatureError:
        logger.warning("Token verification failed - Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Token expired"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        logger.warning(f"Token verification failed - JWT error: {str(e)}")
        raise credentials_exception


def decode_token_status(token: str) -> str:
    # Returns 'valid', 'expired', or 'invalid' without raising an exception.
    # Used to check the current state of an access token before allowing a refresh.
    logger.debug("Checking token status")
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.debug("Token status: valid")
        return "valid"
    except ExpiredSignatureError:
        logger.debug("Token status: expired")
        return "expired"
    except JWTError:
        logger.debug("Token status: invalid")
        return "invalid"


def add_token_to_blacklist(token: str, expires_at: datetime) -> None:
    # Add token to blacklist with expiration time
    logger.debug("Adding token to blacklist")
    redis_client = get_redis_client()
    ttl = int((expires_at - datetime.utcnow()).total_seconds())
    if ttl > 0:
        redis_client.setex(f"blacklist:{token}", ttl, "1")
        logger.debug("Token added to blacklist successfully")


def is_token_blacklisted(token: str) -> bool:
    # Check if token is in blacklist
    redis_client = get_redis_client()
    is_blacklisted = redis_client.exists(f"blacklist:{token}") > 0
    if is_blacklisted:
        logger.debug("Token is blacklisted")
    return is_blacklisted
