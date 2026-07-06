# Backblaze schemas for image upload
from pydantic import BaseModel, Field


class ImageUploadResponse(BaseModel):
    # Schema for image upload response
    image_url: str = Field(
        ..., description="Public URL of the uploaded image"
    )  # Image URL from Backblaze
    message: str = Field(
        ..., description="Upload status message"
    )  # Success/error message
