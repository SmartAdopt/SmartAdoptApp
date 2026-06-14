# Backblaze B2 Image Upload

This document describes the implementation of Backblaze B2 cloud storage for image upload in the SmartAdopt application.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Service Layer](#service-layer)
- [Security](#security)
- [Error Handling](#error-handling)

## Overview

The SmartAdopt application uses Backblaze B2 cloud storage for uploading and storing images. This implementation provides:

- Secure image upload with admin-only access
- UUID-based unique filenames
- Automatic URL generation for public access
- Bucket existence validation
- Comprehensive error handling

## Configuration

### Environment Variables

The following environment variables must be configured in the `.env` file:

```env
# Backblaze B2
BACKBLAZE_KEY_ID=your_backblaze_key_id
BACKBLAZE_APPLICATION_KEY=your_backblaze_application_key
BACKBLAZE_BUCKET_NAME=your_backblaze_bucket_name
```

### Configuration in `config.py`

```python
# Backblaze B2 variables
BACKBLAZE_KEY_ID: str
BACKBLAZE_APPLICATION_KEY: str
BACKBLAZE_BUCKET_NAME: str
```

### Dependencies

Add `b2sdk` to `requirements.txt`:

```
b2sdk
```

## Architecture

### File Structure

```
backend/
├── app/
│   ├── routes/
│   │   └── backblaze_routes.py    # API endpoints
│   ├── services/
│   │   └── backblaze_service.py   # Business logic
│   ├── schemas/
│   │   └── backblaze_schemas.py   # Pydantic schemas
│   └── config.py                   # Configuration
```

### Components

1. **Routes Layer** (`backblaze_routes.py`)
   - FastAPI endpoints for image upload
   - JWT authentication and role verification
   - Request validation

2. **Service Layer** (`backblaze_service.py`)
   - Backblaze B2 API integration
   - Bucket existence checking
   - Image upload and URL generation

3. **Schemas Layer** (`backblaze_schemas.py`)
   - Pydantic models for request/response validation

## API Endpoints

### POST /backblaze/upload

Upload an image to Backblaze B2 cloud storage.

**Authentication:** Required (JWT token)
**Authorization:** Admin role required

**Request**
```http
POST /backblaze/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <image_file>
```

**Response (201 Created)**
```json
{
  "image_url": "https://f002.backblazeb2.com/file/SmartAdopt-Develop/uuid.jpg",
  "message": "Image uploaded successfully"
}
```

**Error Responses**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User role is not "admin"
- `400 Bad Request`: File is not an image
- `503 Service Unavailable`: Backblaze bucket not found or not accessible
- `500 Internal Server Error`: Upload failed

## Service Layer

### Functions

#### `get_b2_api()`

Initializes and authorizes the Backblaze B2 API client.

```python
def get_b2_api():
    try:
        info = InMemoryAccountInfo()
        b2_api = B2Api(info)
        b2_api.authorize_account(
            "production",
            settings.BACKBLAZE_KEY_ID,
            settings.BACKBLAZE_APPLICATION_KEY,
        )
        return b2_api
    except Exception:
        raise Exception("Failed to authorize with Backblaze")
```

#### `bucket_exists()`

Checks if the configured Backblaze bucket exists and is accessible.

```python
def bucket_exists() -> bool:
    try:
        b2_api = get_b2_api()
        bucket = b2_api.get_bucket_by_name(settings.BACKBLAZE_BUCKET_NAME)
        return True
    except Exception:
        return False
```

#### `upload_image_to_backblaze(file_data, file_name)`

Uploads an image to Backblaze B2 and returns the public URL.

```python
def upload_image_to_backblaze(file_data: bytes, file_name: Optional[str] = None) -> str:
    try:
        b2_api = get_b2_api()
        bucket = b2_api.get_bucket_by_name(settings.BACKBLAZE_BUCKET_NAME)
        file_name = f"{uuid.uuid4()}.jpg"
        uploaded_file = bucket.upload_bytes(file_data, file_name)
        public_url = b2_api.get_download_url_for_file_name(
            settings.BACKBLAZE_BUCKET_NAME,
            file_name
        )
        return public_url
    except Exception:
        raise Exception("Failed to upload image to Backblaze")
```

## Security

### Authentication & Authorization

1. **JWT Authentication**: All requests require a valid JWT token
2. **Role-Based Access**: Only users with "admin" role can upload images
3. **Token Verification**: Uses `verify_token` dependency for authentication

### File Validation

1. **Content Type Check**: Only image files are accepted (`image/*`)
2. **UUID Filenames**: Unique filenames prevent overwriting and conflicts

### Bucket Security

1. **Bucket Existence Check**: Validates bucket accessibility before upload
2. **Credential Management**: Backblaze credentials stored in environment variables

## Error Handling

### Service Layer Errors

- **Authorization Failure**: Raised when Backblaze credentials are invalid
- **Bucket Not Found**: Returns `False` from `bucket_exists()`
- **Upload Failure**: Raises exception with descriptive message

### Route Layer Errors

- **401 Unauthorized**: Missing, invalid, or expired token
- **403 Forbidden**: User lacks admin role
- **400 Bad Request**: Invalid file type
- **503 Service Unavailable**: Bucket not accessible
- **500 Internal Server Error**: Unexpected errors

## Best Practices

1. **Credential Security**: Never commit Backblaze credentials to version control
2. **Bucket Configuration**: Ensure bucket is configured for public access if needed
3. **File Size Limits**: Consider implementing file size limits for uploads
4. **Error Logging**: Implement logging for debugging upload failures
5. **Monitoring**: Monitor Backblaze API usage and costs

## Testing

To test the image upload endpoint:

```bash
# Login as admin to get JWT token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin1234"}'

# Upload image using the token
curl -X POST http://localhost:8000/backblaze/upload \
  -H "Authorization: Bearer <jwt_token>" \
  -F "file=@/path/to/image.jpg"
```

## Troubleshooting

### Common Issues

1. **Authorization Failed**
   - Check `BACKBLAZE_KEY_ID` and `BACKBLAZE_APPLICATION_KEY` in `.env`
   - Verify credentials have correct permissions

2. **Bucket Not Found**
   - Verify `BACKBLAZE_BUCKET_NAME` is correct
   - Check if bucket exists in Backblaze console

3. **Upload Failed**
   - Check file size limits
   - Verify bucket has sufficient space
   - Check Backblaze API status

4. **403 Forbidden**
   - Verify user has "admin" role
   - Check JWT token is valid and not expired

## License

This project is part of SmartAdopt.
