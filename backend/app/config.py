from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get the path to the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Use .env file if it exists, otherwise use os.environ
env_file = BASE_DIR / ".env"
env_file_exists = env_file.exists()


class Settings(BaseSettings):
    # App variables
    SECRET_KEY: str  # Secret key for JWT signing

    # PostgreSQL variables
    POSTGRES_HOST: str  # PostgreSQL host address
    POSTGRES_PORT: int  # PostgreSQL port
    POSTGRES_DB: str  # PostgreSQL database name
    POSTGRES_USER: str  # PostgreSQL username
    POSTGRES_PASSWORD: str  # PostgreSQL password
    POSTGRES_HOST_PORT: int  # PostgreSQL external port

    # JWT variables
    ALGORITHM: str  # JWT algorithm (HS256)
    ACCESS_TOKEN_EXPIRE_MINUTES: int  # Access token expiration in minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int  # Refresh token expiration in days

    # Google OAuth variables
    GOOGLE_CLIENT_ID: str  # Google OAuth client ID
    GOOGLE_CLIENT_SECRET: str  # Google OAuth client secret

    # Redis variables
    REDIS_HOST: str  # Redis host address
    REDIS_PORT: int  # Redis port
    REDIS_DB: int  # Redis database number
    REDIS_PASSWORD: str  # Redis password

    # Backblaze B2 variables
    BACKBLAZE_KEY_ID: str  # Backblaze B2 key ID
    BACKBLAZE_APPLICATION_KEY: str  # Backblaze B2 application key
    BACKBLAZE_BUCKET_NAME: str  # Backblaze B2 bucket name

    # Hugging Face variables
    HF_TOKEN: str = ""  # Hugging Face API token

    # MongoDB variables
    MONGO_HOST: str  # MongoDB host address
    MONGO_PORT: int  # MongoDB port
    MONGO_DB: str  # MongoDB database name
    MONGO_USER: str  # MongoDB username
    MONGO_PASSWORD: str  # MongoDB password

    # Use .env if it exists (local), otherwise use os.environ (CI/CD)
    model_config = SettingsConfigDict(
        env_file=env_file if env_file_exists else None,
        env_file_encoding="utf-8",
    )


# Instance for global use in the application
settings = Settings()  # type: ignore
