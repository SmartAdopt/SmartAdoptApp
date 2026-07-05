# Application service

# Typing imports
from typing import Dict, Any, List
from datetime import datetime

# Model imports
from app.models.applications.application import Application

# Service imports
from app.services.ai_service import evaluate_adoption_application

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


async def create_application(
    mongo_db, user_id: int, pet_profile_id: str
) -> Dict[str, Any]:
    # Create a new adoption application for a pet
    logger.info(
        f"Creating adoption application for user_id: {user_id}, pet: {pet_profile_id}"
    )

    # Validate that the user has a completed adoption form
    try:
        forms_collection = mongo_db["adoption_forms"]
        form = await forms_collection.find_one({"user_id": user_id})

        if not form:
            logger.warning(f"Adoption form not found for user_id: {user_id}")
            raise ValueError(
                "You must complete the suitability form before applying for adoption"
            )
        logger.info(
            f"Adoption form found for user_id: {user_id} - form_id: {form.get('_id')}"
        )
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Failed to check adoption form: {str(e)}")
        raise ValueError("Failed to verify adoption form")

    # Validate that the pet exists and is available
    try:
        profiles_collection = mongo_db["pet_profiles"]
        pet = await profiles_collection.find_one({"_id": pet_profile_id})

        if not pet:
            logger.warning(f"Pet profile not found: {pet_profile_id}")
            raise ValueError("Pet profile not found")

        pet_status = pet.get("status", "").lower()
        if pet_status != "available":
            logger.warning(
                f"Pet {pet_profile_id} is not available (status: {pet_status})"
            )
            raise ValueError("This pet is not available for adoption")
        logger.info(f"Pet profile found and available: {pet_profile_id}")
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Failed to verify pet profile: {str(e)}")
        raise ValueError("Failed to verify pet profile")

    # Check if user already has an application for this pet
    try:
        applications_collection = mongo_db["applications"]
        existing = await applications_collection.find_one(
            {"user_id": user_id, "pet_profile_id": pet_profile_id}
        )

        if existing:
            logger.warning(f"User {user_id} already applied for pet {pet_profile_id}")
            raise ValueError("You have already applied for this pet")
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Failed to check existing applications: {str(e)}")
        raise ValueError("Failed to check existing applications")

    # Evaluate cross-compatibility with AI
    try:
        logger.info("Starting AI evaluation of adoption application")
        ai_result = await evaluate_adoption_application(form, pet)
        logger.info(
            f"AI evaluation completed - total: {ai_result['total_score']}/{ai_result['total_max_score']}, "
            f"main: {ai_result['main_score']}/{ai_result['main_max_score']}, "
            f"logistics: {ai_result['logistics_education_score']}/{ai_result['logistics_education_max_score']}"
        )
    except Exception as e:
        logger.error(f"AI evaluation failed: {str(e)}")
        raise ValueError("Failed to evaluate adoption compatibility")

    # Generate application ID
    try:
        sequence = await get_next_sequence(mongo_db, "counters", "application_counter")
        application_id = f"AP{sequence}"
        logger.info(f"Generated application ID: {application_id}")
    except Exception as e:
        logger.error(f"Failed to generate application ID: {str(e)}")
        raise ValueError("Failed to generate application ID")

    # Get form ID from the form document
    form_id = form.get("_id", "")

    # Create Application model instance
    application_model = Application(
        application_id=application_id,
        user_id=user_id,
        pet_profile_id=pet_profile_id,
        form_id=form_id,
        main_score=ai_result["main_score"],
        main_max_score=ai_result["main_max_score"],
        logistics_education_score=ai_result["logistics_education_score"],
        logistics_education_max_score=ai_result["logistics_education_max_score"],
        ai_justification=ai_result["justification"],
        total_score=ai_result["total_score"],
        total_max_score=ai_result["total_max_score"],
        ai_breakdown=ai_result.get("breakdown", []),
        status="pending",
        created_at=datetime.now(),
    )

    # Convert model to dict for MongoDB
    application_document = {
        "_id": application_model.application_id,
        "user_id": application_model.user_id,
        "pet_profile_id": application_model.pet_profile_id,
        "form_id": application_model.form_id,
        "total_score": application_model.total_score,
        "total_max_score": application_model.total_max_score,
        "main_score": application_model.main_score,
        "main_max_score": application_model.main_max_score,
        "logistics_education_score": application_model.logistics_education_score,
        "logistics_education_max_score": application_model.logistics_education_max_score,
        "ai_breakdown": application_model.ai_breakdown,
        "ai_justification": application_model.ai_justification,
        "status": application_model.status,
        "created_at": application_model.created_at,
    }

    # Insert into MongoDB
    try:
        await applications_collection.insert_one(application_document)
        logger.info(f"Adoption application created successfully: {application_id}")
    except Exception as e:
        logger.error(f"Failed to insert application into MongoDB: {str(e)}")
        raise ValueError("Failed to create adoption application")

    # Update pet status to in_process
    try:
        profiles_collection = mongo_db["pet_profiles"]
        await profiles_collection.update_one(
            {"_id": pet_profile_id},
            {"$set": {"status": "in_process"}},
        )
        logger.info(f"Pet {pet_profile_id} status updated to in_process")
    except Exception as e:
        logger.error(f"Failed to update pet status: {str(e)}")
        # Application was already created, so log but don't rollback
        logger.warning(
            f"Application {application_id} created but pet status not updated"
        )

    return application_document


async def list_applications(mongo_db, user_id: int) -> List[Dict[str, Any]]:
    # List all applications for a user with embedded pet profile data
    logger.info(f"Listing adoption applications for user_id: {user_id}")

    try:
        applications_collection = mongo_db["applications"]
        profiles_collection = mongo_db["pet_profiles"]

        # Fetch all applications for this user
        applications = await applications_collection.find({"user_id": user_id}).to_list(
            length=None
        )

        logger.info(f"Found {len(applications)} applications for user_id: {user_id}")

        # Enrich each application with pet profile data
        result = []
        for app in applications:
            # Fetch pet profile data
            pet_raw = await profiles_collection.find_one(
                {"_id": app.get("pet_profile_id")}
            )

            # Clean pet data (remove MongoDB _id to avoid duplication with id field)
            pet = None
            if pet_raw:
                pet = {
                    "profile_id": pet_raw.get("_id"),
                    "title": pet_raw.get("title"),
                    "tags": pet_raw.get("tags"),
                    "emotional_description": pet_raw.get("emotional_description"),
                    "status": pet_raw.get("status"),
                    "creation_date": pet_raw.get("creation_date"),
                    "pet": pet_raw.get("pet"),
                }

            # Build enriched application object
            enriched_app = {
                "application_id": app.get("_id"),
                "pet_profile_id": app.get("pet_profile_id"),
                "total_score": app.get("total_score"),
                "total_max_score": app.get("total_max_score"),
                "main_score": app.get("main_score"),
                "main_max_score": app.get("main_max_score"),
                "logistics_education_score": app.get("logistics_education_score"),
                "logistics_education_max_score": app.get(
                    "logistics_education_max_score"
                ),
                "ai_breakdown": app.get("ai_breakdown"),
                "ai_justification": app.get("ai_justification"),
                "status": app.get("status"),
                "created_at": app.get("created_at"),
                "pet": pet,
            }

            result.append(enriched_app)

        logger.info(
            f"Retrieved {len(result)} applications with pet data for user_id: {user_id}"
        )
        return result
    except Exception as e:
        logger.error(f"Failed to list applications: {str(e)}")
        raise ValueError("Failed to list adoption applications")
