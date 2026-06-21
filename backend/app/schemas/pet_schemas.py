# Pet schemas

# Pydantic imports
from pydantic import BaseModel, Field, field_validator
from typing import List

# Logger import
from app.utils.logger.logger_config import logger


class PetRequest(BaseModel):
    # Schema for pet creation/update request
    name: str = Field(..., description="Pet's name")
    pet_image_url: str = Field(..., description="URL of the pet's image")
    animal_breed: List[str] = Field(
        ...,
        min_length=1,
        description="List of animal breeds (first element is animal type: dog/cat)",
    )
    age: int = Field(..., ge=0, le=30, description="Pet's age in years")
    gender: str = Field(..., description="Pet's gender (male/female)")
    is_sterilized: bool = Field(..., description="Whether the pet is sterilized")
    vaccines_up_to_date: List[str] = Field(
        default_factory=list, description="List of vaccines up to date"
    )
    dewormed: bool = Field(..., description="Whether the pet is dewormed")
    weight_kg: float = Field(..., gt=0, le=100, description="Pet's weight in kilograms")
    special_conditions: List[str] = Field(
        default_factory=list, description="List of special conditions"
    )
    brief_description: str = Field(..., description="Brief description of the pet")

    # Validate age is within realistic range
    @field_validator("age")
    @classmethod
    def validate_age(cls, v: int) -> int:
        logger.info(f"Validating age: {v}")
        if v < 0:
            logger.error(f"Age cannot be negative, got: {v}")
            raise ValueError("Age cannot be negative")
        if v > 15:
            logger.error(f"Age exceeds realistic maximum (15 years), got: {v}")
            raise ValueError("Age cannot exceed 15 years")
        logger.info(f"Age validation passed: {v}")
        return v

    # Validate weight is within realistic range
    @field_validator("weight_kg")
    @classmethod
    def validate_weight(cls, v: float) -> float:
        logger.info(f"Validating weight: {v} kg")
        if v <= 0:
            logger.error(f"Weight must be positive, got: {v}")
            raise ValueError("Weight must be positive")
        if v > 10:
            logger.error(f"Weight exceeds realistic maximum (10 kg), got: {v}")
            raise ValueError("Weight cannot exceed 10 kg")
        logger.info(f"Weight validation passed: {v} kg")
        return v

    # Validate URL is mandatory and valid
    @field_validator("pet_image_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        logger.info(f"Validating image URL: {v}")
        if not v or not v.strip():
            logger.error("Image URL is required and cannot be empty")
            raise ValueError("Image URL is required")
        if not v.startswith("http://") and not v.startswith("https://"):
            logger.error(
                f"Invalid URL format, must start with http:// or https://, got: {v}"
            )
            raise ValueError("Invalid URL format")
        logger.info(f"Image URL validation passed: {v}")
        return v

    # Validate animal_breed first element is either dog or cat
    @field_validator("animal_breed")
    @classmethod
    def validate_animal_breed(cls, v: List[str]) -> List[str]:
        logger.info(f"Validating animal_breed: {v}")
        if not v:
            logger.error("Animal breed list cannot be empty")
            raise ValueError("Animal breed list cannot be empty")
        if v[0].lower() not in ["dog", "cat"]:
            logger.error(
                f"First element of animal_breed must be either 'dog' or 'cat', got: {v[0]}"
            )
            raise ValueError(
                "First element of animal_breed must be either 'dog' or 'cat'"
            )
        logger.info(f"Animal breed validation passed: {v}")
        return v

    # Validate gender is either male or female
    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        logger.info(f"Validating gender: {v}")
        if v.lower() not in ["male", "female"]:
            logger.error(f"Gender must be either 'male' or 'female', got: {v}")
            raise ValueError("Gender must be either 'male' or 'female'")
        logger.info(f"Gender validation passed: {v}")
        return v.lower()

    # Validate vaccines according to animal type (from animal_breed[0])
    @field_validator("vaccines_up_to_date")
    @classmethod
    def validate_vaccines(cls, v: List[str], info) -> List[str]:
        logger.info(f"Validating vaccines: {v}")
        animal_breed = info.data.get("animal_breed", [])
        animal_type = animal_breed[0].lower() if animal_breed else ""

        dog_vaccines = [
            "rabies",
            "parvovirus",
            "distemper",
            "infectious hepatitis",
            "parainfluenza",
            "Leptospirosis",
            "Canine Coronavirus",
        ]
        cat_vaccines = [
            "rabies",
            "feline triple",
            "feline leukemia",
            "feline chlamydiosis",
            "feline infectious peritonitis",
        ]

        if animal_type == "dog":
            for vaccine in v:
                if vaccine not in dog_vaccines:
                    logger.error(f"'{vaccine}' is not a valid vaccine for dogs")
                    raise ValueError(f"'{vaccine}' is not a valid vaccine for dogs")
        elif animal_type == "cat":
            for vaccine in v:
                if vaccine not in cat_vaccines:
                    logger.error(f"'{vaccine}' is not a valid vaccine for cats")
                    raise ValueError(f"'{vaccine}' is not a valid vaccine for cats")
        logger.info(f"Vaccines validation passed for {animal_type}: {v}")
        return v


class PetRegisterResponse(BaseModel):
    # Schema for pet registration response
    message: str = Field(..., description="Confirmation message")
    pet_id: str = Field(..., description="Registered pet ID")
