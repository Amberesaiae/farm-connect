

## Farmlink Livestock Marketplace — Full MVP Pivot

Replace the current produce e-commerce shell with the Ghana livestock marketplace described in your docs. Frontend in TanStack Start, backend on Lovable Cloud (Supabase) with email + Google auth, RLS on every table, Cloudinary-style storage via Supabase Storage, and a separate `/admin` area gated by an allowlist.

### Backend (Lovable Cloud)

**Profiles** — yes, we need them (display_name, whatsapp_number, avatar, badge_tier, trade_count, listing_count, status). Auto-created from `auth.users` via trigger. Roles live in a separate `user_roles` table with `app_role` enum (`admin`, `user`) and a `has_role()` security-definer function — never on profiles.

**Tables** (all RLS-on, owner-scoped policies + admin-via-`has_role`):
- `profiles`, `user_roles`
- `listings` (status enum, price_unit enum, region/district, search_vector generated tsvector + GIN index, view_count, contact_count, expires_at)
- `listing_photos` (display_order, is_cover, storage path)
- `listing_events` (view / contact_whatsapp / save — actor_id nullable for view)
- `verification_submissions` (ghana_card_url, selfie_url, status, rejection_reason, reviewed_by)
- `saved_listings` (unique on user+listing)
- `notifications` (enquiry / verification_* / listing_expiring)

**Storage buckets**: `listing-photos` (public read), `verification-docs` (private, owner + admin read only).

**Server functions** (TanStack Start `createServerFn` with `requireSupabaseAuth`): create/update/relist listing, log contact-tap, submit verification, admin approve/reject, mark sold (badge tier recompute). `pg_cron` nightly job sets expired listings.

### Frontend route map

```text
/                       Landing → redirects to /listings
/listings               Browse: search + category/region/price/verified filters, cursor pagination
/listings/$id           Detail: photo carousel, seller card with badge, WhatsApp CTA, save, more from seller
/login                  Email + Google, redirect-back via search param
/post                   3-step wizard (Animal → Pricing/Location → Photos/Description) [auth]
/dashboard              Seller: active / expired / sold tabs + enquiries inbox [auth]
/dashboard/listings/$id/edit
/dashboard/verification Submit Ghana Card + selfie, see status [auth]
/saved                  Saved listings [auth]
/admin                  Login gate (allowlist via user_roles)
/admin/verifications    Queue: approve / reject with reason
/admin/listings         Moderation: hide / restore / delete
/admin/users            Suspend / unsuspend
```

Pathless layout routes `_authenticated.tsx` and `_admin.tsx` (nested under `_authenticated`) enforce guards in `beforeLoad` via router context.

### Atomic component inventory
- Layout: `AppShell`, `TopNav` (logo + search + Sign in / Post listing), `MobileTabBar` (Browse / Saved / Post / Dashboard)
- Listings: `ListingCard`, `ListingGrid`, `FilterBar`, `PhotoCarousel`, `SellerCard`, `BadgeChip`, `WhatsAppCTA`, `SaveButton`
- Wizard: `WizardProgress`, `Step1Animal`, `Step2Pricing`, `Step3Photos`, `PhotoUploader` (direct-to-storage with progress)
- Dashboard: `ListingRow`, `EnquiryItem`, `StatusTabs`, `RelistButton`
- Verification: `VerificationStatusCard`, `IdUploader`, `RejectionBanner`
- Admin: `QueueRow`, `DecisionDialog`, `ModerationActions`
- Primitives reuse existing shadcn/ui (Button, Input, Select, Dialog, Tabs, Badge, Card, Sheet, Toast)

### Visual direction
Replace the green/white phone-frame mock with a clean web layout: white surface, neutral slate text, single accent (Farmlink green for primary, WhatsApp green `#25D366` only on the contact CTA). Onest stays. Mobile-first responsive — no fake phone bezel; the app is a real website that looks great on a 360px Android browser and scales up to desktop.

### Validation & security
- Zod schemas on every form, mirrored on the server function `inputValidator`
- WhatsApp numbers normalised to E.164, `wa.me/` URLs use `encodeURIComponent` for prefilled message
- Storage RLS restricts verification-doc reads to owner + admins
- `has_role()` security-definer function for all admin checks (no role-on-profile)
- Leaked password check enabled

### Build phases
1. Cloud + schema + RLS + storage + seed admin role
2. Auth (email + Google) + profile bootstrap trigger
3. Public browse + detail + WhatsApp CTA (read-only)
4. Post-listing wizard + photo upload + dashboard
5. Save listings + enquiries + relist + 60-day expiry
6. Verification submission + admin queue + badge tier logic
7. Admin moderation + user suspension
8. Polish: empty states, loading skeletons, error boundaries on every loader route, og:image per listing detail

### Out of scope (stays out per your docs)
SMS (Arkesel), Paystack/escrow, reviews, AI features, semantic search, market price ticker.

### Open question to confirm before building
Google OAuth needs the redirect URL configured in Google Cloud Console. I'll wire the code path; you'll need to add the redirect URL after the first deploy. Email + password works immediately.

