# Favorite routes for CRUD operations

# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, status

# Database imports
from app.database.postgres.postgres_db import get_db
from app.database.mongo.mongo_db import get_mongo_db

# JWT utilities
from app.utils.jwt.jwt_utils import verify_token

# Schema imports
from app.schemas.favorite_schemas import (
    FavoriteResponse,
    FavoriteWithPetResponse,
    FavoriteAddResponse,
    FavoriteRemoveResponse,
    FavoriteListResponse,
)

# Service imports
from app.services.favorite_service import (
    add_favorite,
    remove_favorite,
    list_favorites,
)

# Logger import
from app.utils.logger.logger_config import logger

# Create router with prefix and tags
router = APIRouter(prefix="/adopter/favorites", tags=["Adopter Favorites"])


@router.post(
    "/{pet_profile_id}",
    status_code=status.HTTP_201_CREATED,
    summary="Add Favorite",
    description="Add a pet to the authenticated adopter's favorites",
)
async def add_favorite_route(
    pet_profile_id: str,
    token_payload: dict = Depends(verify_token),
    db=Depends(get_db),
    mongo_db=Depends(get_mongo_db),
):
    # Endpoint to add a pet to favorites - validates pet exists in MongoDB
    logger.info(f"POST /adopter/favorites/{pet_profile_id} - Add favorite request")

    # Verify role
    user_role = token_payload.get("role", "").lower()
    if user_role != "adopter":
        logger.warning(
            f"Add favorite denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Adopter role required"},
        )

    user_id = int(token_payload.get("sub", 0))

    try:
        favorite = await add_favorite(db, mongo_db, user_id, pet_profile_id)
        logger.info(f"Favorite added by user ID: {user_id} for pet: {pet_profile_id}")
        return FavoriteAddResponse(
            message="Pet added to favorites",
            favorite=FavoriteResponse(
                favorite_id=favorite["favorite_id"],
                user_id=favorite["user_id"],
                pet_profile_id=favorite["pet_profile_id"],
            ),
        )
    except ValueError as e:
        logger.warning(f"Add favorite failed for user ID: {user_id}, error: {str(e)}")
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
                if "not found" in str(e).lower()
                else status.HTTP_409_CONFLICT
            ),
            detail={"message": str(e)},
        )
    except Exception as e:
        logger.error(
            f"Unexpected error adding favorite for user ID: {user_id}, error: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


@router.delete(
    "/{pet_profile_id}",
    status_code=status.HTTP_200_OK,
    summary="Remove Favorite",
    description="Remove a pet from the authenticated adopter's favorites",
)
def remove_favorite_route(
    pet_profile_id: str,
    token_payload: dict = Depends(verify_token),
    db=Depends(get_db),
):
    # Endpoint to remove a pet from favorites
    logger.info(f"DELETE /adopter/favorites/{pet_profile_id} - Remove favorite request")

    # Verify role
    user_role = token_payload.get("role", "").lower()
    if user_role != "adopter":
        logger.warning(
            f"Remove favorite denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Adopter role required"},
        )

    user_id = int(token_payload.get("sub", 0))

    try:
        remove_favorite(db, user_id, pet_profile_id)
        logger.info(f"Favorite removed by user ID: {user_id} for pet: {pet_profile_id}")
        return FavoriteRemoveResponse(message="Pet removed from favorites")
    except ValueError as e:
        logger.warning(
            f"Remove favorite failed for user ID: {user_id}, error: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": str(e)},
        )
    except Exception as e:
        logger.error(
            f"Unexpected error removing favorite for user ID: {user_id}, error: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="List Favorites",
    description="List all favorites with pet data for the authenticated adopter",
)
async def list_favorites_route(
    token_payload: dict = Depends(verify_token),
    db=Depends(get_db),
    mongo_db=Depends(get_mongo_db),
):
    # Endpoint to list all favorites with embedded pet profile data
    logger.info("GET /adopter/favorites/ - List favorites request")

    # Verify role
    user_role = token_payload.get("role", "").lower()
    if user_role != "adopter":
        logger.warning(
            f"List favorites denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Adopter role required"},
        )

    user_id = int(token_payload.get("sub", 0))

    try:
        favorites = await list_favorites(db, mongo_db, user_id)
        logger.info(f"Listed {len(favorites)} favorites for user ID: {user_id}")

        favorite_responses = []
        for fav in favorites:
            favorite_responses.append(
                FavoriteWithPetResponse(
                    favorite_id=fav["favorite_id"],
                    user_id=fav["user_id"],
                    pet_profile_id=fav["pet_profile_id"],
                    pet=fav.get("pet"),
                )
            )

        return FavoriteListResponse(
            favorites=favorite_responses,
            count=len(favorite_responses),
        )
    except Exception as e:
        logger.error(
            f"Unexpected error listing favorites for user ID: {user_id}, error: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )
