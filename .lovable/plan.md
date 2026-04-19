

## Farmlink — Schema-First Expansion: Hatcheries (Deep) + Services & Agro Categories (Foundation)

Land the canonical schema from the technical pack in one migration, build the **hatchery batch + reservation experience end-to-end**, ship **service profiles + quote requests** as a working second pillar, and wire **agromed / agrofeed / equipment** into the existing `listings` table via `top_category` + `subcategory_slug` so they share discovery, dashboards and admin moderation. WhatsApp stays only as the contact rail for product categories — hatcheries use reservations, services use quote requests.

### 1. One database migration (everything aligned to the spec)

**Extend existing tables**
- `profiles` → add `roles text[] default '{buyer}'`, `active_role text default 'buyer'`, `is_suspended bool`, `suspension_reason text`, `suspended_at timestamptz`. Allowed `active_role`: `buyer | seller | provider | hatchery | admin`.
- `listings` → add `top_category text not null default 'livestock'` (CHECK in `livestock | agrofeed_supplements | agromed_veterinary | agro_equipment_tools`), `subcategory_slug text`, `condition text`, `stock_quantity int`, `min_order_qty int default 1`, `expires_on date`, `metadata jsonb default '{}'`. Backfill all existing rows to `livestock`.

**New tables**
- `hatcheries` (operator profile, region/district, blurb, cover, capacity, **permit_number / permit_authority / permit_doc_path** for the documented compliance trail, status: `draft | pending_review | approved | suspended | rejected`, `whatsapp_e164` fallback only).
- `hatchery_batches` (per the spec: `batch_type`, `breed`, `hatch_date`, `pickup_start/end_date`, `min_order_qty`, `total_quantity`, `reserved_quantity`, generated `available_quantity`, `price_per_unit`, `unit_label`, region, fulfillment flags, `status: draft|open|full|closed|cancelled`).
- `hatchery_batch_photos` (mirrors `listing_photos`).
- `batch_reservations` (the reservation state machine: `pending | confirmed | waitlisted | cancelled_by_buyer | cancelled_by_hatchery | fulfilled`; carries `requested_qty`, `confirmed_qty`, pickup date, mode, contact, both-sides notes).
- `service_profiles` (provider business identity, categories, coverage regions/districts, pricing model, badge, ratings).
- `service_requests` (quote inbox: `submitted | viewed | responded | accepted | declined | expired`).
- `admin_audit_logs` (every privileged action — actor, action, target, reason).

**Triggers & functions**
- `touch_updated_at` on all new tables.
- `confirm_reservation(reservation_id, confirmed_qty)` SECURITY DEFINER plpgsql function that does `SELECT … FOR UPDATE` on the batch, checks `confirmed_qty ≤ total - reserved`, atomically updates reservation + increments `reserved_quantity`, and flips batch to `full` when zero remains. Same pattern for `cancel_reservation` (decrements safely).
- Extend `has_role` (already present) — no change. Add helper `is_hatchery_owner(uid, hatchery_id)` and `owns_batch(uid, batch_id)` for clean RLS.

**RLS (mirrors existing patterns, never recursive)**
- `hatcheries`: public read where `status='approved'`; owner full RW on own row; admin all.
- `hatchery_batches` / `_photos`: public read when parent approved AND batch.status in (`open`,`full`); owner write own; admin all.
- `batch_reservations`: buyer reads own; hatchery owner reads where they own the batch; buyer inserts own (`pending` only); only `confirm_reservation` / `cancel_reservation` functions mutate status.
- `service_profiles`: public read where `is_active=true` AND owner not suspended; owner RW; admin all.
- `service_requests`: buyer reads own; provider reads where `provider_user_id=uid`; buyer inserts; provider patches status.
- `admin_audit_logs`: admin-only read & insert via SECURITY DEFINER helper.

**Storage buckets**
- `hatchery-photos` (public) — covers, batch images.
- `hatchery-permits` (private) — owner + admin signed-URL only.
- `service-attachments` (private) — quote request files.

### 2. Hatchery operator journey (deep)

**Onboarding wizard** — `/_authenticated/dashboard.hatchery.onboarding.tsx`, 4 steps each in its own atomic component (`StepBusiness`, `StepLocation`, `StepCapacityCategory`, `StepPermitReview`). Last step uploads permit doc to `hatchery-permits` and submits with `status='pending_review'`. UI clearly states: "MVP: permit reviewed manually by Farmlink admin. Automated registry checks coming."

**Operator dashboard** (`/_authenticated/dashboard.hatchery.tsx` with sub-tabs):
- Overview — open batches count, pending reservations badge, fill-rate KPI tiles (v2 cream cards, `font-mono` numerals).
- Batches list (`dashboard.hatchery.batches.tsx`) → create/edit batch in a sheet (`BatchForm.tsx`), close/cancel actions.
- Batch detail (`dashboard.hatchery.batches.$batchId.tsx`) → reservation queue (`ReservationRow`), quick confirm/decline, waitlist toggle, batch event timeline (vaccination/grading notes for trust).
- Reservation inbox (`dashboard.hatchery.bookings.tsx`) — chronological, filter by status, bulk confirm.

**Concurrency-safe confirm** — every confirm call goes through the `confirm_reservation` server function (TanStack `createServerFn` + `requireSupabaseAuth`) which calls the SQL function above; returns `INVENTORY_EXCEEDED` error if oversold; client shows the spec's "latest availability" conflict UI with adjusted-qty / waitlist options.

### 3. Buyer hatchery journey (deep)

- `/hatcheries` — replaces the static directory: server-loaded approved hatcheries with category + region filters.
- `/hatcheries/$slug` — profile hero, blurb, certifications, **open batches grid** (`BatchCard` shows hatch date, available qty progress bar, ready-from window, price), reviews (post-MVP placeholder section).
- `/hatcheries/$slug/batches/$batchId` — batch detail with quantity-aware booking form (`ReservationForm`).
- `/_authenticated/dashboard.reservations.tsx` — buyer's reservations with state pills (`ReservationStatusPill`), cancel-while-pending action, deep-links to hatchery.

### 4. Service profiles & quote requests (working v1)

- `/services` — refactored from static list: real `service_profiles` cards (`ServiceProfileCard`).
- `/services/$slug` — profile hero, coverage, pricing model, **Request Quote** CTA.
- `/services/$slug/quote` — quote form (service_type, region/district, preferred date + window, budget range, notes). Uses `createServerFn` with idempotency key.
- `/_authenticated/dashboard.provider.tsx` — provider onboarding gate + tabs: profile editor, quote inbox (`QuoteRow` with `viewed | responded | declined` actions and a response textarea).
- `/_authenticated/dashboard.quotes.tsx` — buyer's submitted quotes with status timeline.

### 5. Agro-categories on existing listings (foundation)

- **Post wizard** (`_authenticated/post.tsx`) becomes category-aware in Step 1: choose `top_category` → conditional dynamic fields:
  - `livestock` (existing breed/age/weight/quantity).
  - `agrofeed_supplements`: pack size + brand → `metadata`, optional `expires_on`.
  - `agromed_veterinary`: **`expires_on` required**, active ingredient + dosage → `metadata`.
  - `agro_equipment_tools`: **`condition` required (new|used)**, brand/model.
- **Browse** (`/listings`) gets a top-category tab strip above the existing category strip. `validateSearch` extends with `topCategory` + `subcategory`. `ListingCard` shows the right unit label + condition/expiry chip per category.
- All four product categories continue using the existing **WhatsApp CTA** + `listing_events('contact_whatsapp')` analytics path — fail-open redirect preserved.

### 6. Admin & audit

- New `/_authenticated/admin.hatcheries.tsx` — pending-review queue with signed-URL permit preview, approve / reject (reason required), writes `admin_audit_logs`.
- Existing admin pages (`admin.listings`, `admin.users`, `admin.verifications`) get a **suspend/unsuspend user** action, **hide/restore listing** with reason code, and write to `admin_audit_logs`.
- Add `AdminAuditLog` component on each admin page showing the last 20 actions for transparency.

### 7. Server functions (atomic, no monolith) — `src/server/`

`hatcheries.functions.ts` · `hatchery-batches.functions.ts` · `reservations.functions.ts` (calls SQL `confirm_reservation`) · `service-profiles.functions.ts` · `service-requests.functions.ts` · `admin-audit.functions.ts` · `listings.functions.ts` extended with category-validated insert. All use `requireSupabaseAuth` middleware + zod validation per the spec's category-specific required fields.

### 8. Notifications

Extend `notifications.type` enum (additive) with: `reservation_received`, `reservation_confirmed`, `reservation_waitlisted`, `service_request_received`, `service_request_responded`, `listing_hidden_by_admin`. Triggers fire on each state transition. Existing `Notifications` UI picks them up via the deep-link field.

### 9. Components & files

**New atomic components** (each ≤150 LOC):
- `src/components/hatchery/`: `HatcheryProfileHero`, `BatchCard`, `BatchProgressBar`, `BatchForm`, `ReservationForm`, `ReservationRow`, `ReservationStatusPill`, `BatchEventTimeline`, `PermitUploadField`, onboarding step files.
- `src/components/services/`: `ServiceProfileCard`, `ServiceProfileForm`, `QuoteRequestForm`, `QuoteRow`, `QuoteStatusPill`.
- `src/components/admin/`: `AdminAuditLog`, `ActionConfirmDialog` (reason-required destructive action shell).
- `src/components/post/CategoryFieldsSwitcher.tsx` — renders the right field set per `top_category`.
- `src/lib/`: `categories.ts` (canonical enums + labels), `reservation-status.ts`, `quote-status.ts`, `idempotency.ts`, `audit.ts`.

**Deleted / replaced**:
- `src/lib/hatcheries-data.ts` and `src/lib/services-data.ts` removed; seed rows ported into the migration as one-time `INSERT … ON CONFLICT DO NOTHING` for the existing curated names so the directory isn't empty on launch.

**Compliance doc**:
- `docs/hatchery-compliance.md` — Ghana VSD permits, Fisheries Commission aquaculture licence, EPA, district assembly permit; data fields we already capture (`permit_number`, `permit_authority`, `permit_doc_path`) for future automated registry checks. Documented but not enforced.

### 10. Out of scope (documented only)

Automated permit registry checks, escrow/payments, SMS/WhatsApp Business API push, dispute flows, waitlist auto-promotion, ratings/reviews submission UI (table exists but UI ships as read-only "Coming soon"). All captured in `docs/hatchery-compliance.md` and `docs/expanded-workflows-roadmap.md`.

### Acceptance gates

1. Hatchery onboarding → admin approval → batch creation → buyer reservation → hatchery confirm → buyer sees `confirmed` in dashboard. End-to-end on mobile + desktop.
2. Two concurrent confirm calls on the same batch never oversell (SQL `FOR UPDATE` proven).
3. Service request submitted → provider responds → buyer sees update.
4. Posting an `agromed_veterinary` listing without `expires_on` is rejected with the spec's `VALIDATION_ERROR` envelope.
5. Suspending a user hides their active listings + service profile + hatchery from public discovery.
6. Every admin destructive action writes an `admin_audit_logs` row with reason.

