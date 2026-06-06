# Authentication schemas

# Pydantic imports
from pydantic import BaseModel, EmailStr, Field

# Datetime imports
from datetime import datetime
from typing import Optional


class RegisterRequest(BaseModel):
    # Schema for registration request
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")
    email: EmailStr = Field(..., description="User's email")
    phone_number: str = Field(..., description="Phone number")
    password: str = Field(..., description="User's password")
    requested_role: str = Field(..., description="Requested role (admin/adopter)")


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


class UserListResponse(BaseModel):
    # Schema for user list
    users: list = Field(..., description="User list")
    total: int = Field(..., description="Total users")
