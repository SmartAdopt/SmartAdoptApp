from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get the path to the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class OAuthSettings(BaseSettings):
    # Required variables from environment
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env")


# Instance for global use in the application
oauth_settings = OAuthSettings()  # type: ignore
