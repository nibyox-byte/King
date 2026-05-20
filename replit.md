# Gorilla Guardians Village

A full-featured e-commerce and cultural experience platform for Gorilla Guardians Village in Musanze, Rwanda — connecting global buyers with handmade crafts, cultural experiences, and conservation storytelling.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080 → proxied to `/api`)
- `pnpm --filter @workspace/gorilla-guardians run dev` — run the frontend (Vite dev server → proxied to `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — express-session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui + Framer Motion + Recharts + Wouter
- API: Express 5 + Pino logging
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/gorilla-guardians/` — React + Vite frontend
  - `src/lib/auth.tsx` — AuthContext, TEST_ACCOUNTS, getRedirectPath
  - `src/pages/` — all pages (public + role-based dashboards)
  - `src/components/layout/` — Navbar, DashboardSidebar, Footer
  - `src/index.css` — Rwandan theme (HSL custom properties)
- `artifacts/api-server/` — Express 5 API server
  - `src/routes/` — all route handlers organized by domain
  - `src/db/` — Drizzle schema and seed data
- `lib/api-spec/` — OpenAPI 3.1 spec (source of truth for contracts)
- `lib/api-client-react/` — generated hooks (`useListProducts`, etc.) and Zod schemas
- `lib/db/` — shared Drizzle ORM schema used by both API server and scripts

## Architecture decisions

- **Contract-first API**: OpenAPI spec in `lib/api-spec` drives code generation (Orval) for both React Query hooks and Zod validation schemas. Never handwrite API calls on the frontend.
- **localStorage auth**: Auth is client-side only using TEST_ACCOUNTS mapped by email. The `AuthProvider` in `auth.tsx` manages role-based redirects without a server session.
- **Role-based routing**: `ProtectedRoute` in `App.tsx` guards `/admin/*`, `/staff/*`, `/artisan/*`, and `/customer/*` paths by checking the authenticated user's role.
- **Dashboard layout vs public layout**: Dashboard pages use `DashboardSidebar` with full-page flex layout (no Navbar/Footer). Public pages use `Navbar` + `Footer` with standard scrolling layout.
- **Rwandan theme**: CSS custom properties in `index.css` define a nature-inspired palette — forest green primary (`152 42% 28%`), warm amber accent (`43 90% 50%`), terracotta secondary (`25 45% 40%`). Google Fonts: Playfair Display (serif headings) + Inter (body).

## Product

- **Shop**: Browse 8+ handmade Rwandan crafts with filtering, cart, wishlist, checkout, and order tracking
- **Artisans**: Profiles for each artisan with their story, products, certifications, and donation support
- **Experiences**: Book cultural immersion experiences (gorilla tracking, craft workshops, village tours)
- **Stories**: Editorial storytelling about artisans and conservation impact
- **Events**: Upcoming community and cultural events
- **Impact**: Live stats on families supported, gorillas protected, countries reached
- **Dashboards**: Role-specific dashboards for customers, artisans, staff, and admins

## Test accounts (all use password: `admin123`)

| Role | Email |
|------|-------|
| super_admin | super_admin@gorillaguardians.rw |
| admin | admin@gorillaguardians.rw |
| staff | staff@gorillaguardians.rw |
| artisan | artisan@gorillaguardians.rw |
| customer | customer@gorillaguardians.rw |

## User preferences

- Use `@workspace/api-client-react` hooks (never relative fetch calls) for all API access
- Never use `console.log` in server code — use `req.log` in route handlers, `logger` elsewhere
- All new pages: public pages get Navbar + Footer; dashboard pages get DashboardSidebar only

## Gotchas

- The generated hook for listing messages is `useListMessages` (not `useGetMessages`); query key is `getListMessagesQueryKey`
- `useSendMessage` takes `{data: MessageInput}` where `MessageInput` includes `conversationId` in the body (not as a URL param)
- Always run `pnpm --filter @workspace/api-spec run codegen` after editing the OpenAPI spec before using new hooks
- `BASE_URL` from `import.meta.env.BASE_URL` already has a trailing slash — strip it with `.replace(/\/$/, "")` for Wouter's `base` prop

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Generated API hooks reference: `lib/api-client-react/src/generated/api.ts`
- DB schema: `lib/db/src/schema/` (one file per domain table)
