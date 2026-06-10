from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get the path to the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Use .env file if it exists, otherwise use os.environ
env_file = BASE_DIR / ".env"
env_file_exists = env_file.exists()


class Settings(BaseSettings):
    # App variables
    SECRET_KEY: str

    # PostgreSQL variables
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST_PORT: int

    # JWT variables
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # Google OAuth variables
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    # Use .env if it exists (local), otherwise use os.environ (CI/CD)
    model_config = SettingsConfigDict(
        env_file=env_file if env_file_exists else None,
        env_file_encoding="utf-8",
    )


# Instance for global use in the application
settings = Settings()  # type: ignore

