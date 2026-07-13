# Favorite service for business logic

# SQLAlchemy imports
from sqlalchemy.orm import Session
from sqlalchemy import and_

# Typing imports
from typing import Dict, Any, List, Optional

# Model imports
from app.models.favorites.favorite import Favorite

# Logger import
from app.utils.logger.logger_config import logger


async def add_favorite(
    db: Session, mongo_db, user_id: int, pet_profile_id: str
) -> Dict[str, Any]:
    # Add a pet to user's favorites after validating existence in MongoDB
    logger.info(
        f"Adding favorite for user ID: {user_id}, pet profile ID: {pet_profile_id}"
    )

    # Validate pet profile exists in MongoDB
    pet_profile = await _get_pet_profile(mongo_db, pet_profile_id)
    if pet_profile is None:
        logger.warning(f"Add favorite failed - pet profile not found: {pet_profile_id}")
        raise ValueError("Pet profile not found")

    # Check for duplicate favorite
    existing = (
        db.query(Favorite)
        .filter(
            and_(
                Favorite.user_id == user_id,
                Favorite.pet_profile_id == pet_profile_id,
            )
        )
        .first()
    )

    if existing:
        logger.warning(
            f"Favorite already exists for user ID: {user_id}, pet: {pet_profile_id}"
        )
        raise ValueError("Pet already in favorites")

    # Create and persist the favorite
    favorite = Favorite(user_id=user_id, pet_profile_id=pet_profile_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    logger.info(f"Favorite added successfully - ID: {favorite.favorite_id}")

    return {
        "favorite_id": favorite.favorite_id,
        "user_id": favorite.user_id,
        "pet_profile_id": favorite.pet_profile_id,
    }


def remove_favorite(db: Session, user_id: int, pet_profile_id: str) -> None:
    # Remove a pet from user's favorites
    logger.info(
        f"Removing favorite for user ID: {user_id}, pet profile ID: {pet_profile_id}"
    )

    # Find the favorite entry
    favorite = (
        db.query(Favorite)
        .filter(
            and_(
                Favorite.user_id == user_id,
                Favorite.pet_profile_id == pet_profile_id,
            )
        )
        .first()
    )

    if not favorite:
        logger.warning(
            f"Favorite not found for user ID: {user_id}, pet: {pet_profile_id}"
        )
        raise ValueError("Favorite not found")

    # Delete and commit
    db.delete(favorite)
    db.commit()

    logger.info(
        f"Favorite removed successfully for user ID: {user_id}, pet: {pet_profile_id}"
    )


async def list_favorites(db: Session, mongo_db, user_id: int) -> List[Dict[str, Any]]:
    # List all favorites for a user with embedded pet profile data
    logger.info(f"Listing favorites for user ID: {user_id}")

    # Fetch all favorites from database
    favorites = db.query(Favorite).filter(Favorite.user_id == user_id).all()

    # Enrich each favorite with pet profile data from MongoDB
    result = []
    for fav in favorites:
        pet_data = await _get_pet_profile(mongo_db, fav.pet_profile_id)  # type: ignore[arg-type]
        result.append(
            {
                "favorite_id": fav.favorite_id,
                "user_id": fav.user_id,
                "pet_profile_id": fav.pet_profile_id,
                "pet": pet_data,
            }
        )

    logger.info(f"Retrieved {len(result)} favorites for user ID: {user_id}")
    return result


async def _get_pet_profile(mongo_db, profile_id: str) -> Optional[Dict[str, Any]]:
    # Fetch a single pet profile from MongoDB by profile ID
    try:
        profiles_collection = mongo_db["pet_profiles"]
        profile = await profiles_collection.find_one({"_id": profile_id})

        if not profile:
            logger.warning(f"Pet profile not found in MongoDB: {profile_id}")
            return None

        return {
            "profile_id": profile["_id"],
            "title": profile.get("title"),
            "tags": profile.get("tags"),
            "emotional_description": profile.get("emotional_description"),
            "status": profile.get("status"),
            "creation_date": profile.get("creation_date"),
            "pet": profile.get("pet"),
        }
    except Exception as e:
        logger.error(f"Failed to fetch pet profile {profile_id} from MongoDB: {str(e)}")
        return None


def get_favorite_count(db: Session, user_id: int) -> int:
    # Get total count of favorites for a user
    count = db.query(Favorite).filter(Favorite.user_id == user_id).count()
    return count
