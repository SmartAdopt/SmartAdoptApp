# Favorite schemas for request/response validation

# Pydantic imports
from pydantic import BaseModel, Field

# Typing imports
from typing import List, Dict, Any, Optional

# Datetime imports
from datetime import datetime


class PetProfileData(BaseModel):
    # Pet profile data embedded in favorite list responses
    profile_id: str = Field(..., description="Profile ID")
    title: Optional[str] = Field(None, description="Engaging title for the pet")
    tags: Optional[List[str]] = Field(None, description="List of hashtags for the pet")
    emotional_description: Optional[str] = Field(
        None, description="Emotional and detailed description"
    )
    status: Optional[str] = Field(None, description="Profile status")
    creation_date: Optional[datetime] = Field(None, description="Profile creation date")
    pet: Optional[Dict[str, Any]] = Field(None, description="Pet basic information")


class FavoriteResponse(BaseModel):
    # Response schema for a single favorite entry
    favorite_id: int = Field(..., description="Favorite ID")
    user_id: int = Field(..., description="User ID")
    pet_profile_id: str = Field(..., description="Pet profile ID")


class FavoriteWithPetResponse(BaseModel):
    # Favorite response including embedded pet profile data
    favorite_id: int = Field(..., description="Favorite ID")
    user_id: int = Field(..., description="User ID")
    pet_profile_id: str = Field(..., description="Pet profile ID")
    pet: Optional[PetProfileData] = Field(None, description="Pet profile data")


class FavoriteAddResponse(BaseModel):
    # Response schema for add favorite endpoint
    message: str = Field(..., description="Confirmation message")
    favorite: FavoriteResponse = Field(..., description="Favorite details")


class FavoriteRemoveResponse(BaseModel):
    # Response schema for remove favorite endpoint
    message: str = Field(..., description="Confirmation message")


class FavoriteListResponse(BaseModel):
    # Response schema for list favorites endpoint
    favorites: List[FavoriteWithPetResponse] = Field(
        ..., description="List of favorites with pet data"
    )
    count: int = Field(..., description="Total count of favorites")
