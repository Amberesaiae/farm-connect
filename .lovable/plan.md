# Authorization, RBAC & Security — Marketplace Plan (Jiji/Tonaton-style)

## Why the previous plan was incomplete

It treated "authorization" as mostly an admin problem. A marketplace like Jiji/Tonaton has **five distinct actor classes** with very different rights, plus a **trust ladder** that gates risky actions (contact reveal, posting, selling, vendor onboarding). This plan models all of them, end-to-end, backend-first.

## Actor model

| Actor | How identified | Examples of what they can do | What they cannot |
|---|---|---|---|
| **Visitor** (anon) | No session | Browse listings, hatcheries, services, stores; search & filter; view public profile cards; tap "Reveal contact" → prompted to sign in; log a *throttled* view event | Save, message, post, reserve, request a service, see raw phone numbers, write reviews |
| **Buyer** (default authed) | Session, default role `buyer` in `user_roles` | Save listings, reveal seller contact (rate-limited), open WhatsApp, place batch reservations, request a service, leave a review after a transaction, report a listing | Post listings until **phone-verified**; create a hatchery/store/service profile until **ID-verified** |
| **Seller (C2C)** | Buyer + `phone_verified=true` | Post up to N active listings, edit/delete own, mark sold, respond to buyer contacts | Run a vendor store, hatchery, or service profile |
| **Verified Seller** | Seller + approved `verification_submission` | Higher listing cap, "Verified" badge, eligible for trade-count badges (`trusted`, `top_seller`), eligible to onboard as hatchery/store/provider | Moderate others |
| **Vendor / Hatchery owner / Service provider** | Verified Seller + role `agro_vendor` / `hatchery_owner` / `service_provider` granted by approved onboarding | Manage own store/hatchery/profile; create batches; receive & respond to reservations and service requests; access provider dashboard | Touch other vendors' data |
| **Moderator** | `user_roles.role = 'moderator'` | Hide/restore listings, resolve reports, approve verifications, approve hatchery/store onboarding | Suspend users, change roles, edit taxonomy |
| **Admin** | `user_roles.role = 'admin'` | Everything moderator can + suspend users, grant/revoke roles, edit taxonomy, delete content, read audit log | — |

`buyer` is the implicit baseline assigned to every signed-in user. All other roles are **additive** rows in `user_roles`.

## Trust ladder (gates, not roles)

These are boolean attributes attached to the user, *not* roles. A buyer can post without ever becoming a "seller role"; the gate is `phone_verified`. Roles are for capabilities; gates are for risk.

| Gate | How earned | What it unlocks |
|---|---|---|
| `email_confirmed` | Standard email link | Sign-in itself |
| `phone_verified` | OTP via SMS/WhatsApp | Posting any listing, contacting sellers, placing reservations |
| `id_verified` | Approved Ghana Card + selfie (`verification_submissions`) | Verified badge; eligibility for hatchery/store/provider onboarding; higher post limits |
| `business_licensed` | Approved licence doc on `agro_vendor_stores` / `hatcheries` | Can sell vet/pharma categories; can list as a registered vendor |

These live in a single `user_trust` view (computed) so RLS policies and middleware reference one source.

## Rights matrix (what each actor can do per resource)

```text
Resource                | Visitor | Buyer | Seller | Verified | Vendor/Hatchery/Provider | Mod | Admin
------------------------|---------|-------|--------|----------|--------------------------|-----|------
listings.read (active)  |   ✓     |   ✓   |   ✓    |    ✓     |            ✓             |  ✓  |  ✓
listings.create         |   ✗     |  gate*|   ✓    |    ✓     |            ✓             |  ✓  |  ✓
listings.update own     |   —     |   —   |   ✓    |    ✓     |            ✓             |  ✓  |  ✓
listings.delete any     |   ✗     |   ✗   |   ✗    |    ✗     |            ✗             |  ✗  |  ✓
listings.hide any       |   ✗     |   ✗   |   ✗    |    ✗     |            ✗             |  ✓  |  ✓
saved_listings.write    |   ✗     |   ✓   |   ✓    |    ✓     |            ✓             |  ✓  |  ✓
contact reveal          |  prompt |  rl** |  rl    |    rl    |            rl            |  ✓  |  ✓
reservations.create     |   ✗     |  gate |   ✓    |    ✓     |            ✓             |  ✓  |  ✓
reservations.confirm    |   —     |   —   |   —    |    —     |  owner only              |  ✓  |  ✓
service_requests.create |   ✗     |  gate |   ✓    |    ✓     |            ✓             |  ✓  |  ✓
service_requests.respond|   —     |   —   |   —    |    —     |  provider only           |  ✓  |  ✓
hatcheries.create       |   ✗     |   ✗   |   ✗    |   ✓†     |            ✓             |  ✓  |  ✓
agro_store.create       |   ✗     |   ✗   |   ✗    |   ✓†     |            ✓             |  ✓  |  ✓
service_profile.create  |   ✗     |   ✗   |   ✗    |   ✓†     |            ✓             |  ✓  |  ✓
admin_audit_logs.read   |   ✗     |   ✗   |   ✗    |    ✗     |            ✗             |  ✓  |  ✓
user_roles.write        |   ✗     |   ✗   |   ✗    |    ✗     |            ✗             |  ✗  |  ✓
taxonomy.write          |   ✗     |   ✗   |   ✗    |    ✗     |            ✗             |  ✗  |  ✓
reports.create          |   ✗     |   ✓   |   ✓    |    ✓     |            ✓             |  ✓  |  ✓
reviews.create          |   ✗     |  after txn   ✓ |    ✓     |            ✓             |  ✓  |  ✓
```

* `gate` = allowed only if the trust gate is satisfied (e.g. `phone_verified`).
* `rl` = allowed but rate-limited (per user + per IP).
* `†` = onboarding submission allowed; activation requires moderator approval.

## Principles (apply to every change)

1. **DB is the boundary.** RLS + DEFINER RPCs encode the matrix. UI is a hint; the API is the contract.
2. **Roles for capabilities, gates for risk.** Never conflate them.
3. **Default deny.** New tables get RLS on + zero policies, then policies added explicitly.
4. **Ownership via SQL helpers**, never via "trust the seller_id in the body".
5. **Rate-limit every anon-callable surface.** View, contact reveal, search, signup, OTP send.
6. **Audit privileged actions via triggers**, not application code.
7. **Least-privilege client.** `supabaseAdmin` only when RLS provably can't express the rule.
8. **Consistent error envelope.** `{ code, message }` so the UI knows whether to redirect to login, prompt verification, or just toast.

## Plan

### Phase 1 — DB foundations (one migration)

1. **Roles.** Extend `app_role` to: `admin`, `moderator`, `hatchery_owner`, `service_provider`, `agro_vendor`, `buyer`. Backfill `user_roles` from existing owner_id columns and from every `auth.users` (everyone gets `buyer`). Add a trigger on `handle_new_user` to insert the buyer row.
2. **Trust gates.** Add `profiles.phone_verified boolean`, `profiles.phone_verified_at`, `profiles.id_verified boolean` (mirrored from `verification_submissions.status='approved'` via trigger). Create view `public.user_trust` joining roles + gates for read convenience.
3. **Single role-resolution surface.** Keep `has_role(uuid, app_role)`; add `has_any_role(uuid, app_role[])`, `current_role_set()`, `current_trust()`.
4. **Owner helpers.** `owns_hatchery(uuid)`, `owns_service_profile(uuid)`, `owns_store(uuid)`, `owns_listing(uuid)`, `owns_batch(uuid)` already partial — make all DEFINER + `search_path=public`.
5. **RLS rewrite per table** using the matrix:
   - `listings`: insert requires `phone_verified`; update/delete restricted to `owns_listing OR has_role('admin')`; hide via moderator RPC only.
   - `batch_reservations`: insert requires `phone_verified`; confirm/cancel-by-owner via existing RPCs (already DEFINER — good).
   - `service_requests`: insert requires `phone_verified`; respond limited to `owns_service_profile`.
   - `hatcheries`/`agro_vendor_stores`/`service_profiles`: insert requires `id_verified`; status transitions to `approved` only via moderator RPC.
   - `saved_listings`: insert requires authenticated; one row per (user, listing).
   - `verification_submissions`: insert by owner only, one open submission at a time.
   - `taxonomy_audit_log`, `admin_audit_logs`: read = mod/admin; insert = trigger only.
   - `user_roles`: write = admin only; read = self or admin (already correct, harden).
6. **Anti-abuse RPCs and tables.**
   - `record_listing_view(_listing_id uuid)` + `listing_view_throttle(listing_id, ip_hash, hour_bucket)` — replaces the open `listing_events.view` insert.
   - `reveal_contact(_listing_id uuid)` returns the seller's `whatsapp_e164` *only if* caller is authed + phone-verified + under per-day cap; logs a `contact_whatsapp` event. Replaces the current pattern where the page query selects `whatsapp_e164` from `profiles` for any reader.
   - `report_content(_kind, _id, _reason)` writes to a new `reports` table (RLS: insert by any authed user, read by mods).
   - Lower `profiles` exposed columns: drop `whatsapp_e164` from the public read policy; create a `public_profiles` view that excludes contact fields.
7. **Audit triggers.** Generalise `tg_taxonomy_audit` into `tg_admin_audit`, attach to `listings` (status changes), `hatcheries`, `agro_vendor_stores`, `service_profiles` (status), `profiles` (status, role-relevant fields), `user_roles` (insert/delete), `verification_submissions` (decision).
8. **Auth hardening.** Enable HIBP leaked-password check; keep email confirmation on; add OTP table + RPC `send_phone_otp` / `verify_phone_otp` (server-side, with cooldown).

### Phase 2 — Server-function layer

1. **Middleware library** (`src/integrations/supabase/role-middleware.ts`):
   - `requireSession` — already exists as `requireSupabaseAuth`.
   - `requireRole(role)`, `requireAnyRole([...])` — DB-checked via `has_role`.
   - `requireGate('phone_verified' | 'id_verified' | 'business_licensed')` — checked against `profiles` / `user_trust`.
   - `requireOwnership(kind, idArg)` — calls the SQL `owns_*` helper with the user-scoped client.
   - `withRateLimit({ key, max, windowSec })` — backed by a small `rate_limits` table or Postgres `pg_advisory_lock` + a counter table.
   - All throw a typed `Response({ status, body: { code, message, requires? }})`. `requires` lets the client know to prompt sign-in / phone verify / ID verify.
2. **Replace `assertAdmin` everywhere.** Drop the local copies in `admin.functions.ts`, `agro-stores.functions.ts`, `hatcheries.functions.ts`, `listings.functions.ts`. Compose `requireRole('admin')` (or `requireAnyRole(['admin','moderator'])` for hide/restore).
3. **Restrict `supabaseAdmin`.** Audit all 11 importing files and split into:
   - **Elevated allowlist** (file suffix `.elevated.ts`, only places that may import `supabaseAdmin`): cross-tenant notifications, audit log inserts when not via trigger, signed-URL minting for verification docs, slug uniqueness scans across tables.
   - **Everything else** uses `context.supabase` so RLS applies. Examples to convert: listing view/contact counters (move to RPC), hatchery reads of own data, service request reads.
   - Add a tiny CI grep: `rg "supabaseAdmin" -g '!**/*.elevated.ts' -g '!src/integrations/supabase/client.server.ts' src/server` must return nothing.
4. **Anon-safe endpoints** (visitor flows):
   - `logView` → call new `record_listing_view` RPC (rate-limited per IP+listing+hour). No `supabaseAdmin`.
   - `revealContact` → new server fn, requires session + `phone_verified`, calls `reveal_contact` RPC. UI calls this before opening WhatsApp; current loader's `select(...whatsapp_e164)` is removed.
   - `searchListings` (if needed server-side) is anon-callable but rate-limited per IP.
5. **Posting flow** (`createListing`):
   - Middleware: `requireSession` → `requireGate('phone_verified')` → handler.
   - Per-user active-listings cap enforced in DB (function `assert_listing_quota(user_id)` called by trigger). Cap depends on trust: 5 unverified-phone (none today), 30 phone-verified, 100 id-verified, unlimited for vendors.
6. **Onboarding flows** (`submitHatchery`, `submitAgroStore`, `submitServiceProfile`):
   - Middleware: `requireGate('id_verified')`. Status starts `draft`, moves to `pending_review`. Approval = moderator RPC `approve_vendor(kind, id)` which sets status, grants the matching role via `promote_to_role`, writes audit, sends notification.
7. **Reservations / service requests / reviews / reports.** Each gets a thin server fn wrapping the DEFINER RPC; all use `requireGate('phone_verified')` for create.
8. **Standard error envelope.** `{ code: 'UNAUTHENTICATED'|'PHONE_VERIFICATION_REQUIRED'|'ID_VERIFICATION_REQUIRED'|'FORBIDDEN'|'RATE_LIMITED'|'NOT_FOUND'|'VALIDATION'|'CONFLICT', message, requires?, retryAfterSec? }`. The frontend hook maps these to: redirect to `/login?redirect=…`, open phone-verify modal, open ID-verify wizard, toast, etc.

### Phase 3 — Client / route layer

1. **Pathless layout routes** (replace ad-hoc `useEffect` redirects and `<AdminGate>`):
   - `_authenticated.tsx` → `beforeLoad` redirects to `/login` for unauthenticated visitors.
   - `_authenticated/_phone_verified.tsx` → gate posting & contact-reveal-heavy pages.
   - `_authenticated/_id_verified.tsx` → gate hatchery/store/provider onboarding pages.
   - `_authenticated/_admin.tsx`, `_authenticated/_moderator.tsx` → role gates. Move admin pages under these.
   - `_authenticated/_hatchery_owner.tsx`, `_provider.tsx`, `_vendor.tsx` → role gates for the dashboards.
2. **Roles + trust from a single hook.** New `getMySession()` server fn returns `{ user, roles, trust }` in one round-trip; cached in React Query (`staleTime: 60s`). `auth-context.tsx` keeps only the session; everything role/trust-related reads from this query. Removes the client-side `from('user_roles').select(...)` and the manual `refreshRoles`.
3. **Visitor UX patterns** (Jiji/Tonaton parity):
   - Listing detail shows a **masked** contact ("0244 ••• ••87") with a "Reveal" button. Tap → if no session → modal "Sign in to contact seller"; if no phone gate → modal "Verify your phone to contact seller". Success → calls `revealContact` server fn → opens WhatsApp.
   - Save button on cards: anon → modal "Sign in to save".
   - "Post" CTA in header always visible; click as anon → `/login?redirect=/post`; click as buyer without phone gate → opens phone-verify modal first.
   - Report button on every listing/profile (any authed user).
4. **Per-action capability hook.** `const { can, why } = useCan('listings.create')` returns false + reason (`needs_login` | `needs_phone` | `needs_id` | `forbidden`) so buttons can show the right CTA without copy-pasting logic.

### Phase 4 — Verification, observability, hygiene

1. Run `supabase--linter` and `security--run_security_scan`; resolve findings before merge.
2. Add `supabase/tests/rls.sql` covering: visitor / buyer / seller / vendor / moderator / admin against each table; assert visibility & write outcomes match the matrix.
3. Add `docs/security.md` documenting actor model, matrix, gates, RPC list, the "no `supabaseAdmin` outside `*.elevated.ts`" rule, and the error code contract.
4. Sentry-style logging for every 403/401 with `code` so we can see real-world friction.

## Technical details

**New tables / views:**
- `rate_limits(scope text, key text, window_start timestamptz, count int, primary key(scope,key,window_start))`
- `listing_view_throttle(listing_id uuid, ip_hash bytea, hour_bucket timestamptz, primary key(listing_id, ip_hash, hour_bucket))`
- `reports(id, reporter_id, target_kind, target_id, reason, status, created_at)` with RLS (insert authed, read mod+admin, update mod+admin).
- `phone_otps(user_id, code_hash, sent_at, attempts, consumed_at)` with strict RLS (no client read).
- `public_profiles` view exposing display name, avatar, badges — **without** `whatsapp_e164`.
- `user_trust` view joining `profiles` + role flags.

**New SQL functions:**
- `has_any_role(uuid, app_role[])`, `current_role_set()`, `current_trust()`.
- `owns_listing(uuid)`, `owns_batch(uuid)` (formalise existing inline checks).
- `record_listing_view(uuid)`, `reveal_contact(uuid)`, `report_content(text, uuid, text)`.
- `assert_listing_quota(uuid)` (called by `BEFORE INSERT` trigger on `listings`).
- `promote_to_role(app_role)`, `approve_vendor(text, uuid)`.
- `send_phone_otp(text)`, `verify_phone_otp(text)`.
- `tg_admin_audit()` generalised audit trigger.

**RLS revisions (highlights):**
- `profiles` SELECT policy split: full row for self/admin; the rest of the world reads via `public_profiles` view (no contact fields).
- `listing_events` INSERT for visitors becomes `WITH CHECK (false)` — only the `record_listing_view` RPC writes.
- `listings` INSERT policy adds `current_trust() ? 'phone_verified'` (or check via subquery on `profiles.phone_verified`).
- `hatcheries` / `agro_vendor_stores` / `service_profiles` INSERT requires `profiles.id_verified = true`; status `approved` only writable by `has_role(auth.uid(), 'moderator')` or admin.

**TS files:**
- `src/integrations/supabase/role-middleware.ts` (new) — middleware library.
- `src/integrations/supabase/errors.ts` (new) — typed Response builders + client mapper.
- `src/integrations/supabase/client.server.ts` — keep but mark; add allowlist comment.
- Convert `src/server/listings.functions.ts` `logView`/`logContactTap` to RPC calls; add `revealContact`.
- Convert `src/server/admin.functions.ts`, `agro-stores.functions.ts`, `hatcheries.functions.ts`, `verification.functions.ts` to use the new middleware; rename truly-elevated helpers to `*.elevated.ts`.
- New `src/server/reports.functions.ts`, `src/server/auth-otp.functions.ts`, `src/server/session.functions.ts` (`getMySession`).
- New hooks: `src/hooks/useMySession.ts`, `src/hooks/useCan.ts`.
- Routes: `src/routes/_authenticated.tsx` → `beforeLoad`; new `_authenticated/_phone_verified.tsx`, `_id_verified.tsx`, `_admin.tsx`, `_moderator.tsx`, `_hatchery_owner.tsx`, `_provider.tsx`, `_vendor.tsx`. Move existing files under the right gate.
- New components: `RevealContactButton`, `RequireSignInModal`, `RequirePhoneVerifyModal`, `RequireIdVerifyModal`.

**Out of scope (deliberate):**
- 2FA / TOTP for admins (follow-up).
- Reviews & ratings storage schema (referenced as a hook point only).
- Field-level encryption of verification docs (private bucket + signed URLs is acceptable for v1).
- Dropping `profiles.roles`/`active_role` columns — keep mirrored via trigger this release, drop next.

## Rollout order

1. **Phase 1 migration** — additive only; old code keeps working.
2. **Phase 2** — middleware + error envelope. Then convert server functions in this order so risk is staged: `admin.functions` → `verification.functions` → `listings.functions` (incl. new `reveal_contact`) → `hatcheries`/`agro-stores`/`service-profiles` → `reservations`/`service-requests`.
3. **Phase 3** — route gates + capability hook + visitor UX (reveal-contact masking, save-prompt, post-prompt).
4. **Phase 4** — RLS test suite, scans, docs.
5. **Follow-up migration** — drop deprecated `profiles.roles` and `profiles.active_role` columns once nothing reads them.

