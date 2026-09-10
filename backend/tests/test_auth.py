from fastapi.testclient import TestClient

from app.main import app


def test_login_with_correct_credentials_sets_session_cookie():
    response = TestClient(app).post(
        "/api/login", json={"username": "user", "password": "password"}
    )
    assert response.status_code == 200
    assert response.json() == {"username": "user"}
    assert "session_token" in response.cookies


def test_login_with_wrong_credentials_is_rejected():
    response = TestClient(app).post(
        "/api/login", json={"username": "user", "password": "wrong"}
    )
    assert response.status_code == 401


def test_me_requires_a_session():
    response = TestClient(app).get("/api/me")
    assert response.status_code == 401


def test_me_returns_the_logged_in_user():
    client = TestClient(app)
    client.post("/api/login", json={"username": "user", "password": "password"})
    response = client.get("/api/me")
    assert response.status_code == 200
    assert response.json() == {"username": "user"}


def test_logout_clears_the_session():
    client = TestClient(app)
    client.post("/api/login", json={"username": "user", "password": "password"})
    client.post("/api/logout")
    response = client.get("/api/me")
    assert response.status_code == 401
