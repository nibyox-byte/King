---
name: Gorilla Guardians DB setup
description: What's required to get the API returning data; port conflict pattern
---

## Rule
Before the API can serve any data, both of these must have been run:
1. `cd lib/db && DATABASE_URL=$DATABASE_URL pnpm run push-force` — pushes Drizzle schema to the Replit PostgreSQL instance.
2. `cd scripts && DATABASE_URL=$DATABASE_URL pnpm run seed` — seeds users, categories, artisans, products, experiences, stories, events, reviews, notifications, and (after this session) orders.

**Why:** The Replit PostgreSQL database starts empty. The schema is never auto-applied; `push-force` must be run explicitly. Without seeded data, all list pages show empty and detail pages show "not found".

## Port conflict pattern
If `artifacts/gorilla-guardians: web` workflow fails with "Port 24775 is already in use":
- A stale vite process from a previous run is holding the port.
- Fix: `kill -9 <pid>` (find with `ps aux | grep vite`), then restart the workflow.
- The process may appear running but not be bound to the port — `lsof -ti:24775` may return nothing. Kill the stale vite PID anyway.

## How to apply
Any time the app shows blank pages, 500 errors, or "not found" everywhere — check DB first before debugging code.
