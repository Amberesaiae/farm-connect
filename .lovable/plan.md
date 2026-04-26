## The problem (taken seriously)

Categories and "market types" right now are **not designed** — they are scattered hardcoded literals across files that disagree with each other, with no single source of truth and no DB-side guardrails. Concretely:

1. **Three competing livestock vocabularies** that don't agree:
   - `src/lib/constants.ts → LIVESTOCK_CATEGORIES` uses singular: `goat`, `pig`, `rabbit`.
   - `src/lib/categories.ts → LIVESTOCK_SUBCATEGORIES` uses plural: `goats`, `pigs`, `rabbits`.
   - `src/components/home/CategoryStrip.tsx` has its **own** inline list (singular: `goat`, `pig`).
   - Result: the home `CategoryStrip` writes `?category=goat` to the URL, but listings posted via the wizard save `subcategory_slug=goats`. Filters silently miss everything. We just haven't seen it because the listings table is empty (confirmed: 0 rows).

2. **Two parallel concepts collide on the listings table**:
   - `listings.category` (legacy free-text, e.g. `cattle`/`goat`) — written by the post wizard as `category: subcategory_slug ?? topCategory`, so it now stores either a livestock slug **or** a pillar string. It's used by `HeroOffer` (`heroForCategory`), the home strip filter, and the listing detail page.
   - `listings.subcategory_slug` (new, per-pillar) — only used by the new wizard. Most older code ignores it.
   - There's no enum/CHECK/lookup table — anything goes. Storage is `text` with no validation.

3. **Pillar enum exists in code only**. `top_category` is `text` with default `'livestock'`. The 4 valid values (`livestock`, `agrofeed_supplements`, `agromed_veterinary`, `agro_equipment_tools`) live in TS only — `agro_vendor_stores.pillar`, `listings.top_category`, and the autolink trigger all rely on string equality with no DB constraint.

4. **Hatcheries and Services have their own siloed enums** (`HATCHERY_CATEGORIES`, `SERVICE_CATEGORIES`) duplicated between `src/lib/categories.ts` and the placeholder data files (`hatcheries-data.ts`, `services-data.ts`), with no link to the marketplace pillars or to the listings taxonomy. There is no concept of "Veterinary services" being related to "Agromed/Veterinary" listings, even though they're the same domain to a user.

5. **Hardcoded UI lists everywhere.** `CategoryStrip`, `TopCategoryTabs`, hatchery filter chips, services filter chips, the wizard's `CategoryFieldsSwitcher`, `HeroOffer`, the post-wizard zod enum for `top_category`, and the admin filters — each rebuilds the list inline. Adding "Goose" or "Quail" today means editing 6+ files and hoping nothing drifts.

6. **No human-friendly labels on the data layer.** Filter chips and breadcrumbs rebuild labels by hand (`search.category[0].toUpperCase() + search.category.slice(1)` produces `"Goats"` from `"goats"` but `"Goat"` from `"goat"` — yet another silent fork).

7. **No DB validation of valid combinations.** Nothing prevents a listing with `top_category=livestock` and `subcategory_slug=vaccine`, or `top_category=agromed_veterinary` and `category=cattle`. Required fields per pillar (e.g. `expires_on` for veterinary, `condition` for equipment) are enforced by the wizard alone — admin tools and a future API would bypass them.

## The plan (one taxonomy, one source, end-to-end)

### Section A — A single canonical taxonomy in the database

Create three small lookup tables that define the marketplace shape. They are seeded data, RLS-public-read, admin-write. They become the source of truth for everything.

```text
market_pillars                     (the 4 marketplace verticals)
├─ slug PK            text         e.g. 'livestock', 'agromed_veterinary'
├─ label              text         "Livestock"
├─ short_label        text         "Livestock"
├─ icon_key           text         "cattle" (for CategoryIcon)
├─ sort_order         int
├─ description        text
└─ requires_*         bool flags   requires_expiry, requires_condition,
                                   requires_licence (drives wizard rules)

market_categories                  (the second level, scoped per pillar)
├─ id PK              uuid
├─ pillar_slug FK     text → market_pillars.slug
├─ slug               text         unique within pillar
├─ label              text         "Cattle", "Layer mash", "Vaccine"
├─ icon_key           text         optional
├─ sort_order         int
├─ is_active          bool
└─ unique (pillar_slug, slug)

market_category_synonyms           (legacy slug aliases → canonical)
├─ pillar_slug + alias_slug PK     e.g. ('livestock','goat')   → 'goats'
└─ canonical_slug FK               so old URLs and the home strip keep working
```

A small set of helper rules:

- **Single canonical slug per concept**: `goats`, `pigs`, `rabbits`, `cattle`, `sheep`, `poultry`, `fish` (plural where biologically a group; canonical livestock list).
- Synonyms table absorbs the mismatched legacy ones (`goat`, `pig`, `rabbit`) so old saved URLs / shared links still route correctly.
- Hatchery and service categories also live in `market_categories` under new pillars `hatcheries` and `services` — so there's **one** taxonomy table, not three.

Final pillar set:

```text
livestock              · marketplace listings
agrofeed_supplements   · marketplace listings
agromed_veterinary     · marketplace listings  (requires expiry + licence)
agro_equipment_tools   · marketplace listings  (requires condition)
hatcheries             · hatchery directory
services               · provider directory
```

### Section B — DB constraints to make invalid states unrepresentable

- Add a CHECK on `listings`: `top_category` must be one of the 4 marketplace pillar slugs (validated by trigger against `market_pillars` since CHECK can't reference tables).
- Add a trigger on `listings` BEFORE INSERT/UPDATE that:
  - Looks up `(top_category, subcategory_slug)` in `market_categories`. If the pair doesn't match a row (after applying synonyms), reject with a clear error.
  - Enforces `requires_*` flags (e.g. agromed → `expires_on NOT NULL`, equipment → `condition IN ('new','used')`).
  - Normalizes `subcategory_slug` through the synonyms table (so an inbound `goat` is rewritten to `goats`).
- Same trigger pattern on `agro_vendor_stores.pillar` (only the 3 sellable pillars allowed there: agrofeed, agromed, equipment).
- Same trigger pattern on `hatcheries.category` and `service_profiles.category` against the relevant pillar's category set.
- Drop or repurpose the legacy `listings.category` column. Two options here — please pick one in approval feedback or we go with **Option 1**:
  - **Option 1 (recommended)**: keep `listings.category` populated by the trigger as a denormalized copy of the canonical `subcategory_slug` (or `top_category` when there is no sub). All reads should switch to `top_category` + `subcategory_slug`, but old code keeps working during the migration.
  - **Option 2**: drop `listings.category` entirely after migrating all readers.

### Section C — A single TypeScript module backed by the DB

`src/lib/taxonomy.ts` becomes the **only** place the frontend talks about pillars and categories.

- A server function `getTaxonomy()` (cached per request) returns a fully-typed snapshot:
  ```ts
  type Taxonomy = {
    pillars: Pillar[];                          // sorted
    categoriesByPillar: Record<PillarSlug, Category[]>;
    findCategory(pillar, slug | alias): Category | null;
    labelFor(pillar, slug): string;
    iconFor(pillar, slug): string;
  };
  ```
- Loaded once in the root route's `beforeLoad` and stashed on router context, so every route/component gets it via `Route.useRouteContext()` — no fetch waterfall, no prop drilling.
- TanStack Query caches it with a 1h `staleTime` so admin edits propagate quickly without per-page refetches.
- Delete `LIVESTOCK_CATEGORIES` from `constants.ts`, delete the inline array in `CategoryStrip`, delete `LIVESTOCK_SUBCATEGORIES`/`AGROFEED_SUBCATEGORIES`/`AGROMED_SUBCATEGORIES`/`EQUIPMENT_SUBCATEGORIES`/`HATCHERY_CATEGORIES`/`SERVICE_CATEGORIES` from `categories.ts`. They all become derived views on the taxonomy snapshot.

### Section D — Wire every page to the taxonomy

Replace hardcoded lists in:

- `src/components/home/CategoryStrip.tsx` — render from `taxonomy.categoriesByPillar.livestock`. Icons come from each row's `icon_key`.
- `src/components/listing/TopCategoryTabs.tsx` — render from `taxonomy.pillars` filtered to the 4 marketplace pillars.
- `src/routes/listings.tsx` — `validateSearch` validates `topCategory` and `subcategory` against the taxonomy (with synonym remap on read), the loader queries by canonical slugs, the heading uses `taxonomy.labelFor(...)` instead of the manual capitalisation hack, and a hero image map keyed on `icon_key`.
- `src/routes/hatcheries.tsx` and `src/routes/services.tsx` — filter chips read from `taxonomy.categoriesByPillar.hatcheries` / `.services`.
- `src/components/post/CategoryFieldsSwitcher.tsx` — subcategory `<Select>` is fed by `taxonomy.categoriesByPillar[topCategory]`. The conditional field sets stay (they're per-pillar UI), but they read `requires_*` flags from the pillar row to label fields with `*` and to choose `required` on the input.
- `src/routes/_authenticated/post.tsx` — the zod schema for `top_category` is built from the taxonomy (e.g. `z.enum(taxonomy.pillars.map(p => p.slug) as [string, ...string[]])`). The wizard rejects invalid pairs client-side; the trigger in Section B is the server-side belt.
- `src/components/services/ServiceProfileForm.tsx` and `src/routes/_authenticated/dashboard.hatchery.onboarding.tsx` — same treatment.
- `src/lib/hero-image.ts` and `HeroOffer` — keyed off the canonical icon_key, with a graceful fallback. We also stop relying on the legacy `category` URL param: `HeroOffer` takes `topCategory` + `subcategory`.
- Admin filter dropdowns in `admin.listings.tsx` / `admin.hatcheries.tsx` / `admin.stores.tsx` — same taxonomy source.

### Section E — Admin "Marketplace structure" screen

A new page at `/admin/taxonomy` lets admins:

- Reorder pillars (drag handle → updates `sort_order`).
- Add/rename/deactivate categories per pillar.
- Edit `requires_*` rules per pillar.
- Add a synonym (e.g. when migrating an existing slug).

This is the payoff: adding "Quail" under poultry, or splitting "Vaccines" into "Live vaccines" / "Inactivated vaccines", becomes a 30-second admin action with no deploy.

### Section F — Migration path (safe, reversible, no broken links)

Do this in three database migrations and one code sweep:

1. **Migration 1**: create `market_pillars`, `market_categories`, `market_category_synonyms`, seed the canonical set, populate synonyms for the singular livestock slugs (`goat → goats`, `pig → pigs`, `rabbit → rabbits`). Add the validation triggers but in **warn-only mode** (RAISE WARNING) at first.
2. **Code sweep**: refactor every file in Section D to use the taxonomy. No behaviour change for users; URLs continue to work via synonyms.
3. **Migration 2**: flip the triggers to **reject** invalid combinations. Backfill `listings.category` from the canonical slugs (table is empty today, so this is a no-op risk-wise but the code path is still needed for safety).
4. **Migration 3 (optional, follow-up)**: drop `listings.category` once we're confident, or keep it as a denormalized convenience column — see Option 1/2 in Section B.

### Section G — What this solves, concretely

- One place to add a category. One place to rename. One place to reorder.
- URLs like `/listings?category=goat` from old shares still resolve (synonym), but the canonical link going forward is `/listings?topCategory=livestock&subcategory=goats`.
- The post wizard, the listings filter, the home strip, the admin panel, the hatchery directory, and the service directory **cannot** drift apart because they all read the same snapshot.
- Per-pillar rules (expiry, condition, licence) are enforced at the database, not just by the wizard, so any future edge function or admin tool inherits them for free.
- "Add a new pillar" (e.g. "Cold chain") becomes: add a row to `market_pillars`, add categories under it, optionally tweak the wizard's pillar-specific UI block. No frontend rewrites.

### Technical details

- Tables: `market_pillars (slug PK)`, `market_categories (id PK, pillar_slug FK, slug, unique(pillar_slug, slug))`, `market_category_synonyms (pillar_slug, alias_slug, PK both, canonical_slug)`.
- RLS: public SELECT on all three; admin INSERT/UPDATE/DELETE via `has_role(auth.uid(), 'admin')`.
- Trigger function `validate_listing_category()` BEFORE INSERT/UPDATE on `listings`: normalize via synonyms, lookup `(top_category, subcategory_slug)` in `market_categories`, enforce `requires_*` rules from the pillar row, mirror canonical slug into `category`. Same pattern for `agro_vendor_stores`, `hatcheries`, `service_profiles`.
- Server fn `getTaxonomy()` in `src/server/taxonomy.functions.ts`, cached via TanStack Query with a stable key. Loaded in `__root.tsx` `beforeLoad`. Exposed through router context typing so `Route.useRouteContext().taxonomy` is fully typed everywhere.
- Files removed: hardcoded arrays in `src/lib/constants.ts` (`LIVESTOCK_CATEGORIES`), `src/components/home/CategoryStrip.tsx` (inline `CATEGORIES`), most of `src/lib/categories.ts` (kept only as type re-exports).
- Files added: `supabase/migrations/<ts>_market_taxonomy.sql`, `src/lib/taxonomy.ts`, `src/server/taxonomy.functions.ts`, `src/routes/_authenticated/admin.taxonomy.tsx`.
- Files refactored: `src/components/home/CategoryStrip.tsx`, `src/components/listing/TopCategoryTabs.tsx`, `src/components/post/CategoryFieldsSwitcher.tsx`, `src/components/services/ServiceProfileForm.tsx`, `src/routes/listings.tsx`, `src/routes/hatcheries.tsx`, `src/routes/services.tsx`, `src/routes/listings.$id.tsx`, `src/routes/_authenticated/post.tsx`, `src/routes/_authenticated/dashboard.hatchery.onboarding.tsx`, `src/lib/hero-image.ts`, admin filter screens.
- Backwards compatibility: synonyms table makes `?category=goat`, `?category=pig`, `?category=rabbit` continue to work transparently.

### Open question for you before we build

Two things worth confirming so the migration goes the way you want:

1. **Legacy `listings.category` column** — Option 1 (keep as denormalized canonical mirror, populated by trigger) or Option 2 (drop entirely after refactor). Option 1 is safer; Option 2 is cleaner.
2. **Admin "Marketplace structure" screen (Section E)** — build it now as part of this work, or ship the taxonomy + refactor first and add the admin UI in a follow-up? The DB is ready either way; the screen is purely operational.

If you don't have a strong preference, we'll go with **Option 1** and **build the admin UI now** — it's the configuration that makes the whole investment pay off.