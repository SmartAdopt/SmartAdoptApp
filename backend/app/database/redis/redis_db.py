import redis
from app.config import settings

# Create the redis client
# Host, port, db and password are taken from the config settings
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
    decode_responses=True,
)


# Dependency to inject redis into endpoints
def get_redis():
    try:
        yield redis_client
    finally:
        pass
