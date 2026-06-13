# Authentication schemas

# Pydantic imports
from pydantic import BaseModel, EmailStr, Field, field_validator

import re

# Datetime imports
from datetime import datetime
from typing import Optional


class RegisterRequest(BaseModel):
    # Schema for registration request
    first_name: str = Field(
        ..., min_length=2, max_length=50, description="User's first name"
    )
    last_name: str = Field(
        ..., min_length=2, max_length=50, description="User's last name"
    )
    email: EmailStr = Field(..., description="User's email")
    phone_number: str = Field(
        ..., min_length=10, max_length=10, description="Phone number"
    )
    password: str = Field(..., min_length=8, description="User's password")
    requested_role: str = Field(..., description="Requested role (admin/adopter)")

    # Validate that name contains only letters (including Spanish characters)
    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$", v):
            raise ValueError("Name must contain only letters")
        return v.strip()

    # Validate that phone number contains only digits and starts with 09 (Ecuador mobile)
    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("Phone number must contain only digits")
        if not v.startswith("09"):
            raise ValueError("Phone number must start with 09 (Ecuador mobile)")
        return v

    # Validate password complexity (uppercase, lowercase, number)
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        return v

    # Validate that role is either admin or adopter
    @field_validator("requested_role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ["admin", "adopter"]:
            raise ValueError("Role must be either admin or adopter")
        return v


class RegisterResponse(BaseModel):
    # Schema for Adopter or admin registration response
    message: str = Field(..., description="Confirmation message")
    user_id: int = Field(..., description="Registered user ID")
    created_at: Optional[datetime] = Field(None, description="Registration date")


class LoginRequest(BaseModel):
    # Schema for login request
    email: EmailStr = Field(..., description="User's email")
    password: str = Field(..., description="User's password")


class LoginResponse(BaseModel):
    # Schema for login response
    access_token: Optional[str] = Field(None, description="JWT access token")
    token_type: Optional[str] = Field(None, description="Token type")
    message: str = Field(..., description="Login message")
    id: int = Field(..., description="User ID")
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")
    email: EmailStr = Field(..., description="User's email")
    role: str = Field(..., description="User role")
    created_at: Optional[datetime] = Field(None, description="Registration date")


class RefreshTokenResponse(BaseModel):
    # Schema for refresh token response
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")
