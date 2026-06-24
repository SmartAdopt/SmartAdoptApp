from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Logger import
from app.utils.logger.logger_config import logger

# Global MongoDB client variable (lazy initialization)
_client = None


def get_client():
    # Get or create the MongoDB client (lazy initialization)
    global _client
    if _client is None:
        logger.info(
            f"Creating MongoDB client for database: {settings.MONGO_DB} at {settings.MONGO_HOST}:{settings.MONGO_PORT}"
        )
        # Build MongoDB connection string
        if settings.MONGO_USER and settings.MONGO_PASSWORD:
            # With authentication
            connection_string = (
                f"mongodb://{settings.MONGO_USER}:{settings.MONGO_PASSWORD}@"
                f"{settings.MONGO_HOST}:{settings.MONGO_PORT}/{settings.MONGO_DB}"
            )
        else:
            # Without authentication
            connection_string = f"mongodb://{settings.MONGO_HOST}:{settings.MONGO_PORT}/{settings.MONGO_DB}"

        _client = AsyncIOMotorClient(connection_string)
        logger.info("MongoDB client created successfully")
    return _client


# Dependency to inject the database into your endpoints
async def get_mongo_db():
    logger.debug("Creating MongoDB database connection")
    client = get_client()
    db = client[settings.MONGO_DB]
    try:
        yield db
    finally:
        logger.debug("MongoDB database connection closed")
