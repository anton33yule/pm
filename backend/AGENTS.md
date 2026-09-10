# Backend

FastAPI app served together with the statically-exported Next.js frontend (see frontend/AGENTS.md), packaged into one Docker container per root AGENTS.md.

## Stack

FastAPI + Uvicorn, managed with `uv` (see `pyproject.toml`; `[tool.uv] package = false` — this is an application, not a distributable package). Python >=3.12.

## Structure

- `app/main.py` — the FastAPI app. API routes live under `/api/*`; everything else is served as static files (the frontend build output, mounted at `/`) via `StaticFiles(..., html=True)`. Routes are registered before the static mount so `/api/*` always takes precedence over it.
- `app/static/` — the files served at `/`. Currently a hand-written placeholder page; replaced by the real Next.js static export in Part 3 of `docs/PLAN.md`.
- `tests/` — pytest, using FastAPI's `TestClient`. `pyproject.toml` sets `pythonpath = ["."]` so `from app.main import app` resolves when running `pytest` from this directory.

## Running locally (without Docker)

```
uv sync
uv run uvicorn app.main:app --reload
```

## Testing

```
uv run pytest
```

## Data

SQLite data (from Part 5 of `docs/PLAN.md` onward) lives under `data/` at the project root, bind-mounted into the container at `/app/data` by `scripts/start`.
