import pytest
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from dotenv import load_dotenv
from unittest.mock import MagicMock

# Load environment variables from .env file FIRST
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

# Mock AI service BEFORE importing the app to avoid loading heavy ML models
# This prevents SSL certificate errors when downloading models from HuggingFace
async def mock_describe_image_with_blip(image_url: str) -> str:
    if not image_url:
        raise ValueError("Image URL cannot be empty")
    if not image_url.startswith("https://"):
        raise ValueError("Image URL must start with https://")
    return "A friendly dog looking for a home"

async def mock_enrich_profile_with_llama(pet_data: dict, blip_description: str) -> dict:
    return {
        "title": "Test Pet",
        "tags": ["#Adoptable", "#Test"],
        "emotional_description": "Test description"
    }

# Create mock module
ai_service_mock = MagicMock()
ai_service_mock.describe_image_with_blip = mock_describe_image_with_blip
ai_service_mock.enrich_profile_with_llama = mock_enrich_profile_with_llama

# Insert mock into sys.modules BEFORE importing anything else
sys.modules['app.services.ai_service'] = ai_service_mock

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
if not os.getenv("MONGO_HOST"):
    os.environ["MONGO_HOST"] = "localhost"
if not os.getenv("MONGO_PORT"):
    os.environ["MONGO_PORT"] = "27017"
if not os.getenv("MONGO_DB"):
    os.environ["MONGO_DB"] = "test_db"
if not os.getenv("MONGO_USER"):
    os.environ["MONGO_USER"] = ""
if not os.getenv("MONGO_PASSWORD"):
    os.environ["MONGO_PASSWORD"] = ""

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

    # Mock MongoDB client for testing
    class MockMongoClient:
        def __init__(self):
            self.databases = {}

        def __getitem__(self, name):
            if name not in self.databases:
                self.databases[name] = MockMongoDatabase()
            return self.databases[name]

    class MockMongoDatabase:
        def __init__(self):
            self.collections = {}

        def __getitem__(self, name):
            if name not in self.collections:
                self.collections[name] = MockMongoCollection()
            return self.collections[name]

    class MockMongoCollection:
        def __init__(self):
            self.documents = []

        async def find_one(self, query):
            for doc in self.documents:
                if all(doc.get(k) == v for k, v in query.items()):
                    return doc
            return None

        def find(self, query=None):
            return self

        def __aiter__(self):
            return self

        async def __anext__(self):
            if not hasattr(self, "_iter"):
                self._iter = iter(self.documents)
            try:
                return next(self._iter)
            except StopIteration:
                raise StopAsyncIteration

        async def insert_one(self, document):
            self.documents.append(document)
            return None

        async def update_one(self, query, update):
            for doc in self.documents:
                if all(doc.get(k) == v for k, v in query.items()):
                    doc.update(update.get("$set", {}))
            return None

        async def find_one_and_update(
            self, query, update, upsert=False, return_document=False
        ):
            for doc in self.documents:
                if all(doc.get(k) == v for k, v in query.items()):
                    doc.update(update.get("$inc", {}))
                    return doc
            if upsert:
                new_doc = {"_id": query.get("_id", "new"), "sequence_value": 1}
                new_doc.update(update.get("$inc", {}))
                self.documents.append(new_doc)
                return new_doc
            return None

    mock_redis = MockRedis()
    mock_mongo = MockMongoClient()

    # Override the dependency globally in the app
    app.dependency_overrides[get_db] = override_get_db

    # Mock redis client in multiple locations
    with patch(
        "app.database.redis.redis_db.get_redis_client", return_value=mock_redis
    ), patch("app.database.mongo.mongo_db.get_client", return_value=mock_mongo), patch(
        "app.routes.admin_routes.verify_token",
        side_effect=lambda credentials: __import__(
            "app.utils.jwt.jwt_utils", fromlist=["verify_token"]
        ).verify_token(credentials, mock_redis),
    ), patch(
        "app.routes.adopter_routes.verify_token",
        side_effect=lambda credentials: __import__(
            "app.utils.jwt.jwt_utils", fromlist=["verify_token"]
        ).verify_token(credentials, mock_redis),
    ):
        # Create the test client
        with TestClient(app) as test_client:
            yield test_client

    # Clear overrides after the test
    app.dependency_overrides.clear()
