# Redis Cache Integration

In SmartAdoptApp, we use Redis as a high-performance caching layer to reduce the load on our databases (MongoDB and PostgreSQL) and improve response times for read-heavy endpoints.

## Currently Cached Endpoints

### 1. Pets Catalog (`GET /pets/`)
- **Source Database:** MongoDB
- **Usage:** General listing or filtered by status. This is the most heavily consumed endpoint by adopters when browsing the app (main feed).
- **Cache Key:** `cache:pets:list:{status_filter}` (or `cache:pets:list:all` if no filter).
- **Time to Live (TTL):** 5 minutes (300 seconds).
- **Invalidation:** The cache is automatically cleared (`cache:pets:*`) when:
  - An administrator registers a new pet.
  - A pet's profile or status is updated (e.g., changes from 'available' to 'adopted').
  - The descriptive profile is regenerated using Artificial Intelligence.

### 2. Foundation Information (`GET /foundation/`)
- **Source Database:** PostgreSQL
- **Usage:** Contact details and general information about the foundation.
- **Cache Key:** `cache:foundation`
- **Time to Live (TTL):** 1 hour (3600 seconds), as this is mostly static information that rarely changes.
- **Invalidation:** The cache is automatically invalidated when the foundation's information is created or updated from the admin panel.

## Cache Utilities (Architecture)
The cache logic is centralized in `backend/app/utils/cache_utils.py`. This module provides generic utilities (`get_cached_data`, `set_cached_data`, `invalidate_cache`) that leverage FastAPI's `jsonable_encoder` to ensure seamless data conversion (serialization) and prevent errors with dates or MongoDB IDs.
