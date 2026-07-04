from pydantic import BaseModel, Field, EmailStr, field_validator
import re
from typing import Optional
from app.utils.logger.logger_config import logger


class FoundationCreateRequest(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=200, description="Foundation legal name"
    )
    phone: str = Field(
        ..., min_length=10, max_length=10, description="Contact phone number"
    )
    address: str = Field(
        ..., min_length=1, max_length=300, description="Physical address"
    )
    email: EmailStr = Field(..., description="Official email")
    legal_representative: str = Field(
        ..., min_length=1, max_length=200, description="Legal representative name"
    )
    business_hours: str = Field(
        ..., min_length=1, max_length=200, description="Business hours"
    )

    @field_validator("name", "legal_representative")
    @classmethod
    def validate_name(cls, v: str) -> str:
        logger.debug(f"Validating foundation name: {v}")
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$", v):
            logger.warning(
                f"Name validation failed for: {v} - contains invalid characters"
            )
            raise ValueError("Name must contain only letters")
        logger.debug(f"Name validation passed for: {v}")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        logger.debug(f"Validating foundation phone: {v}")
        if not v.isdigit():
            logger.warning(
                f"Phone validation failed for: {v} - contains non-digit characters"
            )
            raise ValueError("Phone number must contain only digits")
        if not v.startswith("09"):
            logger.warning(f"Phone validation failed for: {v} - does not start with 09")
            raise ValueError("Phone number must start with 09 (Ecuador mobile)")
        logger.debug(f"Phone validation passed for: {v}")
        return v

    @field_validator("address")
    @classmethod
    def validate_address(cls, v: str) -> str:
        logger.debug(f"Validating address: {v}")
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.,\-/#]+$", v):
            logger.warning(
                f"Address validation failed for: {v} - contains invalid characters"
            )
            raise ValueError("Address contains invalid characters")
        logger.debug(f"Address validation passed for: {v}")
        return v.strip()

    @field_validator("business_hours")
    @classmethod
    def validate_business_hours(cls, v: str) -> str:
        logger.debug(f"Validating business hours: {v}")
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.,:\-]+$", v):
            logger.warning(
                f"Business hours validation failed for: {v} - contains invalid characters"
            )
            raise ValueError("Business hours contains invalid characters")
        logger.debug(f"Business hours validation passed for: {v}")
        return v.strip()


class FoundationUpdateRequest(BaseModel):
    name: Optional[str] = Field(
        None, min_length=1, max_length=200, description="Foundation legal name"
    )
    phone: Optional[str] = Field(
        None, min_length=10, max_length=10, description="Contact phone number"
    )
    address: Optional[str] = Field(
        None, min_length=1, max_length=300, description="Physical address"
    )
    email: Optional[EmailStr] = Field(None, description="Official email")
    legal_representative: Optional[str] = Field(
        None, min_length=1, max_length=200, description="Legal representative name"
    )
    business_hours: Optional[str] = Field(
        None, min_length=1, max_length=200, description="Business hours"
    )

    @field_validator("name", "legal_representative")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        logger.debug(f"Validating foundation name: {v}")
        if v is None:
            return v
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$", v):
            logger.warning(
                f"Name validation failed for: {v} - contains invalid characters"
            )
            raise ValueError("Name must contain only letters")
        logger.debug(f"Name validation passed for: {v}")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        logger.debug(f"Validating foundation phone: {v}")
        if v is None:
            return v
        if not v.isdigit():
            logger.warning(
                f"Phone validation failed for: {v} - contains non-digit characters"
            )
            raise ValueError("Phone number must contain only digits")
        if not v.startswith("09"):
            logger.warning(f"Phone validation failed for: {v} - does not start with 09")
            raise ValueError("Phone number must start with 09 (Ecuador mobile)")
        logger.debug(f"Phone validation passed for: {v}")
        return v

    @field_validator("address")
    @classmethod
    def validate_address(cls, v: Optional[str]) -> Optional[str]:
        logger.debug(f"Validating address: {v}")
        if v is None:
            return v
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.,\-/#]+$", v):
            logger.warning(
                f"Address validation failed for: {v} - contains invalid characters"
            )
            raise ValueError("Address contains invalid characters")
        logger.debug(f"Address validation passed for: {v}")
        return v.strip()

    @field_validator("business_hours")
    @classmethod
    def validate_business_hours(cls, v: Optional[str]) -> Optional[str]:
        logger.debug(f"Validating business hours: {v}")
        if v is None:
            return v
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.,:\-]+$", v):
            logger.warning(
                f"Business hours validation failed for: {v} - contains invalid characters"
            )
            raise ValueError("Business hours contains invalid characters")
        logger.debug(f"Business hours validation passed for: {v}")
        return v.strip()


class FoundationCreateResponse(BaseModel):
    message: str = Field(..., description="Confirmation message")
    foundation_id: int = Field(..., description="Created foundation ID")


class FoundationUpdateResponse(BaseModel):
    message: str = Field(..., description="Confirmation message")
    foundation_id: int = Field(..., description="Updated foundation ID")


class FoundationResponse(BaseModel):
    foundation_id: int
    name: str
    phone: str
    address: str
    email: str
    legal_representative: str
    business_hours: str

    model_config = {"from_attributes": True}
