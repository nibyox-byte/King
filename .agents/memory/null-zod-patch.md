---
name: Null values in admin PATCH payloads
description: Why admin save mutations silently fail when DB returns null fields — and the fix pattern.
---

# Null values in admin PATCH payloads

## The Rule
Zod `string().optional()` (and similar) in Update body schemas accepts `string | undefined` but **NOT `null`**. The DB returns `null` for optional columns. If a raw DB record is passed directly as the mutation `data`, Zod validation returns 400 and the entire save is rejected.

**Why:** Generated UpdateBody schemas use `.optional()` (not `.nullish()`). The DB schema uses nullable columns. There's a gap between what the DB returns and what the API accepts for updates.

**How to apply:** Every admin save must use a payload builder that converts null fields to `undefined` before sending. Key patterns:
- `photo: item.photo || undefined` — empty string and null both become undefined (correct for URL fields)
- `biography: item.bio ?? item.biography ?? undefined` — null becomes undefined via chained nullish coalescing
- `location: item.location ?? undefined` — null → undefined (string is preserved)
- NEVER pass raw `editItem` (from DB record spread) as the mutation `data`.

## The Events Bug
`events.tsx` was calling `updateEvent.mutate({ id, data: editItem })` where `editItem = { ...ev }` from the API. Fields like `description: null`, `location: null`, `image: null` caused `zod.string().optional()` to reject → 400 → no `onError` handler → user saw nothing, photo was lost.

**Fix:** Added `buildEventPayload()` that strips nulls, and added `onError` handlers to all mutations in artisans/events/experiences pages.

## Silent Failure Pattern
When mutations lacked `onError` handlers, any API error (400/500) caused the dialog to stay open with zero feedback. Always add `onError: (err) => toast(...)` to every mutation call.
