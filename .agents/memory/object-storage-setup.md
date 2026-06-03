---
name: Object Storage Setup
description: How image uploads are handled in Gorilla Guardians — Replit App Storage replaces local /uploads folder.
---

Images are stored in Replit App Storage (GCS bucket: `replit-objstore-29951e73-c512-42cb-9a10-65f7abd7c72d`).

## Upload flow
1. Client POSTs JSON metadata to `/api/storage/uploads/request-url` → gets `{ uploadURL, objectPath }`
2. Client PUTs file bytes directly to `uploadURL` (GCS presigned URL)
3. Client stores `/api/storage${objectPath}` as the image URL in the DB

## Serving
Images served via `GET /api/storage/objects/<uuid>` (streams from GCS).

## Key files
- Server lib: `artifacts/api-server/src/lib/objectStorage.ts` + `objectAcl.ts`
- Server route: `artifacts/api-server/src/routes/storage.ts`
- Frontend: `artifacts/gorilla-guardians/src/components/ui/image-upload.tsx` (updated to use presigned URL flow)

**Why:** Local `/uploads` folder is ephemeral on Replit — files lost after restart/redeploy. GCS is permanent.

**How to apply:** Any new image upload feature should use POST `/api/storage/uploads/request-url` + PUT to presigned URL, not multer/diskStorage.
