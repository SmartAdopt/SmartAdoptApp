import pytest
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from dotenv import load_dotenv

# Load environment variables from .env file FIRST
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

# Import the FastAPI app and the database components AFTER loading .env
# ruff: noqa: E402
from app.main import app
from app.database.postgres.postgres_db import Base, get_db

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

    # Override the dependency globally in the app
    app.dependency_overrides[get_db] = override_get_db

    # Create the test client
    with TestClient(app) as test_client:
        yield test_client

    # Clear overrides after the test
    app.dependency_overrides.clear()
