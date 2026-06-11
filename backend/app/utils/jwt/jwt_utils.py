# JWT utilities for authentication

from datetime import datetime, timedelta
from typing import Dict, Any

from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.config import settings

# JWT Configuration
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# HTTP Bearer scheme for token extraction
security = HTTPBearer(auto_error=False)


def create_access_token(email: str, role: str) -> str:
    # Create a JWT access token with user data and expiration
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

    return encoded_jwt


def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> Dict[str, Any]:
    # FastAPI dependency to verify JWT token from Authorization header
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    try:
        # Extract token from credentials
        token = credentials.credentials

        # Decode and verify the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        return payload

    except JWTError:
        raise credentials_exception
