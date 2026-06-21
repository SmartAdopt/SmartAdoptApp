from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Database imports
from app.database.postgres.postgres_db import get_db

# Schema imports
from app.schemas.pet_schemas import PetRequest, PetRegisterResponse

# Service imports
from app.services.pet_service import register_pet, update_pet, list_pets

# JWT utils import
from app.utils.jwt.jwt_utils import verify_token

# Logger import
from app.utils.logger.logger_config import logger

router = APIRouter(prefix="/pets", tags=["pets"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_pet_route(
    pet_data: PetRequest,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(verify_token),
):
    # Endpoint to register a new pet (requires admin role)
    logger.info(
        f"POST /pets/register - Pet registration request for name: {pet_data.name}"
    )

    # Verify user role is admin
    user_role = token_payload.get("role", "").lower()
    if user_role != "admin":
        logger.warning(
            f"Pet registration denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Admin role required"},
        )

    try:
        # Convert Pydantic schema to dict before calling service
        pet_data_dict = pet_data.model_dump()
        # Call service to register the pet
        new_pet = await register_pet(db, pet_data_dict)
        # Return response
        return PetRegisterResponse(
            message="Pet registered successfully", pet_id=new_pet["pet_id"]
        )
    except ValueError as e:
        logger.warning(f"Pet registration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": str(e)},
        )
    except Exception as e:
        logger.error(f"Unexpected error during pet registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


@router.put("/{pet_id}", status_code=status.HTTP_200_OK)
async def update_pet_route(
    pet_id: str,
    pet_data: PetRequest,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(verify_token),
):
    # Endpoint to update an existing pet (requires admin role)
    logger.info(f"PUT /pets/{pet_id} - Pet update request")

    # Verify user role is admin
    user_role = token_payload.get("role", "").lower()
    if user_role != "admin":
        logger.warning(
            f"Pet update denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Admin role required"},
        )

    try:
        # Convert Pydantic schema to dict before calling service
        pet_data_dict = pet_data.model_dump()
        # Call service to update the pet
        updated_pet = await update_pet(db, pet_id, pet_data_dict)
        # Return response
        return PetRegisterResponse(
            message="Pet updated successfully", pet_id=updated_pet["pet_id"]
        )
    except ValueError as e:
        logger.warning(f"Pet update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": str(e)},
        )
    except Exception as e:
        logger.error(f"Unexpected error during pet update: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


@router.get("/", status_code=status.HTTP_200_OK)
async def list_pets_route(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(verify_token),
):
    # Endpoint to list all pets (requires admin role)
    logger.info("GET /pets/ - List pets request")

    # Verify user role is admin
    user_role = token_payload.get("role", "").lower()
    if user_role != "admin":
        logger.warning(
            f"Pet listing denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Admin role required"},
        )

    try:
        # Call service to list pets
        pets = await list_pets(db)
        # Return response
        return {"pets": pets, "count": len(pets)}
    except Exception as e:
        logger.error(f"Unexpected error during pet listing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )
