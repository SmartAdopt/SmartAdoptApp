# Google OAuth Configuration
from authlib.integrations.starlette_client import OAuth
from app.config import settings

# Logger import
from app.utils.logger.logger_config import logger

# Global OAuth variable (lazy initialization)
_oauth = None


def get_google_oauth():
    # Get or create the Google OAuth instance (lazy initialization)
    global _oauth
    if _oauth is None:
        logger.info("Initializing Google OAuth")
        _oauth = OAuth()
        _oauth.register(
            name="google",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )
        logger.info("Google OAuth registered successfully")
    logger.debug("Providing Google OAuth instance")
    return _oauth
