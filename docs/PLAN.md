# Project plan: Project Management MVP

Each part has an implementation checklist, the tests to write, and success criteria. Work through parts in order; don't start a part until the previous one's success criteria are met. Part 5 additionally requires explicit user sign-off on the DB schema before Part 6 begins.

## Part 1: Plan

- [x] Enrich this document with per-part checklists, tests, and success criteria
- [x] Create `frontend/AGENTS.md` describing the existing frontend code
- [x] User reviews and approves this plan

## Part 2: Scaffolding

Docker infrastructure, the FastAPI backend, and start/stop scripts — proven with a static "hello world" page plus one real API round trip.

Checklist:
- [x] `backend/pyproject.toml` — uv-managed Python project; deps: `fastapi`, `uvicorn`
- [x] `backend/app/main.py` — FastAPI app with `GET /api/hello` returning `{"message": "Hello from the API"}`, plus a static file mount at `/`
- [x] `backend/app/static/index.html` — placeholder page that fetches `/api/hello` on load and displays the message (proves static serving + API call together; replaced by the real frontend in Part 3)
- [x] Root `Dockerfile` — single container: Python base image, install `uv`, `uv sync`, copy `backend/`, run `uvicorn` on port 8000
- [x] `scripts/start.sh` + a Windows equivalent (`.ps1`) — `docker build` + `docker run`, mapping port 8000, mounting a volume for the SQLite data directory, passing `--env-file .env`
- [x] `scripts/stop.sh` + Windows equivalent — stop/remove the named container
- [x] `backend/AGENTS.md` — replace the placeholder with a real description of the backend
- [x] Root `.gitignore` — confirm `.env`, `__pycache__`, and the SQLite data directory are ignored

No `docker-compose` — one container, no orchestration need.

Tests:
- [x] `backend/tests/test_hello.py` — `TestClient` asserts `GET /api/hello` is 200 with the expected JSON
- [x] `backend/tests/test_static.py` — asserts `GET /` is 200 and contains an expected marker string

Success criteria:
- [x] `docker build` succeeds from a clean checkout
- [x] `scripts/start` brings the container up; `http://localhost:8000/` shows the hello-world page displaying a message it fetched live from `/api/hello`
- [x] `scripts/stop` cleanly stops and removes the container
- [x] `pytest` passes in `backend/`

## Part 3: Add in Frontend

Statically export the real Next.js app and serve it from FastAPI at `/`, replacing the Part 2 placeholder. Also close the one known gap in the existing demo (card editing) before wiring a backend to it.

Checklist:
- [x] Add `output: "export"` to `frontend/next.config.ts`
- [x] Add a frontend build stage to the Dockerfile (Node image: `npm ci && npm run build` producing `frontend/out/`), copied into the backend image at `backend/app/static`, replacing the Part 2 placeholder
- [x] Implement card editing: an edit affordance on `KanbanCard` (inline edit of title/details), an `updateCard`-style pure helper in `kanban.ts` alongside `moveCard`, and a `handleEditCard` handler in `KanbanBoard.tsx`
- [x] Add a Playwright project/config pointed at the FastAPI-served static build for a minimal smoke check, keeping the existing rich `tests/*.spec.ts` running against `next dev` for fast iteration
- [x] `.dockerignore` — needed once the Docker build context includes `frontend/` (keeps `node_modules`/`.next`/`out` etc. out of the build context)
- [x] Moved the `next dev`/Playwright dev port from 3000 to 3100 — this machine already had an unrelated dev server bound to 3000, which `reuseExistingServer: true` was silently reusing and running the suite against the wrong app

Tests:
- [x] `kanban.test.ts` — unit tests for the new edit helper
- [x] `KanbanBoard.test.tsx` — component test editing a card's title/details via the UI
- [x] New Playwright smoke spec (`tests-smoke/static-build.spec.ts`, run via `npm run test:e2e:smoke` against an already-running server) — the FastAPI-served static build renders the board (5 columns), no console errors
- [x] `backend/tests/test_static.py` left checking the Part 2 placeholder content, unchanged — it exercises the backend's static-serving mechanism against its own fixture and doesn't need to know about the frontend build; the new Playwright smoke spec is what actually verifies the real "Kanban Studio" content

Success criteria:
- [x] `npm run build` produces a static export with no server-only-feature errors
- [x] The Dockerized app's `/` shows the real, fully interactive Kanban Studio UI (drag/drop, rename, add/remove/edit cards), still in-memory only at this point
- [x] All unit/component/e2e/backend tests pass

## Part 4: Fake user sign-in

Checklist:
- [ ] `POST /api/login` — checks hardcoded `user`/`password` (env-overridable constants, not DB-driven), on success sets an httpOnly cookie holding an opaque session token stored in an in-memory dict on the backend process
- [ ] `POST /api/logout` — clears the session
- [ ] `GET /api/me` — returns the current username, or 401
- [ ] A `require_session` FastAPI dependency, ready to protect the Part 6 Kanban routes
- [ ] Frontend: a login screen shown when `/api/me` is 401; on success shows `<KanbanBoard />`; a "Log out" control calling `/api/logout`
- [ ] Loading state while the initial `/api/me` check resolves (static export means this gating happens client-side, post-hydration)

Tests:
- [ ] Backend: `/api/login` (right/wrong creds), `/api/logout`, `/api/me` (200 vs 401)
- [ ] Frontend component: login form renders, submits, shows an error on failure (mocked `fetch`)
- [ ] Playwright (against the real backend): login gates the board; wrong credentials show an error; logout returns to the login screen and survives reload

Success criteria:
- [ ] Fresh visit to `/` shows login, not the board
- [ ] Correct credentials unlock the board; incorrect credentials don't
- [ ] Logout revokes access even after a reload
- [ ] All tests pass

## Part 5: Database modeling

Checklist:
- [ ] Propose schema: `users (id, username)` — no password column; login stays hardcoded/env-based per Part 4, this table only gives boards an owner for the future — plus `boards (id, user_id FK, board_json TEXT, updated_at)`, storing the entire `BoardData` shape (columns + cards) as one JSON blob per board, mirroring the frontend's existing types instead of normalizing into separate `columns`/`cards` tables
- [ ] Write `docs/DATABASE.md` — the schema, an example JSON board payload, and the reasoning for the JSON-blob approach
- [ ] On backend startup, create `data/app.db` if missing, seed the one hardcoded user, and seed their board from the existing `initialData` (moved server-side)
- [ ] **Stop here — present `docs/DATABASE.md` to the user and get explicit sign-off before starting Part 6**

Tests:
- [ ] Backend: deleting the DB file and restarting recreates it with the correct tables and seed data

Success criteria:
- [ ] `docs/DATABASE.md` exists and is approved by the user
- [ ] Fresh-DB bootstrap is verified by test

## Part 6: Backend routes

Checklist:
- [ ] `GET /api/board` — the logged-in user's board JSON (401 if not logged in)
- [ ] `PUT /api/board` — validates the payload against pydantic models mirroring `Card`/`Column`/`BoardData`, persists it, returns the saved board
- [ ] Both routes behind `require_session`

Tests:
- [ ] Backend: unauthenticated → 401 on both routes; authenticated GET returns the seeded board; authenticated PUT persists and is reflected on a subsequent GET; malformed PUT payload → 422

Success criteria:
- [ ] A logged-in session can fetch and persist a board via the API alone (e.g. curl/pytest), with no frontend involved
- [ ] Restarting the backend process preserves the last-saved board

## Part 7: Frontend + Backend integration

Checklist:
- [ ] `KanbanBoard.tsx` fetches `GET /api/board` on mount instead of using the local `initialData` seed (loading state while fetching)
- [ ] Every board-mutating action (move, rename, add, delete, edit) optimistically updates local state and fire-and-forgets a `PUT /api/board` with the new board — no conflict resolution/locking needed for a local single-user app
- [ ] A 401 from either call sends the user back to the Part 4 login flow
- [ ] Drop the now-unused seed *values* from `kanban.ts` (keep the types) since the server owns seed data from Part 5 on

Tests:
- [ ] Frontend component: `KanbanBoard` with `fetch` mocked — initial GET populates the board, each action fires the expected PUT payload
- [ ] Playwright (against the full Dockerized stack): login, make a change, reload, confirm it persisted
- [ ] Backend: Part 6 tests continue to pass unmodified

Success criteria:
- [ ] Reloading the page, or restarting the container, preserves every kind of edit — the app is a real persistent Kanban board
- [ ] Full test suite (frontend unit/component/e2e + backend pytest) passes together

## Part 8: AI connectivity

Checklist:
- [ ] Add an HTTP client dependency for calling OpenRouter (`httpx`, or the OpenAI-compatible SDK pointed at OpenRouter's base URL)
- [ ] Read `OPENROUTER_API_KEY` from `.env`
- [ ] `GET /api/ai/ping` (debug route) — sends "What is 2+2? Answer with only the number." to `openai/gpt-oss-120b` via OpenRouter and returns the raw reply
- [ ] Document the required `.env` format (key name only, never commit a real key)

Tests:
- [ ] Backend integration test calling `/api/ai/ping`, asserting the reply contains "4" — skipped/xfail when `OPENROUTER_API_KEY` isn't set (e.g. in CI)

Success criteria:
- [ ] With a valid key, `/api/ai/ping` returns a response containing "4", proving the OpenRouter call path works before building the real chat feature on it

## Part 9: AI Kanban tool-use

Checklist:
- [ ] Structured-output schema: `{"reply": string, "board": BoardData | null}` — `board` is the *entire new board state* when the AI wants to change something, absent/null otherwise (no diff/patch format — reuses the exact `BoardData` shape used everywhere else)
- [ ] `POST /api/chat` — accepts `{message}`, loads the user's board plus in-memory (per-session, not persisted) conversation history, sends a system prompt (current board JSON + the fixed-columns/renaming-only constraint + the response schema) plus history plus the new message to OpenRouter with structured-output enforcement
- [ ] On response: append to history; if `board` is present, validate it against the pydantic `BoardData` model and persist via the same path as Part 6's `PUT /api/board`; return `{reply, board?}`

Tests:
- [ ] Backend, OpenRouter call mocked: a non-board-changing message returns a reply and leaves the board untouched; a board-changing message returns and persists a `board` (verified via a follow-up `GET /api/board`); conversation history is present in the mocked call's request payload on a second turn
- [ ] Backend, one real key-gated integration test: an explicit instruction (e.g. "add a card called X to Backlog") results in a persisted board that actually contains it

Success criteria:
- [ ] Asking a non-changing question gets a sensible reply with no board mutation
- [ ] Asking for a change results in a persisted board reflecting it, verifiable via `GET /api/board`

## Part 10: AI chat sidebar UI

Checklist:
- [ ] `ChatSidebar` component (collapsible, matching the existing visual tokens/palette) — message list + input, calling `POST /api/chat`
- [ ] A response containing `board` updates the frontend's board state directly (or triggers a `GET /api/board` refetch) so the Kanban view updates immediately, no manual reload
- [ ] Loading/error states on the chat call; existing drag/drop/edit flows untouched
- [ ] Wire the sidebar into the board layout

Tests:
- [ ] Frontend component: sending a message renders the reply; a response with `board` updates the visible columns/cards without a reload
- [ ] Playwright: full flow against the real backend with a deterministic mocked AI call — login, ask the AI to add a card via chat, see it appear on the board live

Success criteria:
- [ ] The sidebar chat works end-to-end (real backend, real or deterministically-mocked AI call), and a Kanban-changing instruction visibly updates the board with no manual refresh
- [ ] This is the last part — the full business requirement set in root AGENTS.md is met

## Key decisions baked into this plan

These aren't hard requirements in root AGENTS.md — they're the simplest option consistent with its "never over-engineer" standard, applied to points where a reasonable alternative existed:

1. **DB shape**: one JSON blob column per board (`boards.board_json`), not normalized `columns`/`cards` tables. Matches Part 5's literal "saving it as JSON" wording and the frontend's existing `BoardData` shape.
2. **Login stays hardcoded even after the DB exists** (Part 4/5): the `users` table exists only to give boards an owner for the future, not to drive real credential checking now — root AGENTS.md only asks the DB to *support* multiple users later, not to implement real auth today.
3. **AI board updates are full-board replacements**, not a diff/patch format — reuses existing validation and types, nothing new to invent or parse.
4. **AI conversation history is in-memory**, lost on logout/restart — not a stated requirement to persist it, and simplest for an MVP.
5. **No docker-compose** — one container, so a plain `Dockerfile` plus the start/stop scripts is enough.
6. **Two-tier e2e testing**: the existing rich Playwright specs keep running against `next dev` for fast iteration; a thin smoke test separately covers the real FastAPI-served static build (and, from Part 7 on, the full Dockerized stack) so export/serving bugs still get caught.
