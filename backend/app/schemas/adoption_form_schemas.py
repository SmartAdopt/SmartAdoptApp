from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import re

# Logger import
from app.utils.logger.logger_config import logger


class AdoptionFormRequest(BaseModel):
    # Schema for adoption form submission - Clean architecture without personal data
    # User ID is obtained from JWT token, not from request body
    
    # I. Candidate Information
    neighborhood: str = Field(..., description="City or neighborhood where the user lives")
    address: str = Field(..., description="Full address of the user")
    employment_status: str = Field(..., description="Employment status: employed, independent, other")
    employment_status_other: Optional[str] = Field(None, description="Other employment status specification")
    housing_type: str = Field(..., description="Housing type: apartment, rented_house, own_house, other")
    housing_type_other: Optional[str] = Field(None, description="Other housing type specification")
    has_natural_space: bool = Field(..., description="Whether the user has natural space nearby")
    
    # II. Coexistence and Experience
    has_pets: bool = Field(..., description="Whether the user currently has pets")
    current_pets_details: Optional[str] = Field(None, description="Details about current pets")
    household_energy: str = Field(..., description="Household energy level: very_active, moderate, quiet")
    has_children: bool = Field(..., description="Whether there are children in the household")
    children_ages: Optional[List[int]] = Field(None, description="Ages of children in the household")
    long_term_commitment: bool = Field(..., description="Commitment to long-term care (15+ years)")
    
    # III. Pet Preferences
    preferred_species: str = Field(..., description="Preferred species: dog, cat, no_preference")
    preferred_gender: str = Field(..., description="Preferred gender: male, female, no_preference")
    preferred_energy: str = Field(..., description="Preferred energy level: low, medium, high")
    
    # IV. Logistics and Education
    daily_time_dedication: int = Field(..., description="Daily time dedication in hours (1-6)")
    sleeping_location: str = Field(..., description="Where the pet will sleep: inside, patio, other")
    sleeping_location_other: Optional[str] = Field(None, description="Other sleeping location specification")
    behavior_approach: str = Field(..., description="Approach to behavior problems: positive_education, trainer, other")
    behavior_approach_other: Optional[str] = Field(None, description="Other behavior approach specification")
    emergency_plan: str = Field(..., description="Emergency plan: family_friend, kennel, take_with_me, other")
    emergency_plan_other: Optional[str] = Field(None, description="Other emergency plan specification")
    
    # V. Final Motivation
    motivation: str = Field(..., description="User's motivation for adoption and what they can offer")

    # Validators
    @field_validator("employment_status")
    @classmethod
    def validate_employment_status(cls, v: str) -> str:
        # Validate employment status against allowed values
        logger.debug(f"Validating employment status: {v}")
        valid_statuses = ["employed", "independent"]
        if v not in valid_statuses:
            logger.warning(f"Employment status validation failed for: {v}")
            raise ValueError(f"Employment status must be one of: {', '.join(valid_statuses)}")
        logger.debug(f"Employment status validation passed for: {v}")
        return v

    @field_validator("housing_type")
    @classmethod
    def validate_housing_type(cls, v: str) -> str:
        # Validate housing type against allowed values
        logger.debug(f"Validating housing type: {v}")
        valid_types = ["apartment", "rented_house", "own_house"]
        if v not in valid_types:
            logger.warning(f"Housing type validation failed for: {v}")
            raise ValueError(f"Housing type must be one of: {', '.join(valid_types)}")
        logger.debug(f"Housing type validation passed for: {v}")
        return v

    @field_validator("household_energy")
    @classmethod
    def validate_household_energy(cls, v: str) -> str:
        # Validate household energy level against allowed values
        logger.debug(f"Validating household energy: {v}")
        valid_energies = ["very_active", "moderate", "quiet"]
        if v not in valid_energies:
            logger.warning(f"Household energy validation failed for: {v}")
            raise ValueError(f"Household energy must be one of: {', '.join(valid_energies)}")
        logger.debug(f"Household energy validation passed for: {v}")
        return v

    @field_validator("preferred_species")
    @classmethod
    def validate_preferred_species(cls, v: str) -> str:
        # Validate preferred pet species against allowed values
        logger.debug(f"Validating preferred species: {v}")
        valid_species = ["dog", "cat", "no_preference"]
        if v not in valid_species:
            logger.warning(f"Preferred species validation failed for: {v}")
            raise ValueError(f"Preferred species must be one of: {', '.join(valid_species)}")
        logger.debug(f"Preferred species validation passed for: {v}")
        return v

    @field_validator("preferred_gender")
    @classmethod
    def validate_preferred_gender(cls, v: str) -> str:
        # Validate preferred pet gender against allowed values
        logger.debug(f"Validating preferred gender: {v}")
        valid_genders = ["male", "female", "no_preference"]
        if v not in valid_genders:
            logger.warning(f"Preferred gender validation failed for: {v}")
            raise ValueError(f"Preferred gender must be one of: {', '.join(valid_genders)}")
        logger.debug(f"Preferred gender validation passed for: {v}")
        return v

    @field_validator("preferred_energy")
    @classmethod
    def validate_preferred_energy(cls, v: str) -> str:
        # Validate preferred pet energy level against allowed values
        logger.debug(f"Validating preferred energy: {v}")
        valid_energies = ["low", "medium", "high"]
        if v not in valid_energies:
            logger.warning(f"Preferred energy validation failed for: {v}")
            raise ValueError(f"Preferred energy must be one of: {', '.join(valid_energies)}")
        logger.debug(f"Preferred energy validation passed for: {v}")
        return v

    @field_validator("daily_time_dedication")
    @classmethod
    def validate_daily_time_dedication(cls, v: int) -> int:
        # Validate daily time dedication (hours) against allowed range
        logger.debug(f"Validating daily time dedication: {v}")
        valid_times = [1, 2, 3, 4, 5, 6]
        if v not in valid_times:
            logger.warning(f"Daily time dedication validation failed for: {v}")
            raise ValueError("Daily time dedication must be between 1 and 6 hours")
        logger.debug(f"Daily time dedication validation passed for: {v}")
        return v

    @field_validator("sleeping_location")
    @classmethod
    def validate_sleeping_location(cls, v: str) -> str:
        # Validate pet sleeping location against allowed values
        logger.debug(f"Validating sleeping location: {v}")
        valid_locations = ["inside", "patio", "other"]
        if v not in valid_locations:
            logger.warning(f"Sleeping location validation failed for: {v}")
            raise ValueError(f"Sleeping location must be one of: {', '.join(valid_locations)}")
        logger.debug(f"Sleeping location validation passed for: {v}")
        return v

    @field_validator("behavior_approach")
    @classmethod
    def validate_behavior_approach(cls, v: str) -> str:
        # Validate behavior problem approach against allowed values
        logger.debug(f"Validating behavior approach: {v}")
        valid_approaches = ["positive_education", "trainer", "other"]
        if v not in valid_approaches:
            logger.warning(f"Behavior approach validation failed for: {v}")
            raise ValueError(f"Behavior approach must be one of: {', '.join(valid_approaches)}")
        logger.debug(f"Behavior approach validation passed for: {v}")
        return v

    @field_validator("emergency_plan")
    @classmethod
    def validate_emergency_plan(cls, v: str) -> str:
        # Validate emergency plan against allowed values
        logger.debug(f"Validating emergency plan: {v}")
        valid_plans = ["family_friend", "kennel", "take_with_me", "other"]
        if v not in valid_plans:
            logger.warning(f"Emergency plan validation failed for: {v}")
            raise ValueError(f"Emergency plan must be one of: {', '.join(valid_plans)}")
        logger.debug(f"Emergency plan validation passed for: {v}")
        return v

    @field_validator("motivation")
    @classmethod
    def validate_motivation(cls, v: str) -> str:
        # Validate motivation length (minimum 10 characters)
        logger.debug("Validating motivation")
        if len(v.strip()) < 10:
            logger.warning("Motivation validation failed - too short")
            raise ValueError("Motivation must be at least 10 characters long")
        logger.debug("Motivation validation passed")
        return v.strip()

    @field_validator("neighborhood")
    @classmethod
    def validate_neighborhood(cls, v: str) -> str:
        logger.debug(f"Validating neighborhood: {v}")
        if len(v.strip()) < 2:
            logger.warning("Neighborhood validation failed - too short")
            raise ValueError("Neighborhood must be at least 2 characters long")
        logger.debug(f"Neighborhood validation passed for: {v}")
        return v.strip()

    @field_validator("address")
    @classmethod
    def validate_address(cls, v: str) -> str:
        logger.debug(f"Validating address: {v}")
        if len(v.strip()) < 5:
            logger.warning("Address validation failed - too short")
            raise ValueError("Address must be at least 5 characters long")
        logger.debug(f"Address validation passed for: {v}")
        return v.strip()


class AdoptionFormResponse(BaseModel):
    # Schema for adoption form registration response
    message: str = Field(..., description="Response message")
    form_id: Optional[str] = Field(None, description="Unique identifier for the adoption form")
    submission_date: Optional[datetime] = Field(None, description="Date and time of form submission")


class AdoptionFormUpdateRequest(BaseModel):
    # Schema for updating existing adoption form
    
    # I. Candidate Information
    neighborhood: Optional[str] = Field(None, description="City or neighborhood where the user lives")
    address: Optional[str] = Field(None, description="Full address of the user")
    employment_status: Optional[str] = Field(None, description="Employment status: employed, independent, other")
    employment_status_other: Optional[str] = Field(None, description="Other employment status specification")
    housing_type: Optional[str] = Field(None, description="Housing type: apartment, rented_house, own_house, other")
    housing_type_other: Optional[str] = Field(None, description="Other housing type specification")
    has_natural_space: Optional[bool] = Field(None, description="Whether the user has natural space nearby")
    
    # II. Coexistence and Experience
    has_pets: Optional[bool] = Field(None, description="Whether the user currently has pets")
    current_pets_details: Optional[str] = Field(None, description="Details about current pets")
    household_energy: Optional[str] = Field(None, description="Household energy level: very_active, moderate, quiet")
    has_children: Optional[bool] = Field(None, description="Whether there are children in the household")
    children_ages: Optional[List[int]] = Field(None, description="Ages of children in the household")
    long_term_commitment: Optional[bool] = Field(None, description="Commitment to long-term care (15+ years)")
    
    # III. Pet Preferences
    preferred_species: Optional[str] = Field(None, description="Preferred species: dog, cat, no_preference")
    preferred_gender: Optional[str] = Field(None, description="Preferred gender: male, female, no_preference")
    preferred_energy: Optional[str] = Field(None, description="Preferred energy level: low, medium, high")
    
    # IV. Logistics and Education
    daily_time_dedication: Optional[int] = Field(None, description="Daily time dedication in hours (1-6)")
    sleeping_location: Optional[str] = Field(None, description="Where the pet will sleep: inside, patio, other")
    sleeping_location_other: Optional[str] = Field(None, description="Other sleeping location specification")
    behavior_approach: Optional[str] = Field(None, description="Approach to behavior problems: positive_education, trainer, other")
    behavior_approach_other: Optional[str] = Field(None, description="Other behavior approach specification")
    emergency_plan: Optional[str] = Field(None, description="Emergency plan: family_friend, kennel, take_with_me, other")
    emergency_plan_other: Optional[str] = Field(None, description="Other emergency plan specification")
    
    # V. Final Motivation
    motivation: Optional[str] = Field(None, description="User's motivation for adoption and what they can offer")

    # Validators (only validate if value is provided)
    @field_validator("employment_status")
    @classmethod
    def validate_employment_status(cls, v: Optional[str]) -> Optional[str]:
        # Validate employment status against allowed values
        if v is None:
            return v
        logger.debug(f"Validating employment status: {v}")
        valid_statuses = ["employed", "independent", "other"]
        if v not in valid_statuses:
            logger.warning(f"Employment status validation failed for: {v}")
            raise ValueError(f"Employment status must be one of: {', '.join(valid_statuses)}")
        logger.debug(f"Employment status validation passed for: {v}")
        return v

    @field_validator("housing_type")
    @classmethod
    def validate_housing_type(cls, v: Optional[str]) -> Optional[str]:
        # Validate housing type against allowed values
        if v is None:
            return v
        logger.debug(f"Validating housing type: {v}")
        valid_types = ["apartment", "rented_house", "own_house", "other"]
        if v not in valid_types:
            logger.warning(f"Housing type validation failed for: {v}")
            raise ValueError(f"Housing type must be one of: {', '.join(valid_types)}")
        logger.debug(f"Housing type validation passed for: {v}")
        return v

    @field_validator("household_energy")
    @classmethod
    def validate_household_energy(cls, v: Optional[str]) -> Optional[str]:
        # Validate household energy level against allowed values
        if v is None:
            return v
        logger.debug(f"Validating household energy: {v}")
        valid_energies = ["very_active", "moderate", "quiet"]
        if v not in valid_energies:
            logger.warning(f"Household energy validation failed for: {v}")
            raise ValueError(f"Household energy must be one of: {', '.join(valid_energies)}")
        logger.debug(f"Household energy validation passed for: {v}")
        return v

    @field_validator("preferred_species")
    @classmethod
    def validate_preferred_species(cls, v: Optional[str]) -> Optional[str]:
        # Validate preferred pet species against allowed values
        if v is None:
            return v
        logger.debug(f"Validating preferred species: {v}")
        valid_species = ["dog", "cat", "no_preference"]
        if v not in valid_species:
            logger.warning(f"Preferred species validation failed for: {v}")
            raise ValueError(f"Preferred species must be one of: {', '.join(valid_species)}")
        logger.debug(f"Preferred species validation passed for: {v}")
        return v

    @field_validator("preferred_gender")
    @classmethod
    def validate_preferred_gender(cls, v: Optional[str]) -> Optional[str]:
        # Validate preferred pet gender against allowed values
        if v is None:
            return v
        logger.debug(f"Validating preferred gender: {v}")
        valid_genders = ["male", "female", "no_preference"]
        if v not in valid_genders:
            logger.warning(f"Preferred gender validation failed for: {v}")
            raise ValueError(f"Preferred gender must be one of: {', '.join(valid_genders)}")
        logger.debug(f"Preferred gender validation passed for: {v}")
        return v

    @field_validator("preferred_energy")
    @classmethod
    def validate_preferred_energy(cls, v: Optional[str]) -> Optional[str]:
        # Validate preferred pet energy level against allowed values
        if v is None:
            return v
        logger.debug(f"Validating preferred energy: {v}")
        valid_energies = ["low", "medium", "high"]
        if v not in valid_energies:
            logger.warning(f"Preferred energy validation failed for: {v}")
            raise ValueError(f"Preferred energy must be one of: {', '.join(valid_energies)}")
        logger.debug(f"Preferred energy validation passed for: {v}")
        return v

    @field_validator("daily_time_dedication")
    @classmethod
    def validate_daily_time_dedication(cls, v: Optional[int]) -> Optional[int]:
        # Validate daily time dedication (hours) against allowed range
        if v is None:
            return v
        logger.debug(f"Validating daily time dedication: {v}")
        valid_times = [1, 2, 3, 4, 5, 6]
        if v not in valid_times:
            logger.warning(f"Daily time dedication validation failed for: {v}")
            raise ValueError("Daily time dedication must be between 1 and 6 hours")
        logger.debug(f"Daily time dedication validation passed for: {v}")
        return v

    @field_validator("sleeping_location")
    @classmethod
    def validate_sleeping_location(cls, v: Optional[str]) -> Optional[str]:
        # Validate pet sleeping location against allowed values
        if v is None:
            return v
        logger.debug(f"Validating sleeping location: {v}")
        valid_locations = ["inside", "patio", "other"]
        if v not in valid_locations:
            logger.warning(f"Sleeping location validation failed for: {v}")
            raise ValueError(f"Sleeping location must be one of: {', '.join(valid_locations)}")
        logger.debug(f"Sleeping location validation passed for: {v}")
        return v

    @field_validator("behavior_approach")
    @classmethod
    def validate_behavior_approach(cls, v: Optional[str]) -> Optional[str]:
        # Validate behavior problem approach against allowed values
        if v is None:
            return v
        logger.debug(f"Validating behavior approach: {v}")
        valid_approaches = ["positive_education", "trainer", "other"]
        if v not in valid_approaches:
            logger.warning(f"Behavior approach validation failed for: {v}")
            raise ValueError(f"Behavior approach must be one of: {', '.join(valid_approaches)}")
        logger.debug(f"Behavior approach validation passed for: {v}")
        return v

    @field_validator("emergency_plan")
    @classmethod
    def validate_emergency_plan(cls, v: Optional[str]) -> Optional[str]:
        # Validate emergency plan against allowed values
        if v is None:
            return v
        logger.debug(f"Validating emergency plan: {v}")
        valid_plans = ["family_friend", "kennel", "take_with_me", "other"]
        if v not in valid_plans:
            logger.warning(f"Emergency plan validation failed for: {v}")
            raise ValueError(f"Emergency plan must be one of: {', '.join(valid_plans)}")
        logger.debug(f"Emergency plan validation passed for: {v}")
        return v

    @field_validator("motivation")
    @classmethod
    def validate_motivation(cls, v: Optional[str]) -> Optional[str]:
        # Validate motivation length (minimum 10 characters)
        if v is None:
            return v
        logger.debug("Validating motivation")
        if len(v.strip()) < 10:
            logger.warning("Motivation validation failed - too short")
            raise ValueError("Motivation must be at least 10 characters long")
        logger.debug("Motivation validation passed")
        return v.strip()

    @field_validator("neighborhood")
    @classmethod
    def validate_neighborhood(cls, v: Optional[str]) -> Optional[str]:
        # Validate neighborhood length (minimum 2 characters)
        if v is None:
            return v
        logger.debug(f"Validating neighborhood: {v}")
        if len(v.strip()) < 2:
            logger.warning("Neighborhood validation failed - too short")
            raise ValueError("Neighborhood must be at least 2 characters long")
        logger.debug(f"Neighborhood validation passed for: {v}")
        return v.strip()

    @field_validator("address")
    @classmethod
    def validate_address(cls, v: Optional[str]) -> Optional[str]:
        # Validate address length (minimum 5 characters)
        if v is None:
            return v
        logger.debug(f"Validating address: {v}")
        if len(v.strip()) < 5:
            logger.warning("Address validation failed - too short")
            raise ValueError("Address must be at least 5 characters long")
        logger.debug(f"Address validation passed for: {v}")
        return v.strip()

