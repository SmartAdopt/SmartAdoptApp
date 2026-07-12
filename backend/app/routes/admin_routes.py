# Admin routes
# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, status

# Database imports
from app.database.mongo.mongo_db import get_mongo_db

# JWT utilities
from app.utils.jwt.jwt_utils import verify_token

# Logger import
from app.utils.logger.logger_config import logger

# Create router with prefix and tags
router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get(
    "/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Admin Dashboard",
    description="Get admin dashboard data (requires admin role)",
)
async def admin_dashboard(
    token_payload: dict = Depends(verify_token),
    mongo_db=Depends(get_mongo_db),
):
    # Endpoint for admin dashboard - protected by JWT and role-based authorization
    # Only users with role="admin" can access this endpoint
    logger.info(f"GET /admin/dashboard - Request from user: {token_payload.get('sub')}")
    # Verify role
    user_role = token_payload.get("role", "").lower()
    if user_role != "admin":
        logger.warning(
            f"Access denied for user: {token_payload.get('sub')} - role: {user_role}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Admin role required"},
        )

    try:
        pet_collection = mongo_db["pet_profiles"]
        app_collection = mongo_db["applications"]

        total_pets = await pet_collection.count_documents({})
        available_pets = await pet_collection.count_documents({"status": "available"})
        in_process_pets = await pet_collection.count_documents({"status": "in_process"})
        adopted_pets = await pet_collection.count_documents({"status": "adopted"})

        total_applications = await app_collection.count_documents({})
        pending_applications = await app_collection.count_documents(
            {"status": "pending"}
        )
        approved_applications = await app_collection.count_documents(
            {"status": "approved"}
        )
        rejected_applications = await app_collection.count_documents(
            {"status": "rejected"}
        )

        logger.info(
            f"Admin dashboard accessed successfully by user: {token_payload.get('sub')}"
        )
        return {
            "message": "Welcome to Admin Dashboard",
            "user_id": token_payload.get("sub"),
            "user_role": token_payload.get("role"),
            "dashboard_data": {
                "total_pets": total_pets,
                "available_pets": available_pets,
                "in_process_pets": in_process_pets,
                "adopted_pets": adopted_pets,
                "total_applications": total_applications,
                "pending_applications": pending_applications,
                "approved_applications": approved_applications,
                "rejected_applications": rejected_applications,
            },
        }

    except Exception as e:
        logger.error(
            f"Admin dashboard error for user: {token_payload.get('sub')}, error: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )
