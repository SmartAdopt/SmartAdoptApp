from datetime import datetime, timedelta
from jose import jwt
from app.utils.jwt.jwt_utils import (
    create_access_token,
    decode_token_status,
    SECRET_KEY,
    ALGORITHM,
)


def test_create_access_token_generates_valid_jwt():
    # Arrange
    user_id = 999
    role = "admin"

    # Act
    token = create_access_token(user_id=user_id, role=role)

    # Assert
    assert isinstance(token, str)
    assert len(token) > 0

    # Decode manually to verify payload structure
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload.get("sub") == str(user_id)
    assert payload.get("role") == role
    assert payload.get("type") == "access"
    assert "exp" in payload
    assert "iat" in payload


def test_decode_token_status_returns_valid_for_fresh_token():
    # Arrange
    token = create_access_token(user_id=1, role="user")

    # Act
    status = decode_token_status(token)

    # Assert
    assert status == "valid"


def test_decode_token_status_returns_expired_for_old_token():
    # Arrange
    # Create an expired token manually
    expire = datetime.utcnow() - timedelta(minutes=5)
    to_encode = {
        "sub": "1",
        "role": "user",
        "exp": expire,
        "type": "access",
    }
    expired_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    # Act
    status = decode_token_status(expired_token)

    # Assert
    assert status == "expired"


def test_decode_token_status_returns_invalid_for_bad_string():
    # Arrange
    bad_token = "this.is.not.a.real.token"

    # Act
    status = decode_token_status(bad_token)

    # Assert
    assert status == "invalid"
