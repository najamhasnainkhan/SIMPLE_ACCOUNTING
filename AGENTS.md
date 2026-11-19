# AGENTS.md

## Stack
- Vite + React 18 frontend (`index.html`, `src/`), plain CSS.
- Express 4 API in `server/` (ES modules), PostgreSQL through `pg`.
- No auth: single user.

## Conventions
- `server/routes/*.js`: one router factory per area; `server/app.js` wires them under `/api`.
- `server/db.js`: shared pool + `query()` with one retry on connection errors. Always use `$n` parameters.
- `server/validate.js`: input checks, `parseCents` (decimal text -> integer cents, no floats), `buildFilter` for list/summary filters.
- `src/components/*.jsx`: one component per UI part; `src/App.jsx` holds state; `src/api.js` fetch wrapper + `fmt` (cents -> USD).
- Schema changes: new migration via the platform's apply_migration (files in `db/migrations/`); never alter tables from app code.
- Errors: throw `HttpError`/`bad()` from `server/validate.js`; the handler in `server/app.js` returns `{error}` JSON.

## Run
- `npm install`, `npm run dev` (Vite + API via concurrently), `npm run build`, `npm test` (node:test).
- Env: DATABASE_URL (required), API_PORT (optional). See `.env.example`.

## Decisions
- Built from scratch: gig 276 (double-entry, SQLite, JWT) is heavier than needed; only its Express layout/error pattern and money-as-cents idea were borrowed.
- Amounts stored as integer cents; USD only.
- Categories are protected from deletion while used (FK `on delete restrict` + friendly message).
- Filters apply to both the list and the totals/breakdown, so the summary reflects the filtered view.
