from fastapi.testclient import TestClient

from localnest import __version__
from localnest.main import app

client = TestClient(app)


def test_read_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["application"] == "LocalNest"
    assert data["version"] == __version__
    assert data["environment"] == "development"
