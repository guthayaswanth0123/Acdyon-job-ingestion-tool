import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import init_db

client = TestClient(app)

def test_health_endpoint():
    init_db()
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "version" in data
