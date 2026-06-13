# Backblaze B2 service for image upload
import uuid
from typing import Optional
from b2sdk.v1 import (
    InMemoryAccountInfo,
    B2Api,
)
from app.config import settings


# Initialize B2 API
def get_b2_api():
    # Get B2 API instance
    try:
        info = InMemoryAccountInfo()
        b2_api = B2Api(info)

        # Authorize with Backblaze credentials
        b2_api.authorize_account(
            "production",
            settings.BACKBLAZE_KEY_ID,
            settings.BACKBLAZE_APPLICATION_KEY,
        )

        return b2_api

    except Exception:
        # Raise exception if authorization fails
        raise Exception("Failed to authorize with Backblaze")


def bucket_exists() -> bool:
    # Check if the Backblaze bucket exists
    try:
        # Get B2 API instance
        b2_api = get_b2_api()

        # Try to get the bucket
        b2_api.get_bucket_by_name(settings.BACKBLAZE_BUCKET_NAME)

        # If bucket is found, return True
        return True

    except Exception:
        # If bucket not found or error, return False
        return False


def upload_image_to_backblaze(file_data: bytes, file_name: Optional[str] = None) -> str:
    # Upload image to Backblaze B2 and return the public URL
    try:
        # Get B2 API instance
        b2_api = get_b2_api()

        # Get the bucket
        bucket = b2_api.get_bucket_by_name(settings.BACKBLAZE_BUCKET_NAME)

        # Generate unique filename using UUID
        file_name = f"{uuid.uuid4()}.jpg"

        # Upload the file
        bucket.upload_bytes(
            file_data,
            file_name,
        )

        # Get the download URL from Backblaze
        # This returns the correct public URL format
        public_url = b2_api.get_download_url_for_file_name(
            settings.BACKBLAZE_BUCKET_NAME, file_name
        )

        return public_url

    except Exception:
        # Raise exception if upload fails
        raise Exception("Failed to upload image to Backblaze")
