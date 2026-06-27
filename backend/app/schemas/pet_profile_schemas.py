# Pet profile schemas

# Pydantic imports
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime


class PetProfileResponse(BaseModel):
    # Schema for pet profile response
    id: str = Field(..., description="Profile ID")  # MongoDB profile ID
    title: str = Field(
        ..., description="Engaging title for the pet"
    )  # AI-generated title
    tags: List[str] = Field(
        ..., description="List of hashtags for the pet"
    )  # AI-generated tags
    emotional_description: str = Field(
        ..., description="Emotional and detailed description"
    )  # AI-generated emotional description
    status: str = Field(
        ..., description="Profile status (available, in_process, adopted)"
    )  # Pet availability status
    creation_date: datetime = Field(
        ..., description="Profile creation date"
    )  # Creation timestamp
    pet: Dict[str, Any] = Field(
        ..., description="Pet basic information"
    )  # Pet details object
