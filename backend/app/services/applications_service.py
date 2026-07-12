# Application service

# Typing imports
from typing import Dict, Any, Optional
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
    mongo_db, user_id: int, pet_profile_id: str, adopter_name: Optional[str] = None
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
        needs_manual_review = False
    except Exception as e:
        logger.error(f"AI evaluation failed, defaulting to manual review: {str(e)}")
        ai_result = {
            "total_score": 0,
            "total_max_score": 15,
            "main_score": 0,
            "main_max_score": 11,
            "logistics_education_score": 0,
            "logistics_education_max_score": 4,
            "breakdown": [],
            "justification": "Evaluación automática no disponible — requiere revisión manual",
        }
        needs_manual_review = True

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
        needs_manual_review=needs_manual_review,
        adopter_name=adopter_name,
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
        "needs_manual_review": application_model.needs_manual_review,
        "adopter_name": application_model.adopter_name,
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

    # Send notification to the user that their application was received
    from app.services.notification_service import create_notification

    try:
        # Get pet name if possible to personalize notification
        pet_name = "la mascota"
        if pet_profile_id:
            pet = await profiles_collection.find_one({"_id": pet_profile_id})
            if pet:
                pet_name = (pet.get("pet") or {}).get("name", "la mascota")

        await create_notification(
            mongo_db,
            application_model.user_id,
            titulo="Solicitud Recibida",
            descripcion=f"Tu solicitud para adoptar a {pet_name} ha sido recibida con éxito y está en revisión por nuestro equipo.",
            application_id=application_id,
            tipo="under_review",
        )
        logger.info(
            f"Notification sent to user {application_model.user_id} for new application {application_id}"
        )
    except Exception as notif_e:
        logger.warning(f"Could not send application creation notification: {notif_e}")

    return application_document


async def review_application(
    db, application_id: str, status: str, admin_id: int, postgres_db=None
) -> Dict[str, Any]:
    # Review (approve/reject) a single application. Syncs the linked pet
    # profile status: in_process -> adopted / available.
    logger.info(
        f"Reviewing application {application_id} with status: {status} by admin: {admin_id}"
    )

    try:
        applications_collection = db["applications"]
        app = await applications_collection.find_one({"_id": application_id})
        if not app:
            logger.warning(f"Application not found: {application_id}")
            raise ValueError("Application not found")

        # Block re-review only if already properly reviewed (has reviewed_by)
        if app.get("reviewed_by") is not None and app.get("status") != "pending":
            logger.warning(
                f"Application {application_id} already reviewed with status: {app.get('status')}"
            )
            raise ValueError(
                f"Application already reviewed. Current status: {app.get('status')}"
            )

        # Check pet status before approving to prevent double-adoption
        pet_profile_id = app.get("pet_profile_id")
        profiles_collection = None
        if pet_profile_id:
            profiles_collection = db["pet_profiles"]
            pet = await profiles_collection.find_one({"_id": pet_profile_id})
            if pet and pet.get("status") == "adopted" and status == "approved":
                logger.warning(
                    f"Cannot approve application {application_id} because pet {pet_profile_id} is already adopted"
                )
                raise ValueError("Cannot approve application: Pet is already adopted")

        # Update application
        await applications_collection.update_one(
            {"_id": application_id},
            {
                "$set": {
                    "status": status,
                    "reviewed_by": admin_id,
                    "reviewed_at": datetime.now(),
                    "last_updated": datetime.now(),
                }
            },
        )

        # Sync linked pet profile: approved -> adopted, rejected -> available
        if pet_profile_id and profiles_collection is not None:
            pet_status = "adopted" if status == "approved" else "available"
            await profiles_collection.update_one(
                {"_id": pet_profile_id},
                {"$set": {"status": pet_status, "last_updated": datetime.now()}},
            )
            logger.info(f"Pet {pet_profile_id} status updated to '{pet_status}'")

            # Remove from favorites if rejected
            if status == "rejected" and postgres_db is not None:
                from app.services.favorite_service import remove_favorite

                try:
                    remove_favorite(postgres_db, app.get("user_id"), pet_profile_id)
                    logger.info(
                        f"Removed pet {pet_profile_id} from user {app.get('user_id')} favorites due to rejection"
                    )
                except Exception as fav_e:
                    logger.warning(f"Could not remove favorite on rejection: {fav_e}")

        # 1. Nombre de la mascota desde MongoDB
        pet_name = "la mascota"
        if pet_profile_id and profiles_collection is not None:
            if pet:
                pet_name = (pet.get("pet") or {}).get("name", "la mascota")

        # 2. First_name del admin desde PostgreSQL
        admin_first_name = "El equipo"
        if postgres_db:
            from app.models.user.user import User

            admin_user = (
                postgres_db.query(User).filter(User.user_id == admin_id).first()
            )
            if admin_user:
                admin_first_name = admin_user.first_name

        # 3. user_id del adoptante
        user_id = app.get("user_id")

        # 4. Crear notificación
        from app.services.notification_service import create_notification

        if status == "approved":
            await create_notification(
                db,
                user_id,
                titulo="¡Solicitud Aprobada!",
                descripcion=f"¡Felicidades! Tu solicitud para adoptar a {pet_name} ha sido aprobada por {admin_first_name}. Entra en Solicitudes para ver los detalles y la información de la fundación.",
                application_id=application_id,
                tipo="approved",
            )
        else:
            await create_notification(
                db,
                user_id,
                titulo="Solicitud Revisada",
                descripcion=f"Tu solicitud para adoptar a {pet_name} ha sido revisada por {admin_first_name}. Entra en Solicitudes para ver el resultado.",
                application_id=application_id,
                tipo="rejected",
            )

        logger.info(f"Application {application_id} reviewed successfully")

        return {
            "message": "Application reviewed successfully",
            "application_id": application_id,
            "status": status,
            "user_id": app.get("user_id"),
        }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Failed to review application: {str(e)}")
        raise ValueError("Failed to review application")
