from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Required variables from environment with defaults
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "smartadopt"

    model_config = SettingsConfigDict(env_file=".env")

    @property
    def DATABASE_URL(self) -> str:
        # Dynamically builds the connection URL.
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


# Instance for global use in the application
settings = Settings()
