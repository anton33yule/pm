from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_serves_static_page():
    response = client.get("/")
    assert response.status_code == 200
    assert "Project Management MVP" in response.text
