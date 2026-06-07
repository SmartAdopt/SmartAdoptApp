from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get the path to the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class JWTSettings(BaseSettings):
    # Required variables from .env file
    SECRET_KEY: str = ""
    ALGORITHM: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 0

    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env")


# Instance for global use in the application
jwt_settings = JWTSettings()
