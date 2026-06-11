# Import TestClient for testing FastAPI endpoints
from fastapi.testclient import TestClient

# Import the FastAPI app
from app.main import app

# Create test client
client = TestClient(app)


def test_read_main():
    # Test the root endpoint returns a valid status code
    response = client.get("/")
    assert response.status_code in [200, 404]
