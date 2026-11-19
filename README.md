# Simple Ledger

Track income and expenses by category, with a balance summary. React (Vite) + Express + PostgreSQL. Single user, no login, USD.

## Features
- Add, edit, delete transactions (type, amount, date, category, note)
- Create, rename, delete categories (7 defaults seeded; a category in use can't be deleted)
- Total income, expenses and net balance
- Filter by date range, type and category; totals per category update with the filter

## Run
1. `npm install`
2. Set `DATABASE_URL` (Secrets panel in the workspace, or a local `.env`; see `.env.example`).
3. `npm run dev` — open the Vite URL; the API runs on port 3001.

The schema lives in `db/migrations/`. Apply it to your database before first use.

Tests: `npm test`. Production build: `npm run build`.

Money is stored as integer cents and parsed from text without floating point.
