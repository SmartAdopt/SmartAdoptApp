# Admin routes
# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, status

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
def admin_dashboard(token_payload: dict = Depends(verify_token)):
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
        logger.info(
            f"Admin dashboard accessed successfully by user: {token_payload.get('sub')}"
        )
        # Return admin dashboard data
        return {
            "message": "Welcome to Admin Dashboard",
            "user_email": token_payload.get("sub"),
            "user_role": token_payload.get("role"),
            "dashboard_data": {
                "total_adoptions": 75,
                "pending_requests": 12,
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
