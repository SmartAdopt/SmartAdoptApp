# Pet service

# SQLAlchemy imports
from sqlalchemy.orm import Session

# Schema imports
from typing import Dict, Any, List

# Backblaze service import
from app.services.backblaze_service import get_image_url

# MongoDB imports
from app.database.mongo.mongo_db import get_client

# Logger import
from app.utils.logger.logger_config import logger


async def get_next_sequence(
    db_name: str, collection_name: str, counter_name: str
) -> int:
    # Get next sequential number from MongoDB counter
    logger.info(f"Getting next sequence for counter: {counter_name}")
    try:
        client = get_client()
        db = client[db_name]
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


async def register_pet(db: Session, pet_data: Dict[str, Any]) -> Dict[str, Any]:
    # Register a new pet
    logger.info(f"Pet registration attempt for name: {pet_data['name']}")

    # Validate that pet_image_url is provided
    if not pet_data.get("pet_image_url"):
        logger.error("Pet registration failed - pet_image_url is required")
        raise ValueError("pet_image_url is required")

    # Get image URL from Backblaze
    try:
        image_url = get_image_url(pet_data["pet_image_url"])
        logger.info(f"Image URL obtained from Backblaze: {image_url}")
    except Exception as e:
        logger.error(f"Failed to get image URL from Backblaze: {str(e)}")
        raise ValueError("Failed to get image URL from Backblaze")

    # Determine animal type from animal_breed[0]
    animal_type = (
        pet_data["animal_breed"][0].lower() if pet_data.get("animal_breed") else ""
    )

    # Generate sequential pet ID with type prefix
    # P{number} for dogs, G{number} for cats
    from app.config import settings

    try:
        if animal_type == "dog":
            sequence = await get_next_sequence(
                settings.MONGO_DB, "counters", "dog_pet_counter"
            )
            pet_id = f"P{sequence}"
        elif animal_type == "cat":
            sequence = await get_next_sequence(
                settings.MONGO_DB, "counters", "cat_pet_counter"
            )
            pet_id = f"G{sequence}"
        else:
            logger.error(
                f"Pet registration failed - invalid animal type: {animal_type}"
            )
            raise ValueError("Invalid animal type")
    except Exception as e:
        logger.error(f"Failed to generate pet ID: {str(e)}")
        raise ValueError("Failed to generate pet ID")

    # Prepare pet data for MongoDB insertion
    pet_document = {
        "_id": pet_id,
        "name": pet_data["name"],
        "pet_image_url": image_url,
        "animal_breed": pet_data["animal_breed"],
        "age": pet_data["age"],
        "gender": pet_data["gender"],
        "is_sterilized": pet_data["is_sterilized"],
        "vaccines_up_to_date": pet_data.get("vaccines_up_to_date", []),
        "dewormed": pet_data["dewormed"],
        "weight_kg": pet_data["weight_kg"],
        "special_conditions": pet_data.get("special_conditions", []),
        "brief_description": pet_data["brief_description"],
        "created_at": None,  # Will be set by MongoDB
    }

    # Insert into MongoDB
    try:
        client = get_client()
        mongo_db = client[settings.MONGO_DB]
        pets_collection = mongo_db["pets"]

        # Insert the pet document
        await pets_collection.insert_one(pet_document)
        logger.info(f"Pet registered successfully with ID: {pet_id}")
    except Exception as e:
        logger.error(f"Failed to insert pet into MongoDB: {str(e)}")
        raise ValueError("Failed to register pet in database")

    return {
        "pet_id": pet_id,
        "name": pet_data["name"],
        "pet_image_url": image_url,
    }


async def update_pet(
    db: Session, pet_id: str, pet_data: Dict[str, Any]
) -> Dict[str, Any]:
    # Update an existing pet
    logger.info(f"Pet update attempt for ID: {pet_id}")

    try:
        client = get_client()
        from app.config import settings

        mongo_db = client[settings.MONGO_DB]
        pets_collection = mongo_db["pets"]

        # Check if pet exists
        existing_pet = await pets_collection.find_one({"_id": pet_id})
        if not existing_pet:
            logger.warning(f"Pet not found with ID: {pet_id}")
            raise ValueError("Pet not found")

        # Only allow updating specific fields (not name, pet_image_url, animal_breed, gender)
        allowed_update_fields = {
            "age",
            "is_sterilized",
            "vaccines_up_to_date",
            "dewormed",
            "weight_kg",
            "special_conditions",
            "brief_description",
        }

        # Prepare update data with only allowed fields
        update_data = {}
        for field in allowed_update_fields:
            if field in pet_data:
                update_data[field] = pet_data[field]

        if not update_data:
            logger.warning(f"No valid fields to update for pet ID: {pet_id}")
            raise ValueError("No valid fields to update")

        # Update pet in MongoDB
        await pets_collection.update_one({"_id": pet_id}, {"$set": update_data})
        logger.info(
            f"Pet updated successfully with ID: {pet_id} (fields: {list(update_data.keys())})"
        )
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Failed to update pet in MongoDB: {str(e)}")
        raise ValueError("Failed to update pet in database")

    return {
        "pet_id": pet_id,
        "name": existing_pet["name"],
        "message": "Pet updated successfully",
    }


async def list_pets(db: Session) -> List[Dict[str, Any]]:
    # List all pets
    logger.info("Listing all pets")

    try:
        client = get_client()
        from app.config import settings

        mongo_db = client[settings.MONGO_DB]
        pets_collection = mongo_db["pets"]

        # Query all pets from MongoDB
        cursor = pets_collection.find()
        pets = []
        async for pet in cursor:
            # Convert MongoDB _id to string and remove it from response
            pet_dict = {
                "pet_id": pet["_id"],
                "name": pet["name"],
                "pet_image_url": pet["pet_image_url"],
                "animal_breed": pet["animal_breed"],
                "age": pet["age"],
                "gender": pet["gender"],
                "is_sterilized": pet["is_sterilized"],
                "vaccines_up_to_date": pet["vaccines_up_to_date"],
                "dewormed": pet["dewormed"],
                "weight_kg": pet["weight_kg"],
                "special_conditions": pet["special_conditions"],
                "brief_description": pet["brief_description"],
            }
            pets.append(pet_dict)

        logger.info(f"Retrieved {len(pets)} pets successfully")
        return pets
    except Exception as e:
        logger.error(f"Failed to retrieve pets from MongoDB: {str(e)}")
        raise ValueError("Failed to retrieve pets from database")
