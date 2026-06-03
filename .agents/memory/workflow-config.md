---
name: Workflow Config
description: How to configure workflows for the Gorilla Guardians monorepo — both PORT and BASE_PATH must be set inline.
---

## Workflow commands

**API Server:**
```
PORT=8080 pnpm --filter @workspace/api-server run dev
```
waitForPort: 8080, outputType: console

**Gorilla Guardians Web:**
```
PORT=24775 BASE_PATH=/ pnpm --filter @workspace/gorilla-guardians run dev
```
waitForPort: 24775, outputType: webview

**Why:** The vite.config.ts and server/index.ts both throw if PORT (and BASE_PATH for the frontend) are not set. These cannot be shared env vars since both services need different PORT values.

**How to apply:** Always set PORT and BASE_PATH inline in the workflow command string, not as shared env vars.
