from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional

# Database imports
from app.database.mongo.mongo_db import get_mongo_db

# Schema imports
from app.schemas.pet_schemas import PetRequest, PetRegisterRequest, PetRegisterResponse
from app.schemas.pet_profile_schemas import PetProfileResponse

# Service imports
from app.services.pet_service import (
    register_pet,
    update_pet,
    regenerate_profile,
    list_pets,
)
from app.utils.socketio_manager import sio

# JWT utils import
from app.utils.jwt.jwt_utils import verify_token

# Logger import
from app.utils.logger.logger_config import logger

# Cache imports
from app.utils.cache_utils import get_cached_data, set_cached_data, invalidate_cache

router = APIRouter(prefix="/pets", tags=["Pets"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_pet_route(
    pet_data: PetRegisterRequest,
    db=Depends(get_mongo_db),
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

        # Broadcast the new pet registration globally
        await sio.emit(
            "new_pet_registered",
            {
                "pet_id": str(new_pet["profile_id"]),
                "name": new_pet.get("pet", {}).get("name", "Una nueva mascota"),
            },
        )

        # Invalidate pet list caches
        invalidate_cache("cache:pets:*")

        # Return response with complete profile
        return PetRegisterResponse(
            message="Pet registered successfully",
            profile=PetProfileResponse(
                id=new_pet["profile_id"],  # Profile ID from MongoDB
                title=new_pet["title"],  # AI-generated title
                tags=new_pet["tags"],  # AI-generated tags
                emotional_description=new_pet[
                    "emotional_description"
                ],  # AI-generated description
                status=new_pet["status"],  # Pet availability status
                creation_date=new_pet["creation_date"],  # Profile creation timestamp
                pet=new_pet["pet"],  # Pet information object
            ),
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


@router.put("/{profile_id}", status_code=status.HTTP_200_OK)
async def update_pet_route(
    profile_id: str,
    pet_data: PetRequest,
    db=Depends(get_mongo_db),
    token_payload: dict = Depends(verify_token),
):
    # Endpoint to update an existing profile (requires admin role)
    logger.info(f"PUT /pets/{profile_id} - Profile update request")

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
        pet_data_dict = pet_data.model_dump(
            exclude_unset=True
        )  # Exclude unset fields for partial updates
        # Call service to update the profile
        updated_pet = await update_pet(db, profile_id, pet_data_dict)

        # Broadcast the status update globally
        await sio.emit(
            "pet_status_update",
            {
                "pet_id": updated_pet["profile_id"],
                "name": updated_pet.get("pet", {}).get("name", "Una mascota"),
                "status": updated_pet.get("status"),
            },
        )

        # Invalidate pet list caches
        invalidate_cache("cache:pets:*")

        # Return response with complete profile
        return PetRegisterResponse(
            message="Profile updated successfully",
            profile=PetProfileResponse(
                id=updated_pet["profile_id"],  # Profile ID from MongoDB
                title=updated_pet["title"],  # Profile title
                tags=updated_pet["tags"],  # Profile tags
                emotional_description=updated_pet[
                    "emotional_description"
                ],  # Emotional description
                status=updated_pet["status"],  # Pet availability status
                creation_date=updated_pet[
                    "creation_date"
                ],  # Profile creation timestamp
                pet=updated_pet["pet"],  # Pet information object
            ),
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


@router.post("/{profile_id}/regenerate", status_code=status.HTTP_200_OK)
async def regenerate_profile_route(
    profile_id: str,
    db=Depends(get_mongo_db),
    token_payload: dict = Depends(verify_token),
):
    # Endpoint to regenerate profile with AI (requires admin role)
    logger.info(f"POST /pets/{profile_id}/regenerate - Profile regeneration request")

    # Verify user role is admin
    user_role = token_payload.get("role", "").lower()
    if user_role != "admin":
        logger.warning(
            f"Profile regeneration denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Admin role required"},
        )

    try:
        # Call service to regenerate the profile
        regenerated_profile = await regenerate_profile(db, profile_id)

        # Invalidate pet list caches
        invalidate_cache("cache:pets:*")

        # Return response with complete profile
        return PetRegisterResponse(
            message="Profile regenerated successfully",
            profile=PetProfileResponse(
                id=regenerated_profile["profile_id"],  # Profile ID from MongoDB
                title=regenerated_profile["title"],  # AI-generated title
                tags=regenerated_profile["tags"],  # AI-generated tags
                emotional_description=regenerated_profile[
                    "emotional_description"
                ],  # AI-generated description
                status=regenerated_profile["status"],  # Pet availability status
                creation_date=regenerated_profile[
                    "creation_date"
                ],  # Profile creation timestamp
                pet=regenerated_profile["pet"],  # Pet information object
            ),
        )
    except ValueError as e:
        logger.warning(f"Profile regeneration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": str(e)},
        )
    except Exception as e:
        logger.error(f"Unexpected error during profile regeneration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


@router.get("/", status_code=status.HTTP_200_OK)
async def list_pets_route(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db=Depends(get_mongo_db),
    token_payload: dict = Depends(verify_token),
):
    # Endpoint to list pets (requires admin or adopter role)
    # No status -> general listing (all pets); status provided -> filtered
    logger.info("GET /pets/ - List pets request")

    # Verify user role is admin or adopter
    user_role = token_payload.get("role", "").lower()
    if user_role not in ["admin", "adopter"]:
        logger.warning(
            f"Pet listing denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Admin or Adopter role required"},
        )

    try:
        cache_key = f"cache:pets:list:{status_filter or 'all'}"
        cached_response = get_cached_data(cache_key)
        if cached_response:
            return cached_response

        # Call service to list pets (filtered by status only when provided)
        pets = await list_pets(db, status_filter=status_filter)
        if not pets:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": "No pets found"},
            )

        response_data = {"pets": pets, "count": len(pets)}
        set_cached_data(cache_key, response_data, expire_seconds=300)

        # Return response
        return response_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during pet listing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )
