import redis

from app.config import settings

# Logger import

from app.utils.logger.logger_config import logger

# Global redis client variable (lazy initialization)

_redis_client = None


def get_redis_client():

    # Get or create the Redis client (lazy initialization)

    global _redis_client

    if _redis_client is None:

        logger.info(
            f"Creating Redis client for host: {settings.REDIS_HOST}:{settings.REDIS_PORT}, db: {settings.REDIS_DB}"
        )

        _redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
            decode_responses=True,
        )

        logger.info("Redis client created successfully")

    return _redis_client


# Dependency to inject redis into endpoints


def get_redis():
    logger.debug("Providing Redis client")
    redis_client = get_redis_client()

    try:
        yield redis_client
    finally:
        pass
