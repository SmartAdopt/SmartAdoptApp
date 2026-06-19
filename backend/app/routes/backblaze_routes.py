# Backblaze routes for image upload
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    status,
    Depends,
)
from app.schemas.backblaze_schemas import ImageUploadResponse
from app.services.backblaze_service import (
    upload_image_to_backblaze,
    bucket_exists,
)
from app.utils.jwt.jwt_utils import verify_token

# Logger import
from app.utils.logger.logger_config import logger

# Create router with prefix and tags
router = APIRouter(prefix="/backblaze", tags=["Admin"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...), token_payload: dict = Depends(verify_token)
):
    # Upload image to Backblaze B2 and return the public URL
    # Only admin users can upload images
    logger.info(
        f"POST /backblaze/upload - Image upload request from user: {token_payload.get('sub')}"
    )
    try:
        # Verify user role is admin
        user_role = token_payload.get("role", "").lower()
        if user_role != "admin":
            logger.warning(
                f"Image upload denied for user: {token_payload.get('sub')} - role: {user_role}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"message": "Access denied. Admin role required"},
            )

        # Check if bucket exists before uploading
        if not bucket_exists():
            logger.error("Image upload failed - Backblaze bucket not found")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"message": "Backblaze bucket not found or not accessible"},
            )

        # Read file data
        file_data = await file.read()

        # Validate file type (basic validation)
        if not file.content_type or not file.content_type.startswith("image/"):
            logger.warning(
                f"Image upload failed - Invalid file type: {file.content_type}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Only image files are allowed"},
            )

        # Upload to Backblaze
        image_url = upload_image_to_backblaze(file_data, file.filename)
        logger.info(f"Image uploaded successfully: {file.filename} -> {image_url}")

        # Return success response with image URL
        return ImageUploadResponse(
            image_url=image_url,
            message="Image uploaded successfully",
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle other exceptions
        logger.error(f"Image upload failed - error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Failed to upload image"},
        )
