# Adopter routes
# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, status

# Database imports
from app.database.postgres.postgres_db import get_db
from app.database.mongo.mongo_db import get_mongo_db

# JWT utilities
from app.utils.jwt.jwt_utils import verify_token

# Schema imports
from app.schemas.auth_schemas import UpdateAdopterProfile, UpdateResponse

# Datetime imports
from datetime import datetime

# Service imports
from app.services.auth_service import update_adopter_profile
from app.services.favorite_service import get_favorite_count

# Logger import
from app.utils.logger.logger_config import logger

# Create router with prefix and tags
router = APIRouter(prefix="/adopter", tags=["Adopter"])


@router.get(
    "/home",
    status_code=status.HTTP_200_OK,
    summary="Adopter Home",
    description="Get adopter home data (requires adopter role)",
)
async def adopter_home(
    token_payload: dict = Depends(verify_token),
    db=Depends(get_db),
    mongo_db=Depends(get_mongo_db),
):
    # Endpoint for adopter home - protected by JWT and role-based authorization
    # Only users with role="adopter" can access this endpoint
    logger.info(f"GET /adopter/home - Request from user: {token_payload.get('sub')}")
    # Verify role
    user_role = token_payload.get("role", "").lower()
    if user_role != "adopter":
        logger.warning(
            f"Access denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Adopter role required"},
        )

    try:
        # Get actual counts from databases
        user_id = int(token_payload.get("sub", 0))
        favorite_count = get_favorite_count(db, user_id)

        pet_collection = mongo_db["pet_profiles"]
        app_collection = mongo_db["applications"]

        available_pets = await pet_collection.count_documents({"status": "available"})
        my_adoptions = await app_collection.count_documents({"user_id": user_id, "status": "approved"})

        logger.info(
            f"Adopter home accessed successfully by user: {token_payload.get('sub')}"
        )
        return {
            "message": "Welcome to Adopter Home",
            "user_id": token_payload.get("sub"),
            "user_role": token_payload.get("role"),
            "home_data": {
                "available_pets": available_pets,
                "my_adoptions": my_adoptions,
                "favorite_pets": favorite_count,
            },
        }

    except Exception as e:
        logger.error(
            f"Adopter home error for user: {token_payload.get('sub')}, error: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


@router.put(
    "/profile",
    status_code=status.HTTP_200_OK,
    summary="Update Adopter Profile",
    description=(
        "Update adopter profile (partial update). "
        "Only the authenticated adopter can update their own profile. "
        "All fields are optional - only provided fields will be updated."
    ),
)
def update_profile(
    profile_data: UpdateAdopterProfile,
    token_payload: dict = Depends(verify_token),
    db=Depends(get_db),
):
    # Endpoint to update adopter profile - protected by JWT and role-based authorization
    # Only users with role="adopter" can access this endpoint
    # The user_id is extracted from the token, ensuring users can only edit their own profile
    logger.info(
        f"PATCH /adopter/profile - Request from user: {token_payload.get('sub')}"
    )

    # Verify role
    user_role = token_payload.get("role", "").lower()
    if user_role != "adopter":
        logger.warning(
            f"Access denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Adopter role required"},
        )

    # Extract user ID from token (users can only edit their own profile)
    user_id = int(token_payload.get("sub", 0))

    try:
        # Convert Pydantic schema to dict, excluding None values (partial update)
        update_data = profile_data.model_dump(exclude_none=True)
        # Call service to update the user profile
        update_adopter_profile(db, user_id, update_data)

        logger.info(f"Profile updated successfully for user ID: {user_id}")
        return UpdateResponse(
            message="Profile updated successfully",
            user_id=user_id,
            updated_at=datetime.now(),
        )

    except ValueError as e:
        error_msg = str(e)
        if "Email already in use" in error_msg:
            logger.warning(
                f"Profile update failed - Email already in use for user: {user_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"message": error_msg},
            )
        logger.warning(
            f"Profile update failed - Validation error for user: {user_id}, error: {error_msg}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": error_msg},
        )

    except Exception as e:
        logger.error(f"Profile update error for user: {user_id}, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )
