from pydantic_settings import BaseSettings, SettingsConfigDict


class JWTSettings(BaseSettings):
    # Required variables from environment with defaults
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=".env")


# Instance for global use in the application
jwt_settings = JWTSettings()
