# Adopter routes
# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, status

# JWT utilities
from app.utils.jwt.jwt_utils import verify_token

# Create router with prefix and tags
router = APIRouter(prefix="/adopter", tags=["Adopter"])


@router.get(
    "/home",
    status_code=status.HTTP_200_OK,
    summary="Adopter Home",
    description="Get adopter home data (requires adopter role)",
)
def adopter_home(token_payload: dict = Depends(verify_token)):
    # Endpoint for adopter home - protected by JWT and role-based authorization
    # Only users with role="adopter" can access this endpoint
    # Verify role
    user_role = token_payload.get("role", "").lower()
    if user_role != "adopter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Adopter role required",
        )

    try:
        # Return adopter home data
        return {
            "message": "Welcome to Adopter Home",
            "user_email": token_payload.get("sub"),
            "user_role": token_payload.get("role"),
            "home_data": {
                "available_pets": 45,
                "my_adoptions": 2,
                "favorite_pets": 8,
            },
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
