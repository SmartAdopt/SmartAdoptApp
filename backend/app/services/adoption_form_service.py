# Adoption form service

# Schema imports
from typing import Dict, Any, Optional, List

# Model imports
from app.models.adoption_form.adoption_form import AdoptionForm

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


async def register_adoption_form(db, form_data: Dict[str, Any]) -> Dict[str, Any]:
    # Register a new adoption form
    logger.info(
        f"Adoption form registration attempt for user_id: {form_data['user_id']}"
    )

    # Check if user already has a form
    try:
        forms_collection = db["adoption_forms"]
        existing_form = await forms_collection.find_one(
            {"user_id": form_data["user_id"]}
        )
        if existing_form:
            logger.warning(f"User {form_data['user_id']} already has an adoption form")
            raise ValueError("User already has an adoption form. Use update instead.")
    except Exception as e:
        if "already has an adoption form" in str(e):
            raise
        logger.error(f"Failed to check existing form: {str(e)}")

    # Generate form ID
    from datetime import datetime

    try:
        sequence = await get_next_sequence(db, "counters", "adoption_form_counter")
        form_id = f"AF{sequence}"
    except Exception as e:
        logger.error(f"Failed to generate form ID: {str(e)}")
        raise ValueError("Failed to generate form ID")

    # Create AdoptionForm model instance
    form_model = AdoptionForm(
        user_id=form_data["user_id"],
        # I. Candidate Information
        neighborhood=form_data["neighborhood"],
        address=form_data["address"],
        employment_status=form_data["employment_status"],
        employment_status_other=form_data.get("employment_status_other"),
        housing_type=form_data["housing_type"],
        housing_type_other=form_data.get("housing_type_other"),
        has_natural_space=form_data["has_natural_space"],
        # II. Coexistence and Experience
        has_pets=form_data["has_pets"],
        current_pets_details=form_data.get("current_pets_details"),
        household_energy=form_data["household_energy"],
        has_children=form_data["has_children"],
        children_ages=form_data.get("children_ages"),
        long_term_commitment=form_data["long_term_commitment"],
        # III. Pet Preferences
        preferred_species=form_data["preferred_species"],
        preferred_gender=form_data["preferred_gender"],
        preferred_energy=form_data["preferred_energy"],
        # IV. Logistics and Education
        daily_time_dedication=form_data["daily_time_dedication"],
        sleeping_location=form_data["sleeping_location"],
        sleeping_location_other=form_data.get("sleeping_location_other"),
        behavior_approach=form_data["behavior_approach"],
        behavior_approach_other=form_data.get("behavior_approach_other"),
        emergency_plan=form_data["emergency_plan"],
        emergency_plan_other=form_data.get("emergency_plan_other"),
        # V. Final Motivation
        motivation=form_data["motivation"],
        submission_date=datetime.now(),
        last_updated=datetime.now(),
    )

    # Convert model to dict for MongoDB
    form_document = {
        "_id": form_id,
        "user_id": form_model.user_id,
        # I. Candidate Information
        "neighborhood": form_model.neighborhood,
        "address": form_model.address,
        "employment_status": form_model.employment_status,
        "employment_status_other": form_model.employment_status_other,
        "housing_type": form_model.housing_type,
        "housing_type_other": form_model.housing_type_other,
        "has_natural_space": form_model.has_natural_space,
        # II. Coexistence and Experience
        "has_pets": form_model.has_pets,
        "current_pets_details": form_model.current_pets_details,
        "household_energy": form_model.household_energy,
        "has_children": form_model.has_children,
        "children_ages": form_model.children_ages,
        "long_term_commitment": form_model.long_term_commitment,
        # III. Pet Preferences
        "preferred_species": form_model.preferred_species,
        "preferred_gender": form_model.preferred_gender,
        "preferred_energy": form_model.preferred_energy,
        # IV. Logistics and Education
        "daily_time_dedication": form_model.daily_time_dedication,
        "sleeping_location": form_model.sleeping_location,
        "sleeping_location_other": form_model.sleeping_location_other,
        "behavior_approach": form_model.behavior_approach,
        "behavior_approach_other": form_model.behavior_approach_other,
        "emergency_plan": form_model.emergency_plan,
        "emergency_plan_other": form_model.emergency_plan_other,
        # V. Final Motivation
        "motivation": form_model.motivation,
        # Metadata
        "submission_date": form_model.submission_date,
        "last_updated": form_model.last_updated,
        # Review fields
        "status": form_model.status,
        "reviewed_by": form_model.reviewed_by,
        "reviewed_at": form_model.reviewed_at,
    }

    # Insert into MongoDB
    try:
        forms_collection = db["adoption_forms"]
        await forms_collection.insert_one(form_document)
        logger.info(f"Adoption form registered successfully with ID: {form_id}")
    except Exception as e:
        logger.error(f"Failed to insert adoption form into MongoDB: {str(e)}")
        raise ValueError("Failed to register adoption form in database")

    return {
        "form_id": form_id,
        "submission_date": form_document["submission_date"],
    }


async def get_adoption_form_by_user(db, user_id: int) -> Optional[Dict[str, Any]]:
    # Get adoption form by user ID
    logger.info(f"Retrieving adoption form for user_id: {user_id}")

    try:
        forms_collection = db["adoption_forms"]
        form = await forms_collection.find_one({"user_id": user_id})

        if not form:
            logger.warning(f"No adoption form found for user_id: {user_id}")
            return None

        logger.info(f"Adoption form retrieved successfully for user_id: {user_id}")

        form_id = form.get("_id")
        if form_id:
            form["form_id"] = form_id

        # Remove MongoDB _id, reviewed_by, reviewed_at, status from response
        form.pop("_id", None)
        form.pop("reviewed_by", None)
        form.pop("reviewed_at", None)
        form.pop("status", None)

        # Embed related applications
        applications_collection = db["applications"]
        if form_id:
            applications = await applications_collection.find(
                {"form_id": form_id}
            ).to_list(length=None)
            form["applications"] = [
                {
                    "application_id": app.get("_id"),
                    "pet_profile_id": app.get("pet_profile_id"),
                    "adopter_name": app.get("adopter_name"),
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
                    "needs_manual_review": app.get("needs_manual_review", False),
                    "reviewed_by": app.get("reviewed_by"),
                    "reviewed_at": app.get("reviewed_at"),
                }
                for app in applications
            ]
        else:
            form["applications"] = []

        return form
    except Exception as e:
        logger.error(f"Failed to retrieve adoption form: {str(e)}")
        raise ValueError("Failed to retrieve adoption form")


async def update_adoption_form(
    db, user_id: int, update_data: Dict[str, Any]
) -> Dict[str, Any]:
    # Update existing adoption form
    logger.info(f"Updating adoption form for user_id: {user_id}")

    # Check if form exists
    try:
        forms_collection = db["adoption_forms"]
        existing_form = await forms_collection.find_one({"user_id": user_id})

        if not existing_form:
            logger.warning(f"No adoption form found for user_id: {user_id}")
            raise ValueError("No adoption form found for this user")
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Failed to check existing form: {str(e)}")
        raise ValueError("Failed to check existing form")

    # Prepare update data (only include non-None values)
    update_fields = {}

    # I. Candidate Information
    if "neighborhood" in update_data and update_data["neighborhood"] is not None:
        update_fields["neighborhood"] = update_data["neighborhood"]
    if "address" in update_data and update_data["address"] is not None:
        update_fields["address"] = update_data["address"]
    if (
        "employment_status" in update_data
        and update_data["employment_status"] is not None
    ):
        update_fields["employment_status"] = update_data["employment_status"]
    if (
        "employment_status_other" in update_data
        and update_data["employment_status_other"] is not None
    ):
        update_fields["employment_status_other"] = update_data[
            "employment_status_other"
        ]
    if "housing_type" in update_data and update_data["housing_type"] is not None:
        update_fields["housing_type"] = update_data["housing_type"]
    if (
        "housing_type_other" in update_data
        and update_data["housing_type_other"] is not None
    ):
        update_fields["housing_type_other"] = update_data["housing_type_other"]
    if (
        "has_natural_space" in update_data
        and update_data["has_natural_space"] is not None
    ):
        update_fields["has_natural_space"] = update_data["has_natural_space"]

    # II. Coexistence and Experience
    if "has_pets" in update_data and update_data["has_pets"] is not None:
        update_fields["has_pets"] = update_data["has_pets"]
    if (
        "current_pets_details" in update_data
        and update_data["current_pets_details"] is not None
    ):
        update_fields["current_pets_details"] = update_data["current_pets_details"]
    if (
        "household_energy" in update_data
        and update_data["household_energy"] is not None
    ):
        update_fields["household_energy"] = update_data["household_energy"]
    if "has_children" in update_data and update_data["has_children"] is not None:
        update_fields["has_children"] = update_data["has_children"]
    if "children_ages" in update_data and update_data["children_ages"] is not None:
        update_fields["children_ages"] = update_data["children_ages"]
    if (
        "long_term_commitment" in update_data
        and update_data["long_term_commitment"] is not None
    ):
        update_fields["long_term_commitment"] = update_data["long_term_commitment"]

    # III. Pet Preferences
    if (
        "preferred_species" in update_data
        and update_data["preferred_species"] is not None
    ):
        update_fields["preferred_species"] = update_data["preferred_species"]
    if (
        "preferred_gender" in update_data
        and update_data["preferred_gender"] is not None
    ):
        update_fields["preferred_gender"] = update_data["preferred_gender"]
    if (
        "preferred_energy" in update_data
        and update_data["preferred_energy"] is not None
    ):
        update_fields["preferred_energy"] = update_data["preferred_energy"]

    # IV. Logistics and Education
    if (
        "daily_time_dedication" in update_data
        and update_data["daily_time_dedication"] is not None
    ):
        update_fields["daily_time_dedication"] = update_data["daily_time_dedication"]
    if (
        "sleeping_location" in update_data
        and update_data["sleeping_location"] is not None
    ):
        update_fields["sleeping_location"] = update_data["sleeping_location"]
    if (
        "sleeping_location_other" in update_data
        and update_data["sleeping_location_other"] is not None
    ):
        update_fields["sleeping_location_other"] = update_data[
            "sleeping_location_other"
        ]
    if (
        "behavior_approach" in update_data
        and update_data["behavior_approach"] is not None
    ):
        update_fields["behavior_approach"] = update_data["behavior_approach"]
    if (
        "behavior_approach_other" in update_data
        and update_data["behavior_approach_other"] is not None
    ):
        update_fields["behavior_approach_other"] = update_data[
            "behavior_approach_other"
        ]
    if "emergency_plan" in update_data and update_data["emergency_plan"] is not None:
        update_fields["emergency_plan"] = update_data["emergency_plan"]
    if (
        "emergency_plan_other" in update_data
        and update_data["emergency_plan_other"] is not None
    ):
        update_fields["emergency_plan_other"] = update_data["emergency_plan_other"]

    # V. Final Motivation
    if "motivation" in update_data and update_data["motivation"] is not None:
        update_fields["motivation"] = update_data["motivation"]

    # Add last_updated timestamp
    from datetime import datetime

    update_fields["last_updated"] = datetime.now()

    if not update_fields:
        logger.warning(f"No valid fields to update for user_id: {user_id}")
        raise ValueError("No valid fields to update")

    # Update in MongoDB
    try:
        await forms_collection.update_one({"user_id": user_id}, {"$set": update_fields})
        logger.info(f"Adoption form updated successfully for user_id: {user_id}")
    except Exception as e:
        logger.error(f"Failed to update adoption form: {str(e)}")
        raise ValueError("Failed to update adoption form")

    # Return updated form
    updated_form = await get_adoption_form_by_user(db, user_id)
    if updated_form is None:
        raise ValueError("Failed to retrieve updated form")
    return updated_form


async def get_all_forms(
    db, status_filter: Optional[str] = None, pet_name_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    # Get all adoption forms with optional status and pet name filters (admin only)
    # Returns each form with its review status and the qualification
    # (AI scores) of its linked applications embedded.
    logger.info(
        f"Retrieving all adoption forms with status filter: {status_filter}, "
        f"pet_name filter: {pet_name_filter}"
    )

    try:
        forms_collection = db["adoption_forms"]
        applications_collection = db["applications"]
        pet_profiles_collection = db["pet_profiles"]

        # Note: `status` filters the embedded applications (each application
        # has its own status: approved/pending/rejected), not the form's
        # status. We fetch all forms and narrow them by application status
        # further below so both `?status=approved` and `?status=pending`
        # return the matching applications grouped under their form.
        query: Dict[str, Any] = {}

        # Retrieve forms
        cursor = forms_collection.find(query)
        forms = await cursor.to_list(length=None)

        # No forms -> return empty list (standard for list endpoints)
        if not forms:
            logger.info("No adoption forms found")
            return []

        result = []
        for form in forms:
            form_id = form.get("_id")

            # Find applications for this form (there could be multiple)
            applications = await applications_collection.find(
                {"form_id": form_id}
            ).to_list(length=None)

            # Embed qualification info from each linked application
            embedded_applications = []
            for app in applications:
                pet_profile_id = app.get("pet_profile_id")
                pet_name = None
                if pet_profile_id is not None:
                    pet_profile = await pet_profiles_collection.find_one(
                        {"_id": pet_profile_id}
                    )
                    if pet_profile:
                        pet_name = (pet_profile.get("pet") or {}).get("name")

                embedded_applications.append(
                    {
                        "application_id": app.get("_id"),
                        "pet_profile_id": pet_profile_id,
                        "pet_name": pet_name,
                        "adopter_name": app.get("adopter_name"),
                        "total_score": app.get("total_score"),
                        "total_max_score": app.get("total_max_score"),
                        "main_score": app.get("main_score"),
                        "main_max_score": app.get("main_max_score"),
                        "logistics_education_score": app.get(
                            "logistics_education_score"
                        ),
                        "logistics_education_max_score": app.get(
                            "logistics_education_max_score"
                        ),
                        "ai_breakdown": app.get("ai_breakdown"),
                        "ai_justification": app.get("ai_justification"),
                        "status": app.get("status"),
                        "created_at": app.get("created_at"),
                        "needs_manual_review": app.get("needs_manual_review", False),
                        "reviewed_by": app.get("reviewed_by"),
                        "reviewed_at": app.get("reviewed_at"),
                    }
                )

            # If a status filter is provided, keep only the applications
            # whose status matches exactly (case-insensitive). This mirrors
            # the pet_name behaviour: the form is dropped if none match.
            if status_filter:
                needle = status_filter.lower()
                matching_applications = [
                    app
                    for app in embedded_applications
                    if app.get("status") and app["status"].lower() == needle
                ]
                # Drop the whole form if none of its applications match
                if not matching_applications:
                    continue
                embedded_applications = matching_applications

            # If a pet name filter is provided, keep only the applications
            # whose pet name matches (contains, case-insensitive)
            if pet_name_filter:
                needle = pet_name_filter.lower()
                matching_applications = [
                    app
                    for app in embedded_applications
                    if app.get("pet_name") and needle in app["pet_name"].lower()
                ]
                # Drop the whole form if none of its applications match
                if not matching_applications:
                    continue
                embedded_applications = matching_applications

            # Build the form response (remove Mongo _id, reviewed_by, reviewed_at, status) and embed applications
            form_response = {
                k: v
                for k, v in form.items()
                if k not in ("_id", "reviewed_by", "reviewed_at", "status")
            }
            form_response["applications"] = embedded_applications
            result.append(form_response)

        logger.info(f"Retrieved {len(result)} adoption forms")
        return result
    except Exception as e:
        logger.error(f"Failed to retrieve adoption forms: {str(e)}")
        raise ValueError("Failed to retrieve adoption forms")
