from fastapi import APIRouter, Depends, HTTPException, status

# Database imports
from app.database.mongo.mongo_db import get_mongo_db

# Schema imports
from app.schemas.adoption_form_schemas import AdoptionFormRequest, AdoptionFormResponse, AdoptionFormUpdateRequest

# Service imports
from app.services.adoption_form_service import register_adoption_form, get_adoption_form_by_user, update_adoption_form

# JWT utils import
from app.utils.jwt.jwt_utils import verify_token

# Logger import
from app.utils.logger.logger_config import logger

router = APIRouter(prefix="/adoption-forms", tags=["Adoption Forms"])


@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_adoption_form_route(
    form_data: AdoptionFormRequest,
    db=Depends(get_mongo_db),
    token_payload: dict = Depends(verify_token),
):
    # Endpoint to submit an adoption form (requires adopter role)
    logger.info(
        f"POST /adoption-forms/submit - Adoption form submission request"
    )

    # Verify user role is adopter
    user_role = token_payload.get("role", "").lower()
    if user_role != "adopter":
        logger.warning(
            f"Adoption form submission denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Adopter role required"},
        )

    try:
        # Get user_id from token
        user_id = token_payload.get("sub")
        # Convert Pydantic schema to dict before calling service
        form_data_dict = form_data.model_dump()
        # Add user_id from token to form data
        form_data_dict["user_id"] = user_id
        # Call service to register the adoption form
        registered_form = await register_adoption_form(db, form_data_dict)
        # Return response
        return AdoptionFormResponse(
            message="Adoption form registered successfully",
            form_id=registered_form["form_id"],
            submission_date=registered_form["submission_date"],
        )
    except ValueError as e:
        logger.warning(f"Adoption form submission failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": str(e)},
        )
    except Exception as e:
        logger.error(f"Unexpected error during adoption form submission: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


@router.get("/me", status_code=status.HTTP_200_OK)
async def get_my_adoption_form_route(
    db=Depends(get_mongo_db),
    token_payload: dict = Depends(verify_token),
):
    # Endpoint to get the authenticated user's adoption form (requires adopter role)
    logger.info(f"GET /adoption-forms/me - Get adoption form request")

    # Verify user role is adopter
    user_role = token_payload.get("role", "").lower()
    if user_role != "adopter":
        logger.warning(
            f"Adoption form retrieval denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Adopter role required"},
        )

    try:
        # Get user_id from token
        user_id = token_payload.get("sub")
        # Call service to get the adoption form
        form = await get_adoption_form_by_user(db, user_id)
        
        if not form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": "No adoption form found for this user"},
            )
        
        return form
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during adoption form retrieval: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


@router.put("/me", status_code=status.HTTP_200_OK)
async def update_my_adoption_form_route(
    update_data: AdoptionFormUpdateRequest,
    db=Depends(get_mongo_db),
    token_payload: dict = Depends(verify_token),
):
    # Endpoint to update the authenticated user's adoption form (requires adopter role)
    logger.info(f"PUT /adoption-forms/me - Update adoption form request")

    # Verify user role is adopter
    user_role = token_payload.get("role", "").lower()
    if user_role != "adopter":
        logger.warning(
            f"Adoption form update denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Adopter role required"},
        )

    try:
        # Get user_id from token
        user_id = token_payload.get("sub")
        # Convert Pydantic schema to dict before calling service
        update_data_dict = update_data.model_dump()
        # Call service to update the adoption form
        updated_form = await update_adoption_form(db, user_id, update_data_dict)
        
        return {
            "message": "Adoption form updated successfully",
            "form": updated_form,
        }
    except ValueError as e:
        logger.warning(f"Adoption form update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": str(e)},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during adoption form update: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )
