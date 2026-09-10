# Frontend

Existing code: a working, backend-free demo of the Kanban board UI ("Kanban Studio"). Not yet wired to any backend, auth, or persistence — all state is in-memory React state seeded from `src/lib/kanban.ts` and lost on reload. Not yet statically exported (runs via `next dev`/`next start`, a Node server).

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, `@dnd-kit/*` for drag-and-drop, `clsx` for conditional classes. Fonts: Space Grotesk (display) + Manrope (body) via `next/font/google`.

## Structure

- `src/app/layout.tsx` — root layout, font vars, page metadata.
- `src/app/page.tsx` — renders `<KanbanBoard />`, nothing else.
- `src/app/globals.css` — Tailwind import + brand CSS custom properties (colors, surface/stroke/shadow tokens). See root AGENTS.md for the palette.
- `src/lib/kanban.ts` — data layer: `Card`, `Column`, `BoardData` types; `initialData` seed (5 fixed columns, 8 seed cards); `moveCard(columns, activeId, overId)` — pure function handling same-column reorder and cross-column move, used by the dnd-kit drag-end handler; `createId(prefix)` id generator.
- `src/components/KanbanBoard.tsx` — top-level client component. Owns `board` and `activeCardId` state, wires up dnd-kit `DndContext` (PointerSensor, closestCorners), and handlers for drag/rename-column/add-card/delete-card. Renders the header and the column grid.
- `src/components/KanbanColumn.tsx` — one column: droppable target, editable title input (renames on every keystroke), `SortableContext` of cards, empty-state placeholder, `NewCardForm` at the bottom.
- `src/components/KanbanCard.tsx` — one draggable card (whole card is the drag handle) with a delete ("Remove") button.
- `src/components/KanbanCardPreview.tsx` — static render used only inside the drag overlay.
- `src/components/NewCardForm.tsx` — inline add-card form (title required, details optional).

## Known gaps vs. the product spec (root AGENTS.md)

- Card **editing** (title/details after creation) is not implemented — only add, remove, reorder, move, and column rename exist today.
- No backend, auth, or persistence — everything resets on page reload.
- Not yet statically exported for FastAPI to serve (see docs/PLAN.md Part 3).

## Testing

- Unit/component: Vitest + Testing Library, colocated as `*.test.ts(x)` under `src/`. Run: `npm run test:unit`.
- E2E: Playwright, specs under `tests/`, currently drives against the `next dev` server. Run: `npm run test:e2e`.
- `npm run test:all` runs both.
