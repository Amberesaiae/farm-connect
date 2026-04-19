

The user is reframing: instead of stores being only for the three agro pillars, **every vendor type gets a storefront**, but each pillar's storefront has pillar-specific aspects matching what's already been built.

Today's reality:
- Hatcheries already have storefronts (`hatcheries` table, `/hatcheries/$slug`) — sell **batches + reservations**.
- Service providers already have storefronts (`service_profiles`, `/services/$slug`) — sell **quote requests**.
- Agro pillars (feed, agromed, equipment) sell **catalogued listings + WhatsApp**.
- Livestock sellers are peer-to-peer with no shop identity.

So the user's question is really: should we unify these under one "Vendor Store" umbrella so every seller has a public profile page, with pillar-specific commerce mechanics layered on top?

Yes — this is a cleaner mental model. One identity layer, three commerce mechanics. Plan below.

---

## Unified Vendor Stores — one identity, pillar-specific commerce

Every vendor in Farmlink gets a public storefront. The storefront identity (cover, blurb, location, badge, hours) is shared across all vendor types. The **commerce surface** inside each store differs by pillar — that's what's already been built and we keep it.

### Mental model

```text
                     ┌──────────────────────┐
                     │   vendor_stores      │  ← one identity layer
                     │   (slug, cover,      │     for everyone
                     │    blurb, location,  │
                     │    contact, hours)   │
                     └──────────┬───────────┘
                                │ pillar
            ┌───────────────────┼─────────────────────┐
            ▼                   ▼                     ▼
   ┌──────────────┐    ┌──────────────────┐   ┌────────────────┐
   │  hatchery    │    │  services        │   │  agro pillars  │
   │  → batches + │    │  → quote         │   │  → listings +  │
   │  reservations│    │    requests      │   │   WhatsApp     │
   └──────────────┘    └──────────────────┘   └────────────────┘
   (livestock peer sellers stay flat — no store required)
```

### What changes vs the previous plan

- **No new `vendor_stores` table.** We'd be duplicating `hatcheries` + `service_profiles`. Instead we extend what exists and add **one** new table only for the agro pillars.
- The unified surface is a **read model** (a view + shared component), not a new physical table. Each vendor type keeps its specialised columns.

### Schema (one migration, additive)

1. **New table `agro_vendor_stores`** — for feed / agromed / equipment dealers (mirrors `hatcheries` shape exactly):
   `id, owner_id, slug, business_name, pillar (CHECK in agrofeed/agromed/equipment), blurb, cover_path, logo_path, region, district, address, whatsapp_e164, phone_e164, email, delivers, delivery_regions[], min_order_ghs, business_hours jsonb, business_reg_number, vsd_licence_number, licence_doc_path, status (draft/pending_review/approved/suspended/rejected), approved_by, approved_at, rejection_reason, is_active, badge_tier, listing_count, created_at, updated_at`.
2. **Extend `listings`** with `vendor_store_id uuid` (nullable). Trigger auto-links new agro listings to the seller's approved store + maintains `listing_count`.
3. **Add shared columns to all three vendor tables** (only those missing):
   - `hatcheries`, `service_profiles`, `agro_vendor_stores` all get: `logo_path`, `phone_e164`, `business_hours jsonb`, `address` (already on hatcheries — skip there).
4. **New SQL view `public.vendor_stores_v`** — UNION ALL across the three tables exposing the **shared identity columns** (`store_kind`, `id`, `owner_id`, `slug`, `name`, `pillar_or_category`, `region`, `cover_path`, `logo_path`, `blurb`, `badge_tier`, `is_public`). Backs the unified `/stores` directory and search.
5. **RLS** — copies the proven hatchery pattern on `agro_vendor_stores` (public read approved + active, owner RW, admin all). View inherits underlying RLS.
6. **Storage** — reuse `listing-photos` for covers/logos, reuse `hatchery-permits` bucket renamed conceptually to "vendor-licences" by adding a second bucket `vendor-licences` (private).
7. **Notifications enum** — additive: `agro_store_approved`, `agro_store_rejected`, `agro_store_suspended`.

### Vendor experience — one entry, three flows

`/_authenticated/dashboard.store.tsx` becomes the **single vendor hub**. On first visit it asks "What do you sell?" → routes the user into the right onboarding wizard:
- Hatchery → existing `dashboard.hatchery.onboarding` (already built).
- Services → existing service profile editor (already built).
- Feed / Agromed / Equipment → **new** `dashboard.store.agro.onboarding.tsx` (4 steps: business, location & delivery, commerce settings, compliance + review). Mirrors hatchery wizard structure.

A vendor can have **multiple stores** (e.g., a hatchery operator also runs a feed shop) — same `owner_id` across rows.

The dashboard hub shows tiles for each store the user owns with status + quick links. Existing per-pillar dashboards (`dashboard.hatchery.*`, `dashboard.provider.*`) keep working unchanged.

### Buyer experience — unified discovery

- `/stores` — **new unified directory** powered by `vendor_stores_v`. Top tab strip: All · Hatcheries · Services · Feed · Agromed · Equipment. Region filter + search.
- Each tile uses a single `<StoreCard kind="...">` that branches its CTA: hatchery → "View batches", services → "Request quote", agro → "Browse catalogue".
- `/hatcheries/$slug`, `/services/$slug` keep their existing URLs (no breaking changes). New: `/stores/$slug` (agro) for feed/agromed/equipment shops with catalogue grid + WhatsApp CTA.
- `/listings/$id` sidebar: when the listing belongs to an agro store, show `<StorefrontCard>` linking to the store; falls back to the existing `<SellerCard>` for peer-to-peer livestock.
- `ListingCard` gets a "Sold by [Store]" chip only when `vendor_store_id` is set.

### Admin & moderation

- Existing `/admin/hatcheries` queue stays.
- New `/admin/stores` queue for agro stores (same UI shell as hatcheries: pending list, signed-URL licence preview, approve/reject with audited reason).
- Suspending a user already cascades via `is_active` / `status` on the existing tables — extend the same logic to `agro_vendor_stores`.
- `AdminAuditLog` picks up the new action types automatically (e.g., `agro_store.approve`).

### Server functions

`src/server/agro-stores.functions.ts` — `submitAgroStoreApplication`, `updateAgroStore`, `moderateAgroStore`, `linkListingToStore`. Same patterns as `hatcheries.functions.ts`.

### Why this is better than the previous proposal

- **No duplicated identity** — we don't end up with `hatcheries.blurb` AND `vendor_stores.blurb` for the same business.
- **Pillar-specific columns stay where they belong** — hatcheries keep `permit_authority`, services keep `coverage_regions`, agro stores get their own delivery + licence fields.
- **One discovery surface** for buyers (`/stores`), three native commerce flows behind it.
- **Backwards compatible** — every existing route, dashboard, and RLS policy keeps working.

### Out of scope (documented in `docs/vendor-stores-roadmap.md`)

Multi-pillar single store, in-store search/sort, store ratings UI, in-app checkout, ad placements, store analytics dashboards, shared inventory/stock-sync. v2.

### Acceptance gates

1. A user can own a hatchery + an agro store + a service profile under one account; all three appear on `/stores` filtered by kind.
2. An agromed dealer onboards → admin approves → existing agromed listings auto-link → store appears with catalogue.
3. Suspending a user removes all their stores (hatchery, services, agro) from `/stores` in one action.
4. The same `slug` cannot be claimed across `hatcheries`, `service_profiles`, or `agro_vendor_stores` (cross-table uniqueness enforced via trigger).
5. Livestock-only peer sellers still post and contact via WhatsApp without any storefront — store is opt-in.

### Files (high-level)

**New**: migration; `src/server/agro-stores.functions.ts`; `src/lib/agro-store-status.ts`; `src/components/store/{StoreCard,StoreHero,StoreCatalogueGrid,StorefrontCard,LicenceUploadField,AgroStoreOnboardingStep{1..4}}.tsx`; `src/routes/stores.tsx`; `src/routes/stores.$slug.tsx`; `src/routes/_authenticated/dashboard.store.tsx` (hub); `src/routes/_authenticated/dashboard.store.agro.onboarding.tsx`; `src/routes/_authenticated/admin.stores.tsx`; `docs/vendor-stores-roadmap.md`.

**Edited**: `src/components/listing/ListingCard.tsx` (store chip); `src/routes/listings.$id.tsx` (StorefrontCard); `src/routes/_authenticated/post.tsx` ("Add to my store" toggle); `src/components/layout/{TopNav,AdminNav}.tsx`.

