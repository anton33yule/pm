from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.auth import (
    SESSION_COOKIE_NAME,
    authenticate,
    create_session,
    destroy_session,
    require_session,
)

app = FastAPI()

STATIC_DIR = Path(__file__).parent / "static"


class LoginRequest(BaseModel):
    username: str
    password: str


@app.get("/api/hello")
def hello() -> dict[str, str]:
    return {"message": "Hello from the API"}


@app.post("/api/login")
def login(credentials: LoginRequest, response: Response) -> dict[str, str]:
    if not authenticate(credentials.username, credentials.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_session(credentials.username)
    response.set_cookie(SESSION_COOKIE_NAME, token, httponly=True, samesite="lax")
    return {"username": credentials.username}


@app.post("/api/logout")
def logout(request: Request, response: Response) -> dict[str, bool]:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if token:
        destroy_session(token)
    response.delete_cookie(SESSION_COOKIE_NAME)
    return {"ok": True}


@app.get("/api/me")
def me(username: str = Depends(require_session)) -> dict[str, str]:
    return {"username": username}


app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
