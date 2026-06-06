---
name: Email System
description: Email notification system — how it works, where to configure, and provider setup.
---

## Architecture
- **Service**: `artifacts/api-server/src/lib/emailService.ts` — sends via Resend API, logs all attempts to `email_logs` DB table regardless of outcome.
- **DB table**: `lib/db/src/schema/emailLogs.ts` — `email_logs` table tracking every email attempt with status (sent/failed/skipped/pending).
- **Routes**: `artifacts/api-server/src/routes/emails.ts` — `GET /api/emails/logs`, `GET /api/emails/stats`, `POST /api/emails/resend/:id`
- **Admin UI**: `artifacts/gorilla-guardians/src/pages/admin/email-logs.tsx` — at `/admin/email-logs`

## Provider: Resend
- Set `RESEND_API_KEY` environment secret to enable real delivery.
- Without the key: emails are logged with status `skipped` (graceful degradation, no crash).
- From address configured as `noreply@gorillagardians.com` in emailService.ts — update domain once DNS is configured.

## Templates Available
All in `emailTemplates` export in `emailService.ts`:
- `bookingConfirmation` — on new booking POST
- `bookingApproved` / `bookingCancelled` — on booking PATCH status change
- `orderConfirmation` — on new order POST
- `orderShipped` / `orderDelivered` — on order PATCH status change
- `paymentSuccessful` / `paymentFailed` — standalone templates (not auto-triggered yet)
- `welcomeEmail` — on user registration
- `newMessageNotification` — standalone template

## Triggers
- `POST /api/bookings` → booking_confirmation email
- `PATCH /api/bookings/:id` (status → approved/confirmed) → booking_approved email
- `PATCH /api/bookings/:id` (status → cancelled) → booking_cancelled email
- `POST /api/orders` → order_confirmation email
- `PATCH /api/orders/:id` (status → shipped) → order_shipped email
- `PATCH /api/orders/:id` (status → delivered) → order_delivered email
- `POST /api/auth/register` → welcome email

**Why:** sendEmail() is always called with `.catch()` so email failures never break the main API response.
