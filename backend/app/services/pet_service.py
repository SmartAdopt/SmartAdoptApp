# Pet service

# Schema imports
from typing import Dict, Any, List

# Backblaze service import
from app.services.backblaze_service import get_image_url

# AI service import
from app.services.ai_service import describe_image_with_blip, enrich_profile_with_llama

# Model imports
from app.models.pet.pet import Pet
from app.models.pet.pet_profile import PetProfile

# Logger import
from app.utils.logger.logger_config import logger


async def get_next_sequence(db, collection_name: str, counter_name: str) -> int:
    # Get next sequential number from MongoDB counter
    logger.info(f"Getting next sequence for counter: {counter_name}")
    try:
        counters_collection = db[collection_name]

        # Find and increment the counter
        result = await counters_collection.find_one_and_update(
            {"_id": counter_name},
            {"$inc": {"sequence_value": 1}},
            upsert=True,
            return_document=True,
        )

        if result:
            sequence = result.get("sequence_value", 1)
        else:
            sequence = 1

        logger.info(f"Next sequence obtained: {sequence}")
        return sequence
    except Exception as e:
        logger.error(f"Failed to get next sequence: {str(e)}")
        raise Exception("Failed to get next sequence")


async def register_pet(db, pet_data: Dict[str, Any]) -> Dict[str, Any]:
    # Register a new pet with AI-generated profile
    logger.info(f"Pet registration attempt for name: {pet_data['name']}")

    # Validate that pet_image_url is provided
    if not pet_data.get("pet_image_url"):
        logger.warning("Pet registration failed - pet_image_url is required")
        raise ValueError("pet_image_url is required")

    # Get image URL from Backblaze
    try:
        # Check if pet_image_url is already a complete Backblaze URL
        if (
            pet_data["pet_image_url"].startswith("https://")
            and "backblazeb2.com" in pet_data["pet_image_url"]
        ):
            # URL is already complete, use it directly
            image_url = pet_data["pet_image_url"]
            logger.info(f"Image URL is already complete: {image_url}")
        else:
            # URL is just a filename, get full URL from Backblaze
            image_url = get_image_url(pet_data["pet_image_url"])
            logger.info(f"Image URL obtained from Backblaze: {image_url}")
    except Exception as e:
        logger.error(f"Failed to get image URL from Backblaze: {str(e)}")
        raise ValueError("Failed to get image URL from Backblaze")

    # Generate profile ID
    from datetime import datetime

    try:
        sequence = await get_next_sequence(db, "counters", "profile_counter")
        profile_id = f"PR{sequence}"
    except Exception as e:
        logger.error(f"Failed to generate profile ID: {str(e)}")
        raise ValueError("Failed to generate profile ID")

    # Call BLIP to describe image
    try:
        blip_description = await describe_image_with_blip(image_url)
        logger.info(f"BLIP description obtained: {blip_description}")
    except Exception as e:
        logger.error(f"Failed to get BLIP description: {str(e)}")
        raise ValueError("Failed to generate image description")

    # Call Llama 3 8B to enrich profile
    try:
        enriched_data = await enrich_profile_with_llama(pet_data, blip_description)
        logger.info("Llama 3 8B enrichment completed")
    except Exception as e:
        logger.error(f"Failed to enrich profile with Llama 3 8B: {str(e)}")
        raise ValueError("Failed to enrich profile")

    # Create Pet model instance
    pet_model = Pet(
        name=pet_data["name"],
        pet_image_url=image_url,
        animal_breed=pet_data["animal_breed"],
        age=pet_data["age"],
        gender=pet_data["gender"],
        is_sterilized=pet_data["is_sterilized"],
        vaccines_up_to_date=pet_data.get("vaccines_up_to_date", []),
        dewormed=pet_data["dewormed"],
        weight_kg=pet_data["weight_kg"],
        special_conditions=pet_data.get("special_conditions", []),
        brief_description=pet_data["brief_description"],
    )

    # Create PetProfile model instance
    profile_model = PetProfile(
        id=profile_id,
        title=enriched_data["title"],
        tags=enriched_data["tags"],
        emotional_description=enriched_data["emotional_description"],
        status="available",
        creation_date=datetime.now(),
        pet=pet_model,
    )

    # Convert model to dict for MongoDB
    profile_document = {
        "_id": profile_id,
        "id": profile_model.id,
        "title": profile_model.title,
        "tags": profile_model.tags,
        "emotional_description": profile_model.emotional_description,
        "status": profile_model.status,
        "creation_date": profile_model.creation_date,
        "pet": {
            "name": profile_model.pet.name,
            "pet_image_url": profile_model.pet.pet_image_url,
            "animal_breed": profile_model.pet.animal_breed,
            "age": profile_model.pet.age,
            "gender": profile_model.pet.gender,
            "is_sterilized": profile_model.pet.is_sterilized,
            "vaccines_up_to_date": profile_model.pet.vaccines_up_to_date,
            "dewormed": profile_model.pet.dewormed,
            "weight_kg": profile_model.pet.weight_kg,
            "special_conditions": profile_model.pet.special_conditions,
            "brief_description": profile_model.pet.brief_description,
        },
    }

    # Insert into MongoDB
    try:
        profiles_collection = db["pet_profiles"]
        await profiles_collection.insert_one(profile_document)
        logger.info(f"Profile registered successfully with ID: {profile_id}")
    except Exception as e:
        logger.error(f"Failed to insert profile into MongoDB: {str(e)}")
        raise ValueError("Failed to register profile in database")

    return {
        "profile_id": profile_id,
        "title": profile_model.title,
        "tags": profile_model.tags,
        "emotional_description": profile_model.emotional_description,
        "status": profile_model.status,
        "creation_date": profile_model.creation_date,
        "pet": profile_document["pet"],
    }


async def regenerate_profile(db, profile_id: str) -> Dict[str, Any]:
    # Regenerate profile with AI (BLIP + Llama 3 8B)
    logger.info(f"Profile regeneration attempt for ID: {profile_id}")

    try:
        profiles_collection = db["pet_profiles"]

        # Check if profile exists
        existing_profile = await profiles_collection.find_one({"_id": profile_id})
        if not existing_profile:
            logger.warning(f"Profile not found with ID: {profile_id}")
            raise ValueError("Profile not found")

        # Get pet data from existing profile
        pet_data = existing_profile["pet"]
        image_url = pet_data["pet_image_url"]

        # Ensure list fields are lists (not None)
        pet_data["animal_breed"] = pet_data.get("animal_breed") or []
        pet_data["vaccines_up_to_date"] = pet_data.get("vaccines_up_to_date") or []
        pet_data["special_conditions"] = pet_data.get("special_conditions") or []

        # Call BLIP to describe image
        try:
            blip_description = await describe_image_with_blip(image_url)
            logger.info(f"BLIP description obtained: {blip_description}")
        except Exception as e:
            logger.error(f"Failed to get BLIP description: {str(e)}")
            raise ValueError("Failed to generate image description")

        # Call Llama 3 8B to enrich profile
        try:
            enriched_data = await enrich_profile_with_llama(pet_data, blip_description)
            logger.info("Llama 3 8B enrichment completed")
        except Exception as e:
            logger.error(f"Failed to enrich profile with Llama 3 8B: {str(e)}")
            raise ValueError("Failed to enrich profile")

        # Update profile in MongoDB
        update_data = {
            "title": enriched_data["title"],
            "tags": enriched_data["tags"],
            "emotional_description": enriched_data["emotional_description"],
        }

        await profiles_collection.update_one({"_id": profile_id}, {"$set": update_data})
        logger.info(f"Profile regenerated successfully with ID: {profile_id}")

        return {
            "profile_id": profile_id,
            "title": enriched_data["title"],
            "tags": enriched_data["tags"],
            "emotional_description": enriched_data["emotional_description"],
            "status": existing_profile["status"],
            "creation_date": existing_profile["creation_date"],
            "pet": existing_profile["pet"],
        }

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Failed to regenerate profile: {str(e)}")
        raise ValueError("Failed to regenerate profile")


async def update_pet(db, profile_id: str, pet_data: Dict[str, Any]) -> Dict[str, Any]:
    # Update an existing profile (manual edit including AI fields)
    logger.info(f"Profile update attempt for ID: {profile_id}")

    try:
        profiles_collection = db["pet_profiles"]

        # Check if profile exists
        existing_profile = await profiles_collection.find_one({"_id": profile_id})
        if not existing_profile:
            logger.warning(f"Profile not found with ID: {profile_id}")
            raise ValueError("Profile not found")

        # Prepare update data for pet fields
        pet_update_data = {}
        allowed_pet_fields = {
            "age",
            "is_sterilized",
            "vaccines_up_to_date",
            "dewormed",
            "weight_kg",
            "special_conditions",
            "brief_description",
        }

        for field in allowed_pet_fields:
            if field in pet_data:
                pet_update_data[field] = pet_data[field]

        # Prepare update data for AI fields
        ai_update_data = {}
        allowed_ai_fields = {
            "title",
            "tags",
            "emotional_description",
        }

        for field in allowed_ai_fields:
            if field in pet_data:
                ai_update_data[field] = pet_data[field]

        # Combine all updates
        update_data = {}
        if pet_update_data:
            update_data["pet"] = {**existing_profile["pet"], **pet_update_data}
        if ai_update_data:
            update_data.update(ai_update_data)

        if not update_data:
            logger.warning(f"No valid fields to update for profile ID: {profile_id}")
            raise ValueError("No valid fields to update")

        # Update profile in MongoDB
        await profiles_collection.update_one({"_id": profile_id}, {"$set": update_data})
        logger.info(
            f"Profile updated successfully with ID: {profile_id} (fields: {list(update_data.keys())})"
        )
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Failed to update profile in MongoDB: {str(e)}")
        raise ValueError("Failed to update profile in database")

    # Return updated profile
    updated_profile = await profiles_collection.find_one({"_id": profile_id})
    return {
        "profile_id": profile_id,
        "title": updated_profile.get("title") or existing_profile.get("title"),
        "tags": updated_profile.get("tags") or existing_profile.get("tags"),
        "emotional_description": updated_profile.get("emotional_description")
        or existing_profile.get("emotional_description"),
        "status": updated_profile.get("status") or existing_profile.get("status"),
        "creation_date": updated_profile.get("creation_date")
        or existing_profile.get("creation_date"),
        "pet": updated_profile.get("pet"),
    }


async def list_pets(db) -> List[Dict[str, Any]]:
    # List all profiles
    logger.info("Listing all profiles")

    try:
        profiles_collection = db["pet_profiles"]

        # Query all profiles from MongoDB
        cursor = profiles_collection.find()
        profiles = []
        async for profile in cursor:
            # Convert MongoDB _id to string and remove it from response
            profile_dict = {
                "profile_id": profile["_id"],
                "title": profile.get("title"),
                "tags": profile.get("tags"),
                "emotional_description": profile.get("emotional_description"),
                "status": profile.get("status"),
                "creation_date": profile.get("creation_date"),
                "pet": profile.get("pet"),
            }
            profiles.append(profile_dict)

        logger.info(f"Retrieved {len(profiles)} profiles successfully")
        return profiles
    except Exception as e:
        logger.error(f"Failed to retrieve profiles from MongoDB: {str(e)}")
        raise ValueError("Failed to retrieve profiles from database")
