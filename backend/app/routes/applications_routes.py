# Application routes

# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, status

# Database imports
from app.database.mongo.mongo_db import get_mongo_db

# JWT utilities
from app.utils.jwt.jwt_utils import verify_token

# Schema imports
from app.schemas.applications_schemas import ApplicationResponse

# Service imports
from app.services.applications_service import create_application

# Logger import
from app.utils.logger.logger_config import logger

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post(
    "/{pet_profile_id}",
    status_code=status.HTTP_201_CREATED,
    summary="Create Adoption Application",
    description="Create an adoption application for a specific pet. Validates the user has a completed suitability form and the pet is available.",
)
async def create_application_route(
    pet_profile_id: str,
    token_payload: dict = Depends(verify_token),
    mongo_db=Depends(get_mongo_db),
):
    # Endpoint to create an adoption application for a specific pet
    logger.info(f"POST /applications/{pet_profile_id} - Create application request")

    # Verify user role is adopter
    user_role = token_payload.get("role", "").lower()
    if user_role != "adopter":
        logger.warning(
            f"Application creation denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Adopter role required"},
        )

    try:
        # Get user_id from token
        user_id = int(token_payload["sub"])

        # Call service to create the application
        application = await create_application(mongo_db, user_id, pet_profile_id)

        # Return minimal success response
        return ApplicationResponse(
            message="Adoption application created successfully",
            application_id=application["_id"],
            pet_profile_id=application["pet_profile_id"],
            status=application["status"],
            created_at=application["created_at"],
            needs_manual_review=application.get("needs_manual_review", False),
        )
    except ValueError as e:
        logger.warning(f"Application creation failed: {str(e)}")

        # Determine appropriate status code based on error message
        error_msg = str(e).lower()
        if "not found" in error_msg:
            status_code = status.HTTP_404_NOT_FOUND
        elif "not available" in error_msg:
            status_code = status.HTTP_409_CONFLICT
        elif "already" in error_msg:
            status_code = status.HTTP_409_CONFLICT
        else:
            status_code = status.HTTP_400_BAD_REQUEST

        raise HTTPException(
            status_code=status_code,
            detail={"message": str(e)},
        )
    except Exception as e:
        logger.error(f"Unexpected error during application creation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )
