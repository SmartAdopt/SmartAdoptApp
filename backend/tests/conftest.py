import pytest
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from dotenv import load_dotenv

# Load environment variables from .env file FIRST
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

# Set environment variables for CI/CD if not already set
# This ensures tests work in CI/CD without .env file
if not os.getenv("SECRET_KEY"):
    os.environ["SECRET_KEY"] = "test_secret_key_for_ci_cd"
if not os.getenv("POSTGRES_HOST"):
    os.environ["POSTGRES_HOST"] = "localhost"
if not os.getenv("POSTGRES_PORT"):
    os.environ["POSTGRES_PORT"] = "5432"
if not os.getenv("POSTGRES_DB"):
    os.environ["POSTGRES_DB"] = "test_db"
if not os.getenv("POSTGRES_USER"):
    os.environ["POSTGRES_USER"] = "test_user"
if not os.getenv("POSTGRES_PASSWORD"):
    os.environ["POSTGRES_PASSWORD"] = "test_password"
if not os.getenv("POSTGRES_HOST_PORT"):
    os.environ["POSTGRES_HOST_PORT"] = "5432"
if not os.getenv("ALGORITHM"):
    os.environ["ALGORITHM"] = "HS256"
if not os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"):
    os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "10"
if not os.getenv("GOOGLE_CLIENT_ID"):
    os.environ["GOOGLE_CLIENT_ID"] = "test_client_id"
if not os.getenv("GOOGLE_CLIENT_SECRET"):
    os.environ["GOOGLE_CLIENT_SECRET"] = "test_client_secret"
if not os.getenv("REDIS_HOST"):
    os.environ["REDIS_HOST"] = "localhost"
if not os.getenv("REDIS_PORT"):
    os.environ["REDIS_PORT"] = "6379"
if not os.getenv("REDIS_DB"):
    os.environ["REDIS_DB"] = "0"
if not os.getenv("REDIS_PASSWORD"):
    os.environ["REDIS_PASSWORD"] = ""
if not os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"):
    os.environ["REFRESH_TOKEN_EXPIRE_DAYS"] = "7"
if not os.getenv("BACKBLAZE_KEY_ID"):
    os.environ["BACKBLAZE_KEY_ID"] = "test_key_id"
if not os.getenv("BACKBLAZE_APPLICATION_KEY"):
    os.environ["BACKBLAZE_APPLICATION_KEY"] = "test_application_key"
if not os.getenv("BACKBLAZE_BUCKET_NAME"):
    os.environ["BACKBLAZE_BUCKET_NAME"] = "test-bucket"

# Import the FastAPI app and the database components AFTER loading .env
# ruff: noqa: E402
from app.main import app
from app.database.postgres.postgres_db import Base, get_db
from unittest.mock import patch

# Import models to ensure they are registered with Base before creating tables

# Setup SQLite in-memory database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Create the engine for SQLite
# check_same_thread=False is needed for SQLite to work across different threads in FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a sessionmaker specifically for tests
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # This fixture creates all the database tables before running any tests
    # and drops them after all tests have finished
    # The scope is "session" meaning it runs once for the entire test suite
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop all tables after tests are done
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    # This fixture provides a fresh database session for each test function
    # It yields the session and then closes it after the test finishes
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client(db_session):
    # This fixture creates a TestClient for FastAPI, allowing us to make HTTP requests
    # in our tests without starting a real server
    # It also overrides the `get_db` dependency so that the endpoints use our test database

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    # Mock Redis client for testing with in-memory storage
    class MockRedis:
        def __init__(self):
            self.storage = {}
            self.blacklist = set()

        def setex(self, key, ttl, value):
            self.storage[key] = value

        def get(self, key):
            return self.storage.get(key)

        def delete(self, key):
            if key in self.storage:
                del self.storage[key]
            if key in self.blacklist:
                self.blacklist.remove(key)

        def exists(self, key):
            return 1 if key in self.storage or key in self.blacklist else 0

    mock_redis = MockRedis()

    # Override the dependency globally in the app
    app.dependency_overrides[get_db] = override_get_db

    # Mock redis client in multiple locations
    with patch("app.database.redis.redis_client", mock_redis), patch(
        "app.services.auth_service.redis_client", mock_redis
    ), patch("app.utils.jwt.jwt_utils.redis_client", mock_redis):
        # Create the test client
        with TestClient(app) as test_client:
            yield test_client

    # Clear overrides after the test
    app.dependency_overrides.clear()
