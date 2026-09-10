import os
import secrets

from fastapi import HTTPException, Request

SESSION_COOKIE_NAME = "session_token"

USERNAME = os.environ.get("APP_USERNAME", "user")
PASSWORD = os.environ.get("APP_PASSWORD", "password")

_sessions: dict[str, str] = {}


def authenticate(username: str, password: str) -> bool:
    return username == USERNAME and password == PASSWORD


def create_session(username: str) -> str:
    token = secrets.token_urlsafe(32)
    _sessions[token] = username
    return token


def destroy_session(token: str) -> None:
    _sessions.pop(token, None)


def require_session(request: Request) -> str:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    username = _sessions.get(token) if token else None
    if username is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return username
