# PM — Project Management MVP

A Kanban board with an AI chat sidebar. A Next.js frontend (built as a static export) is served by a FastAPI backend from a single process on a single port.

## Architecture

- **Monorepo**: `frontend/` (Next.js), `backend/` (FastAPI), `scripts/` (start/stop/build), `docs/`.
- **Single container, single port (8000)**: FastAPI serves both the API (`/api/*`) and the built frontend at `/` — there is no reverse proxy and no separate frontend server in production.
- **Frontend**: a single-page app (Kanban board) with an `AuthGate` that switches between a login form and the board based on session state.
- **Auth**: cookie-based sessions, one hardcoded demo user (`user` / `password`) — documented MVP limitation, not a bug.
- **Data**: SQLite (`backend/data/app.db`), one JSON blob per user holding the whole board (columns + cards). Schema details in [`docs/DATABASE.md`](docs/DATABASE.md).
- **AI chat**: calls OpenRouter (`openai/gpt-oss-120b`) to create/update/move/delete cards via structured output; it can never add, rename, or delete columns.

## Quick start (Docker)

Builds the image from the root `Dockerfile` and runs it as container `pm-app` on `http://localhost:8000`. Requires a project-root `.env` with `OPENROUTER_API_KEY`.

| Platform | Start | Stop |
|----------|-------|------|
| Windows | `.\scripts\start-windows.ps1` | `.\scripts\stop-windows.ps1` |
| macOS | `./scripts/start-mac.sh` | `./scripts/stop-mac.sh` |
| Linux | `./scripts/start-linux.sh` | `./scripts/stop-linux.sh` |

Or equivalently: `docker-compose up`.

## Local development

### Frontend (`frontend/`)

```bash
npm install
npm run dev          # dev server at http://localhost:3000
npm run build         # static export to frontend/out/
npm run lint
```

### Backend (`backend/`)

```bash
uv sync --extra dev
uv run uvicorn app.main:app --reload --port 8000   # requires OPENROUTER_API_KEY in project-root .env
```

Before running the backend directly (or any test that serves built HTML), build the frontend into `backend/static/`:

```bash
./scripts/build-frontend.ps1   # Windows
./scripts/build-frontend.sh    # macOS/Linux
```

## Testing

```bash
# Frontend, from frontend/
npm run test          # Vitest unit/component tests
npm run test:e2e       # Playwright e2e (launches the FastAPI backend itself; requires uv)
npm run test:all       # both

# Backend, from backend/
uv run pytest
```

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | Next.js, React, Tailwind CSS, @dnd-kit, Vitest, Playwright |
| Backend | FastAPI, uvicorn, SQLAlchemy, SQLite, httpx, uv, pytest |
| AI | OpenRouter (`openai/gpt-oss-120b`) |
| Packaging | Docker (single image, single port) |

## More detail

- [`frontend/AGENTS.md`](frontend/AGENTS.md) — frontend structure, components, data model
- [`backend/AGENTS.md`](backend/AGENTS.md) — API routes, auth, AI integration
- [`scripts/AGENTS.md`](scripts/AGENTS.md) — start/stop/build scripts
- [`docs/DATABASE.md`](docs/DATABASE.md) — schema and seed data
- [`docs/PLAN.md`](docs/PLAN.md) — phased implementation history/roadmap
- [`CLAUDE.md`](CLAUDE.md) — full project guide (architecture, commands, coding standards)
