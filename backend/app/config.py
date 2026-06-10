from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get the path to the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent


class AppSettings(BaseSettings):
    # Required variables from environment
    SECRET_KEY: str
    ENV: str

    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env")


# Instance for global use in the application
app_settings = AppSettings()  # type: ignore
