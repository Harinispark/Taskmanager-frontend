# Task Manager

A clean, responsive task manager built with **React 19 + TypeScript** and **Vite**.

## Features

- **View / add / edit / delete** tasks with an inline edit form (Enter to save, Esc to cancel)
- **Complete** tasks with a checkbox; completed tasks are struck through and muted
- **Priority** levels (low / medium / high) with color-coded badges
- **Due dates** with human-readable display and **overdue** highlighting
- **Filter tabs** — All / Active / Completed — with live counts
- **Live search** across titles and details
- **Clear completed** bulk action behind a confirmation dialog
- **Persistent storage** in **PostgreSQL** via the backend REST API (survives refreshes)
- **Responsive layout** (mobile-first) and **dark mode** via `prefers-color-scheme`
- **Keyboard accessible** with focus trapping in dialogs and visible focus states

## Tech stack

- React 19 · TypeScript · Vite 6
- Hand-rolled CSS with design tokens (CSS variables)
- Testing: Vitest + Testing Library (jsdom)
- Backend: Node.js + TypeScript + Express + Prisma + PostgreSQL (`../backend`)

## Getting started

The frontend needs the backend API running first (see `../backend/README.md`).

```bash
# 1) in ../backend
npm install
npx prisma migrate deploy   # or: npm run prisma:migrate
npm run dev                 # API on http://localhost:3000

# 2) in this folder
npm install     # installs dependencies (also self-heals native bindings on Windows)
npm run dev     # start the dev server (http://localhost:5173)
```

Point the app at a different API with `VITE_API_URL` (defaults to
`http://localhost:3000/api`); see `.env.example`.

## Scripts

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `npm run dev`    | Start the Vite dev server                    |
| `npm run build`  | Type-check (`tsc -b`) then build for production |
| `npm run preview`| Preview the production build locally         |
| `npm test`       | Run the Vitest test suite                    |
| `npm run lint`   | Lint with oxlint                             |

## Project structure

```
src/
├── api/           # fetch client for the backend REST API
├── components/    # UI components (forms, task list, toolbar, dialog)
├── hooks/         # useTasks (store + API sync), useTaskForm
├── types/         # Task, Filter, TaskState
├── utils/         # validation, selectors, date helpers
└── test/          # Vitest setup
```

## Note on dependencies

- Vite 6, Vitest 4, jsdom 25 and the rest of the toolchain are pinned to
  versions that run on **Node 20.18+** and are free of known security
  advisories (`npm audit` reports no vulnerabilities).
- npm's optional-dependencies bug (npm/cli#4828) can prevent native binaries
  (e.g. oxlint) from being installed on Windows; `scripts/ensure-optional-deps.mjs`
  runs on `postinstall` and restores them automatically.