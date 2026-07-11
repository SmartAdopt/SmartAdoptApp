# Application schemas

# Pydantic imports
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime

# Logger import
from app.utils.logger.logger_config import logger


class BreakdownItem(BaseModel):
    # Schema for individual field evaluation in the AI breakdown
    section: str = Field(
        ..., description="Section name (e.g. I. Candidate Information)"
    )
    field: str = Field(..., description="Field identifier (e.g. employment_status)")
    label: str = Field(
        ..., description="Human-readable field label (e.g. Employment Status)"
    )
    answer: str = Field(..., description="The adopter's answer for this field")
    evaluation: str = Field(
        ...,
        description="AI explanation of why this field is compatible or not with the pet",
    )
    points: int = Field(
        ..., ge=0, le=1, description="Points awarded for this field (0 or 1)"
    )
    max_points: int = Field(
        1, ge=1, le=1, description="Maximum points for this field (always 1)"
    )

    # Validate section is not empty
    @field_validator("section")
    @classmethod
    def validate_section(cls, v: str) -> str:
        logger.debug(f"Validating breakdown section: {v}")
        if not v or not v.strip():
            logger.warning("Breakdown section validation failed - empty value")
            raise ValueError("Section cannot be empty")
        logger.debug(f"Breakdown section validation passed: {v}")
        return v.strip()

    # Validate field identifier is not empty
    @field_validator("field")
    @classmethod
    def validate_field(cls, v: str) -> str:
        logger.debug(f"Validating breakdown field: {v}")
        if not v or not v.strip():
            logger.warning("Breakdown field validation failed - empty value")
            raise ValueError("Field cannot be empty")
        logger.debug(f"Breakdown field validation passed: {v}")
        return v.strip()

    # Validate points are 0 or 1
    @field_validator("points")
    @classmethod
    def validate_points(cls, v: int) -> int:
        logger.debug(f"Validating breakdown points: {v}")
        if v not in [0, 1]:
            logger.warning(f"Points must be 0 or 1, got: {v}")
            raise ValueError("Points must be 0 or 1")
        logger.debug(f"Breakdown points validation passed: {v}")
        return v


class ApplicationResponse(BaseModel):
    # Schema for adoption application creation response (minimal)
    message: str = Field(..., description="Response message")
    application_id: str = Field(
        ..., description="Unique identifier for the adoption application"
    )
    pet_profile_id: str = Field(..., description="ID of the pet profile")
    status: str = Field(
        ..., description="Application status (pending, approved, rejected)"
    )
    created_at: datetime = Field(
        ..., description="Date and time of application creation"
    )
    needs_manual_review: bool = Field(
        False,
        description="Flag indicating if the application requires manual review (AI evaluation failed)",
    )

    # Validate that application_id is not empty
    @field_validator("application_id")
    @classmethod
    def validate_application_id(cls, v: str) -> str:
        logger.debug(f"Validating application_id: {v}")
        if not v or not v.strip():
            logger.warning("Application ID validation failed - empty value")
            raise ValueError("Application ID cannot be empty")
        if not v.startswith("AP"):
            logger.warning(f"Application ID must start with 'AP', got: {v}")
            raise ValueError("Invalid application ID format")
        logger.debug(f"Application ID validation passed: {v}")
        return v

    # Validate status is one of the allowed values
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        logger.debug(f"Validating status: {v}")
        valid_statuses = ["pending", "approved", "rejected"]
        if v.lower() not in valid_statuses:
            logger.warning(
                f"Status must be one of: {', '.join(valid_statuses)}, got: {v}"
            )
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        logger.debug(f"Status validation passed: {v}")
        return v.lower()


class ApplicationWithPetResponse(BaseModel):
    # Schema for application with embedded pet profile data
    application_id: str = Field(
        ..., description="Unique identifier for the adoption application"
    )
    pet_profile_id: str = Field(..., description="ID of the pet profile")
    total_score: int = Field(
        ..., ge=0, le=15, description="Total AI compatibility score"
    )
    total_max_score: int = Field(15, description="Maximum possible total score")
    main_score: int = Field(
        ..., ge=0, le=11, description="AI compatibility score for main fields"
    )
    main_max_score: int = Field(
        11, description="Maximum possible score for main fields"
    )
    logistics_education_score: int = Field(
        ..., ge=0, le=4, description="Logistics and education sub-score"
    )
    logistics_education_max_score: int = Field(
        4, description="Maximum possible logistics and education score"
    )
    ai_breakdown: List[BreakdownItem] = Field(
        ..., description="Per-field AI evaluation breakdown"
    )
    ai_justification: str = Field(
        ..., description="AI generated justification for the overall score"
    )
    status: str = Field(
        ..., description="Application status (pending, approved, rejected)"
    )
    created_at: datetime = Field(
        ..., description="Date and time of application creation"
    )
    needs_manual_review: bool = Field(
        False,
        description="Flag indicating if the application requires manual review (AI evaluation failed)",
    )
    pet: Optional[Dict[str, Any]] = Field(
        None, description="Pet profile data embedded in response"
    )

    # Validate that application_id is not empty
    @field_validator("application_id")
    @classmethod
    def validate_application_id(cls, v: str) -> str:
        logger.debug(f"Validating application_id: {v}")
        if not v or not v.strip():
            logger.warning("Application ID validation failed - empty value")
            raise ValueError("Application ID cannot be empty")
        if not v.startswith("AP"):
            logger.warning(f"Application ID must start with 'AP', got: {v}")
            raise ValueError("Invalid application ID format")
        logger.debug(f"Application ID validation passed: {v}")
        return v

    # Validate justification is not empty
    @field_validator("ai_justification")
    @classmethod
    def validate_ai_justification(cls, v: str) -> str:
        logger.debug("Validating ai_justification")
        if not v or not v.strip():
            logger.warning("AI justification validation failed - empty value")
            raise ValueError("AI justification cannot be empty")
        if len(v.strip()) < 10:
            logger.warning("AI justification validation failed - too short")
            raise ValueError("AI justification must be at least 10 characters long")
        logger.debug("AI justification validation passed")
        return v.strip()

    # Validate status is one of the allowed values
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        logger.debug(f"Validating status: {v}")
        valid_statuses = ["pending", "approved", "rejected"]
        if v.lower() not in valid_statuses:
            logger.warning(
                f"Status must be one of: {', '.join(valid_statuses)}, got: {v}"
            )
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        logger.debug(f"Status validation passed: {v}")
        return v.lower()


class ApplicationStatusUpdate(BaseModel):
    # Schema for updating an application's status (admin)
    status: str = Field(..., description="New application status: approved or rejected")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = ["approved", "rejected"]
        if v.lower() not in valid_statuses:
            logger.warning(
                f"Status must be one of: {', '.join(valid_statuses)}, got: {v}"
            )
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v.lower()


class ApplicationListResponse(BaseModel):
    # Schema for listing adoption applications
    applications: List[ApplicationWithPetResponse] = Field(
        ..., description="List of adoption applications"
    )
    count: int = Field(..., description="Total number of applications")

    # Validate count matches the list length
    @field_validator("count")
    @classmethod
    def validate_count(cls, v: int, info) -> int:
        logger.debug(f"Validating applications count: {v}")
        if v < 0:
            logger.warning(f"Count cannot be negative, got: {v}")
            raise ValueError("Count cannot be negative")
        logger.debug(f"Count validation passed: {v}")
        return v
