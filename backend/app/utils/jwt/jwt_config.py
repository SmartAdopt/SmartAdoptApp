from pydantic_settings import BaseSettings


class JWTSettings(BaseSettings):
    # Required variables from environment
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int


# Instance for global use in the application
jwt_settings = JWTSettings()
