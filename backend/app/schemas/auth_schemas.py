#Authentication schemas

#Pydantic imports
from pydantic import BaseModel, EmailStr, Field
#Datetime imports
from datetime import datetime


class RegisterRequest(BaseModel):
    #Schema for registration request
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")
    email: EmailStr = Field(..., description="User's email")
    phone_number: str = Field(..., description="Phone number")
    password: str = Field(..., description="User's password")
    requested_role: str = Field(..., description="Requested role (admin/adopter)")


class RegisterResponseAdmin(BaseModel):
    #Schema for Admin registration response
    message: str = Field(..., description="Confirmation message")
    user_id: int = Field(..., description="Registered user ID")


class RegisterResponseAdopter(BaseModel):
    #Schema for Adopter registration response
    message: str = Field(..., description="Confirmation message")
    user_id: int = Field(..., description="Registered user ID")
    created_at: datetime = Field(..., description="Registration date")


class LoginRequest(BaseModel):
    #Schema for login request
    email: EmailStr = Field(..., description="User's email")
    password: str = Field(..., description="User's password")


class UserResponseAdmin(BaseModel):
    #Schema for Admin user response
    id: int = Field(..., description="User ID")
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")
    email: EmailStr = Field(..., description="User's email")
    role: str = Field(..., description="User role")


class UserResponseAdopter(BaseModel):
    #Schema for Adopter user response
    id: int = Field(..., description="User ID")
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")
    email: EmailStr = Field(..., description="User's email")
    role: str = Field(..., description="User role")
    created_at: datetime = Field(..., description="Registration date")


class UserResponse(BaseModel):
    #Schema for generic user response (for service)
    id: int = Field(..., description="User ID")
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")
    email: EmailStr = Field(..., description="User's email")
    role: str = Field(..., description="User role")
    created_at: datetime = Field(None, description="Registration date (optional)")


class LoginResponseAdmin(BaseModel):
    #Schema for Admin login response
    message: str = Field(..., description="Confirmation message")
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(..., description="Token type (bearer)")
    user: UserResponseAdmin = Field(..., description="User information")


class LoginResponseAdopter(BaseModel):
    #Schema for Adopter login response
    message: str = Field(..., description="Confirmation message")
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(..., description="Token type (bearer)")
    user: UserResponseAdopter = Field(..., description="User information")


class UserListResponse(BaseModel):
    #Schema for user list
    users: list = Field(..., description="User list")
    total: int = Field(..., description="Total users")
