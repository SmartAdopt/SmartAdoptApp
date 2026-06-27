# Backblaze B2 service for image upload
import uuid
from typing import Optional
from b2sdk.v1 import (  # type: ignore
    InMemoryAccountInfo,
    B2Api,
)
from app.config import settings

# Logger import
from app.utils.logger.logger_config import logger


# Initialize B2 API
def get_b2_api():
    # Get B2 API instance
    logger.debug("Initializing Backblaze B2 API")
    try:
        info = InMemoryAccountInfo()
        b2_api = B2Api(info)

        # Authorize with Backblaze credentials
        b2_api.authorize_account(
            "production",
            settings.BACKBLAZE_KEY_ID,
            settings.BACKBLAZE_APPLICATION_KEY,
        )

        logger.info("Backblaze B2 API authorized successfully")
        return b2_api

    except Exception as e:
        logger.error(f"Failed to authorize with Backblaze: {str(e)}")
        # Raise exception if authorization fails
        raise Exception("Failed to authorize with Backblaze")


def bucket_exists() -> bool:
    # Check if the Backblaze bucket exists
    logger.debug(
        f"Checking if Backblaze bucket exists: {settings.BACKBLAZE_BUCKET_NAME}"
    )
    try:
        # Get B2 API instance
        b2_api = get_b2_api()

        # Try to get the bucket
        b2_api.get_bucket_by_name(settings.BACKBLAZE_BUCKET_NAME)

        # If bucket is found, return True
        logger.info(f"Backblaze bucket found: {settings.BACKBLAZE_BUCKET_NAME}")
        return True

    except Exception as e:
        # If bucket not found or error, return False
        logger.warning(f"Backblaze bucket not found or error: {str(e)}")
        return False


def upload_image_to_backblaze(file_data: bytes, file_name: Optional[str] = None) -> str:
    # Upload image to Backblaze B2 and return the public URL
    # Note: file_name parameter is ignored for security - UUID is always generated
    logger.info(f"Uploading image to Backblaze (original name: {file_name})")
    try:
        # Get B2 API instance
        b2_api = get_b2_api()

        # Get the bucket
        bucket = b2_api.get_bucket_by_name(settings.BACKBLAZE_BUCKET_NAME)

        # Generate unique filename using UUID for security and uniqueness
        unique_filename = f"{uuid.uuid4()}.jpg"

        # Upload the file
        bucket.upload_bytes(
            file_data,
            unique_filename,
        )

        # Get the download URL from Backblaze
        # This returns the correct public URL format
        public_url = b2_api.get_download_url_for_file_name(
            settings.BACKBLAZE_BUCKET_NAME, unique_filename
        )

        logger.info(
            f"Image uploaded successfully to Backblaze: {unique_filename} -> {public_url}"
        )
        return public_url

    except Exception as e:
        logger.error(f"Failed to upload image to Backblaze: {str(e)}")
        # Raise exception if upload fails
        raise Exception("Failed to upload image to Backblaze")


def get_image_url(file_name: str) -> str:
    # Get public URL for an existing file in Backblaze B2
    logger.info(f"Getting public URL for file: {file_name}")
    try:
        # Get B2 API instance
        b2_api = get_b2_api()

        # Get the download URL from Backblaze
        public_url = b2_api.get_download_url_for_file_name(
            settings.BACKBLAZE_BUCKET_NAME, file_name
        )

        logger.info(f"Public URL retrieved successfully: {public_url}")
        return public_url

    except Exception as e:
        logger.error(f"Failed to get public URL for file: {str(e)}")
        raise Exception("Failed to get public URL for file")
