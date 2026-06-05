from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get the path to the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent


class Settings(BaseSettings):
    # Required variables from .env file
    POSTGRES_USER: str = ""
    POSTGRES_PASSWORD: str = ""
    POSTGRES_HOST: str = ""
    POSTGRES_PORT: int = 0
    POSTGRES_DB: str = ""

    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env")

    @property
    def DATABASE_URL(self) -> str:
        # Dynamically builds the connection URL.
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


# Instance for global use in the application
settings = Settings()
