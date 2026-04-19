# Expanded Workflows — Post-MVP Roadmap

This document captures everything from the Technical Pack and User Journeys
specifications that **ships only as schema or stub** in the current build —
plus deliberate cuts.

## Out of scope for current build

| Capability | Status | Notes |
|------------|--------|-------|
| Automated permit registry verification | Documented | See `hatchery-compliance.md` |
| Escrow / held payments | Cut | Cash & WhatsApp negotiation continues |
| WhatsApp Business API push notifications | Cut | In-app `notifications` table only |
| SMS notifications | Cut | Add Twilio adapter when budget allows |
| Dispute flow with admin mediation | Cut | Cancel + refund out-of-band for now |
| Waitlist auto-promotion when a confirmed slot frees | Cut | Manual re-invite by hatchery |
| Buyer-submitted reviews / ratings UI | Read-only | Schema exists, write path deferred |
| Service request file attachments | Cut | Bucket exists, UI deferred |
| Operator-side analytics charts | Cut | KPIs only in v1 |

## Schema-ready, UI-deferred

These tables are live in the database with full RLS, and a follow-up sprint
can ship the UI without further migrations:

- `service_requests.expires_at` — auto-expire stale quote requests via cron
- `admin_audit_logs` — appears as a 20-row tail on each admin page; full
  searchable audit page deferred
- `batch_reservations.idempotency_key` + `service_requests.idempotency_key`
  — wired through the client, server uses Postgres unique index to dedupe

## Notification types reserved (already in enum)

```text
reservation_received | reservation_confirmed | reservation_waitlisted
reservation_cancelled | reservation_fulfilled | service_request_received
service_request_responded | listing_hidden_by_admin | hatchery_approved
hatchery_rejected
```

Triggers will be wired in a follow-up; the enum is additive so no future
migration is needed for these types.

## What ships now (acceptance gates)

1. Hatchery onboarding → admin approval → batch creation → buyer reservation
   → hatchery confirm → buyer dashboard reflects `confirmed`.
2. Concurrent confirms cannot oversell (`confirm_reservation` SQL function
   uses row-level `FOR UPDATE`).
3. Service quote request → provider response → buyer sees update.
4. `agromed_veterinary` listings without `expires_on` are rejected with a
   structured `VALIDATION_ERROR` envelope.
5. Suspending a user hides their listings, hatchery, and service profile.
6. Every admin destructive action writes an `admin_audit_logs` row.
