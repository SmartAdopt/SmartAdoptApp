import json
from typing import Optional, Any
from app.database.redis.redis_db import get_redis_client
from app.utils.logger.logger_config import logger


def get_cached_data(key: str) -> Optional[Any]:
    """Retrieve and parse JSON data from Redis cache."""
    try:
        redis_client = get_redis_client()
        data = redis_client.get(key)
        if data:
            logger.debug(f"Cache hit for key: {key}")
            return json.loads(data)
        return None
    except Exception as e:
        logger.warning(f"Failed to retrieve cache for key {key}: {str(e)}")
        return None


def set_cached_data(key: str, data: Any, expire_seconds: int = 300) -> bool:
    """Serialize and store data in Redis cache with an expiration."""
    try:
        redis_client = get_redis_client()
        from fastapi.encoders import jsonable_encoder

        json_data = json.dumps(jsonable_encoder(data))
        redis_client.setex(key, expire_seconds, json_data)
        logger.debug(f"Cache set for key: {key} (expires in {expire_seconds}s)")
        return True
    except Exception as e:
        logger.warning(f"Failed to set cache for key {key}: {str(e)}")
        return False


def invalidate_cache(pattern: str) -> bool:
    """Invalidate all cache keys matching the pattern."""
    try:
        redis_client = get_redis_client()
        keys_deleted = 0
        for key in redis_client.scan_iter(match=pattern):
            redis_client.delete(key)
            keys_deleted += 1
        logger.info(
            f"Invalidated {keys_deleted} cache keys matching pattern: {pattern}"
        )
        return True
    except Exception as e:
        logger.warning(f"Failed to invalidate cache for pattern {pattern}: {str(e)}")
        return False
