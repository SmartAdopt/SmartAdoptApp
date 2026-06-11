# Admin routes
# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, status

# JWT utilities
from app.utils.jwt.jwt_utils import verify_token

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
    # Verify role
    user_role = token_payload.get("role", "").lower()
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin role required",
        )

    try:
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

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
