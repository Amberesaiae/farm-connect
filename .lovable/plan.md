## Why this needs a deeper rewrite

What's in the DB right now is only a **flat** pillar → category list (6 pillars, ~40 categories, 4 synonyms). It's a lookup table, not a taxonomy. Every other concern is still hardcoded in React:

- **No depth.** "Poultry" can't have "Layers / Broilers / Local / Cockerels". "Vaccine" can't have "Newcastle / Gumboro / Marek's". The wizard, the filters, and the hero strip all live with a 2-level world.
- **No attribute schema in the DB.** The wizard's per-pillar field sets (`breed`, `age_months`, `pack_size`, `active_ingredient`, `condition`…) are written into JSX, with no validation, no labels, no unit catalog, no per-category overrides. A new pillar means rewriting `CategoryFieldsSwitcher.tsx`.
- **Breeds, units, conditions, sexes — all stringly typed.** `breed` is free-text, so "Sanga", "Sanga cattle", "sanga" and "Songa" are 4 different things. There is no catalog and no autocomplete.
- **No locale / regional naming.** "Goat" in Twi is "Aponkye"; in Ga it's "Tewi". A buyer searching local terms finds nothing. Synonyms today only handle plural/singular.
- **No facets.** `/listings` has no per-pillar filter set (e.g. for Agromed: "withdrawal period", "for poultry only"; for Equipment: "capacity", "power source"). Filters are ad-hoc text on top of a flat schema.
- **No lifecycle / governance.** Categories can't be deprecated, merged, or split. There's no "promoted" flag for pinning the top 6 on the home strip. There's no audit of who changed what.
- **Hatcheries and services use a different shape than listings.** The autolink trigger and the wizard treat pillar literals differently. There's no shared concept of "this category accepts vendor stores" vs "this is a directory only".

The first migration unified labels. This plan finishes the job: **the database describes the shape of every listing**, and the frontend is a pure renderer of that shape.

## Goals

1. **One taxonomy, three depths.** `pillar → category → subcategory (optional)`, with hierarchy stored as an adjacency list so admins can re-parent without code changes.
2. **Per-(category, attribute) field schema in the DB.** The post wizard, the detail page specs panel, the admin filter, and the search facets are all generated from this.
3. **Catalog tables for breeds, vaccines, units, regions** — so free text becomes structured data with autocomplete, but free-text remains as a fallback.
4. **Locale-aware labels** — every pillar/category/attribute carries `label_en`, `label_local` (Twi/Ga/Ewe/Hausa later), and a list of search synonyms in any language.
5. **Faceted search at the DB layer**, on top of `listings.attributes JSONB` with GIN indexes, so `/listings` becomes a real marketplace not a name search.
6. **Lifecycle**: `active | deprecated | merged_into`, audit log, admin UI, full CRUD on every layer.
7. **Frontend is generated, not maintained.** No more hardcoded pillar literals, sex enums, condition strings, or per-pillar JSX in `CategoryFieldsSwitcher`.

## Section A — Backend-first schema (the source of truth)

Five new tables + one rewrite. Everything else in the app reads from these.

```text
market_pillars                  ← already exists, gets new columns
├─ slug PK
├─ label_en, label_local jsonb           {tw: "...", ga: "..."}
├─ icon_key, sort_order, is_marketplace
├─ accepts_vendor_stores bool            (livestock=false; agrofeed/agromed/equipment=true)
├─ has_directory bool                    (hatcheries/services=true → directory pages)
├─ default_unit_slug fk → units          ("per_head", "per_kg", "per_bag")
├─ allowed_units text[]                  (whitelist for the price-unit dropdown)
└─ status active|deprecated

market_categories               ← rewritten as a tree
├─ id uuid PK
├─ pillar_slug fk
├─ parent_id uuid null fk → market_categories.id
├─ slug                                  (unique within (pillar, parent))
├─ canonical_path text                   (computed: "livestock/poultry/layers")
├─ label_en, label_local jsonb
├─ icon_key, sort_order
├─ is_promoted bool                      (shown on home strip)
├─ accepts_listings bool                 (leaves usually true; branches false)
├─ status active|deprecated|merged
└─ merged_into_id uuid null fk           (so old links keep working)

category_synonyms               ← supersedes the current synonyms table
├─ id uuid PK
├─ pillar_slug fk
├─ category_id uuid null fk              (null = applies to whole pillar)
├─ alias text                            ("goat", "aponkye", "tewi", "broilers")
├─ alias_locale text                     ("en"|"tw"|"ga"|"ee"|"ha")
├─ alias_kind enum                       (singular_plural | local_name | trade_name | misspelling)
└─ unique (pillar_slug, lower(alias))

attribute_definitions           ← the schema for what each category collects
├─ id uuid PK
├─ key text                              ("breed", "age_months", "pack_size", "active_ingredient")
├─ label_en, label_local jsonb
├─ data_type enum                        (text | integer | decimal | enum | date | boolean | reference)
├─ unit_slug fk → units null             ("kg","ml","months","l")
├─ enum_values text[] null               (for short closed sets like sex)
├─ reference_table text null             ("breeds","vaccines","feed_brands")
├─ validation jsonb                      ({min:0,max:240} or {regex:"^[A-Z]"})
└─ help_text_en text

category_attributes             ← which attributes apply to which category
├─ category_id fk
├─ attribute_id fk
├─ is_required bool
├─ is_filterable bool                    (shown as a facet on /listings)
├─ is_promoted bool                      (shown on listing card)
├─ display_order int
├─ default_value jsonb null
└─ pk (category_id, attribute_id)

units                           ← canonical units for price + measurements
├─ slug PK ("per_head","per_kg","per_bag","kg","ml","months","l")
├─ label_en, label_local
├─ kind enum                             (price | weight | volume | duration | count)
└─ sort_order

breeds                          ← catalog (livestock pillar)
├─ id uuid PK
├─ category_id fk → market_categories     (the species: cattle/goats/poultry…)
├─ slug, label_en, label_local
├─ origin text                            ("Indigenous","Exotic","Cross")
├─ status active|deprecated
└─ unique (category_id, slug)

vaccines                        ← catalog (agromed pillar)
├─ id uuid PK
├─ slug, label_en, label_local
├─ target_species text[]                  ({"poultry","cattle"})
├─ disease text                           ("Newcastle","Gumboro")
├─ withdrawal_days int null
└─ status

feed_brands                     ← catalog (agrofeed pillar)
├─ id uuid PK, slug, label
├─ manufacturer text
└─ status

listings                        ← rewritten link to taxonomy
├─ ... existing columns ...
├─ pillar_slug          (renamed from top_category for clarity)
├─ category_id fk → market_categories     (replaces subcategory_slug; keeps `category` text as denormalised label for back-compat reads)
├─ attributes jsonb                       ({"breed_id":"...","age_months":7,"sex":"male","weight_kg":35})
├─ price_unit_slug fk → units             (replaces the price_unit enum)
└─ search_vector tsvector                 (recomputed from title+description+attributes+synonyms)
```

The hatcheries and services tables get the same treatment: `category_id fk` instead of free-text/enum `category`. No more two parallel taxonomies.

### Constraints, triggers, governance

- **Trigger `tg_listings_normalize_taxonomy`** (BEFORE INSERT/UPDATE on `listings`):
  1. Resolve `pillar_slug + category_id`. If the wizard sent a slug + alias path, look up the synonym table and re-target.
  2. Reject if `accepts_listings = false` (i.e. someone tried to post to a branch).
  3. Walk `category_attributes` for the resolved category; for every `is_required = true` attribute, assert it's present in `NEW.attributes` and conforms to `validation`.
  4. Coerce numeric strings, normalise enums, lowercase free-text-with-controlled-vocab where applicable.
  5. Mirror the canonical category label into `listings.category` for legacy readers (Option 1, kept).
- **Trigger `tg_categories_recompute_path`** keeps `canonical_path` in sync when a node is re-parented.
- **Trigger `tg_listings_search_vector`** rebuilds the `tsvector` from `title || description || attribute values || all synonyms for the resolved category` so a search for "aponkye" matches goat listings.
- **Audit table `taxonomy_audit_log`** (actor, table, row_id, before, after, action, ts), written by triggers on `market_pillars`, `market_categories`, `category_synonyms`, `attribute_definitions`, `category_attributes`. Admin-only readable.
- **`category_synonyms` uniqueness** is `unique (pillar_slug, lower(alias))` so casing/locale doesn't drift.
- **RLS**: public SELECT on every taxonomy table; INSERT/UPDATE/DELETE gated by `has_role(auth.uid(), 'admin')`. Catalog tables (`breeds`, `vaccines`, `feed_brands`) also allow `seller`-role INSERT for new entries flagged `status=pending` (admin promotes to `active`); this is how new breeds appear without a deploy.

### Indexes for facets and search

```sql
create index on listings (pillar_slug, category_id, status, region);
create index on listings using gin (attributes jsonb_path_ops);   -- facet filters
create index on listings using gin (search_vector);
create index on category_synonyms (pillar_slug, lower(alias));
create index on market_categories (pillar_slug, parent_id, sort_order);
```

### Seed data (real coverage, not stubs)

- **Livestock**: cattle (Sanga, N'Dama, Friesian, Sokoto Gudali, Boran), goats (West African Dwarf, Sahel, Boer, Kalahari), sheep (Djallonké, Sahel), poultry (layers, broilers, local/sasso, cockerels, guinea fowl, ducks, turkeys, quail), pigs (Large White, Landrace, local), rabbits (NZ White, Chinchilla, Flemish), fish (tilapia, catfish), eggs (table eggs, fertile eggs, hatching eggs).
- **Agrofeed**: existing list + maize, soya, wheat bran, layer concentrate, broiler concentrate, fish meal, dog/pet food.
- **Agromed**: vaccines (Newcastle, Gumboro, Marek's, Fowl pox, Lasota), antibiotics, dewormers, tonics, antiparasitics, disinfectants, growth promoters, AI semen straws.
- **Equipment**: incubators (capacity facet), feeders, drinkers, brooders, cages, milking parlours, sprayers, weighing scales, tractors / power tillers, generators.
- **Hatcheries**: poultry, fish, breeding stock, semen / AI.
- **Services**: vet, transport, feed, insurance, training, advisory, slaughter / abattoir, cold chain, AI / breeding, equipment maintenance.
- **Synonyms**: every plural/singular pair, plus Twi/Ga local names for the 8 livestock species and the 4 pillars.

## Section B — Server access layer

A single server function set in `src/server/taxonomy.functions.ts`:

- `getTaxonomy()` — returns the full snapshot in one round trip:
  ```ts
  type TaxonomySnapshot = {
    pillars: Pillar[];
    categoriesByPillar: Record<string, CategoryNode[]>; // tree
    flatCategories: Record<string, Category>;           // by id
    attributes: Record<string, AttributeDef>;           // by key
    categoryAttributes: Record<string, CategoryAttrLink[]>; // by category_id
    units: Unit[];
    synonyms: SynonymIndex;                             // alias → {pillar, category_id}
    catalogs: { breeds: Breed[]; vaccines: Vaccine[]; feedBrands: FeedBrand[] };
    version: string;                                    // sha256 of the snapshot
  };
  ```
  Cached server-side with a 5-min TTL keyed by version; the trigger that writes `taxonomy_audit_log` bumps the version so it invalidates immediately.
- `resolveAlias(pillar, term)` — a thin RPC for the search box autocomplete.
- `searchListings(filters)` — unifies the listings page query: `pillar`, `category_id`, `region`, `priceMin/Max`, plus a generic `attributes: { [key]: value | range }` that the function compiles into JSONB containment / range queries against `listings.attributes`.

The browser client calls `getTaxonomy()` once via the root route's `beforeLoad` and stores the result in TanStack Query with `staleTime: 1h, gcTime: ∞`. Everything below reads from `Route.useRouteContext().taxonomy` — no per-page taxonomy fetches.

## Section C — Frontend rebuild (no more hardcoded literals)

These files lose all hardcoded category arrays:

- `src/lib/constants.ts` — drop `LIVESTOCK_CATEGORIES`, `SEX_OPTIONS`. Sex options come from the `sex` attribute's `enum_values`.
- `src/lib/categories.ts` — kept only for the type re-exports it already exposes; no data.
- `src/components/home/CategoryStrip.tsx` — render from `pillars` flagged `is_promoted` + their promoted children. Icons via `icon_key`.
- `src/components/listing/TopCategoryTabs.tsx` — render from `marketplacePillars`.
- `src/components/post/CategoryFieldsSwitcher.tsx` — **replaced** by a generic `<AttributeForm category={category} value={attrs} onChange={...} />` that walks `categoryAttributes[category.id]` and renders the right input per `data_type` (text / number+unit / enum / date / reference w/ Combobox autocomplete).
- `src/routes/_authenticated/post.tsx` — Zod schema is built dynamically from `categoryAttributes`. Required attributes become required Zod fields. Submission shape is `{pillar_slug, category_id, attributes:{...}, price, price_unit_slug, region, district, ...}`.
- `src/routes/listings.tsx` — `validateSearch` accepts `pillar`, `category` (slug, alias-resolved), `attrs` (compact `key:value` pairs). Hero, breadcrumb, and "no results" copy come from `taxonomy.labelFor()`. Filter sidebar is generated from `categoryAttributes` where `is_filterable = true` (e.g. Agromed gets a Vaccine combobox and a "withdrawal ≤ N days" range).
- `src/routes/listings.$id.tsx` — `SpecsPanel` renders the listing's `attributes` keyed against `attribute_definitions` for labels/units, in `display_order`. Promoted attributes go on `ListingCard`.
- `src/routes/hatcheries.tsx`, `services.tsx`, their dashboards/onboarding — use `categoriesByPillar.hatcheries` / `.services`. Filter chips come from the same source.
- `src/components/home/HeroOffer.tsx`, `src/lib/hero-image.ts` — keyed off `icon_key`, with the resolution path being `category.icon_key ?? pillar.icon_key`.
- Admin filter dropdowns (`admin.listings.tsx`, `admin.hatcheries.tsx`, `admin.stores.tsx`) — same source.

The `CategoryStrip`, `TopCategoryTabs`, post wizard, listings filter, hero, services and hatcheries pages, and the admin filters **cannot** drift apart because they all render from the same snapshot.

## Section D — Admin "Marketplace structure" UI

`/admin/taxonomy` (4 tabs):

1. **Tree** — drag-and-drop the category tree, edit labels & local names inline, toggle `is_promoted`, deprecate or merge a node into another (writes `merged_into_id`, leaves a synonym row so old URLs work).
2. **Attributes** — full CRUD on `attribute_definitions` (data type, unit, enum values, validation, help text) and `category_attributes` (which attribute attaches to which category, required/filterable/promoted).
3. **Synonyms** — bulk paste aliases with locale + kind; instant preview of which categories will be matched.
4. **Catalogs** — breeds, vaccines, feed brands. Same CRUD pattern. Pending entries from sellers surface here for promotion.

Every change writes to `taxonomy_audit_log` and bumps the snapshot version, so production picks up the change inside 5 minutes (or immediately on next page load via the cache-bust).

## Section E — Migration order (safe, reversible)

1. **Migration 1 — schema**: create the 6 new/changed tables, the audit log, the indexes, RLS, helper functions (`resolve_category(pillar, alias)`, `validate_listing_attributes`). Add `pillar_slug`, `category_id`, `attributes`, `price_unit_slug` columns to `listings`, `hatcheries`, `service_profiles`, but **don't** drop the old columns.
2. **Migration 2 — backfill**: re-seed pillars with the new columns; rebuild `market_categories` as a tree (existing flat rows become depth-1 nodes); copy synonyms over with locale='en'/kind='singular_plural'; backfill `listings.category_id` from the existing `subcategory_slug` (resolving via synonyms); backfill `listings.attributes` from the columns the wizard currently writes (`breed`, `age_months`, `sex`, `weight_kg`, `condition`, `metadata`); set triggers in **warn-only** mode.
3. **Code sweep** — every file in Section C, plus the admin UI in Section D. Ship.
4. **Migration 3 — enforce**: flip triggers to `RAISE EXCEPTION`. Drop now-unused columns (`subcategory_slug`, the `price_unit` enum column, hatcheries' `category` enum, service_profiles' `category` text). Keep `listings.category` as denormalised label (Option 1).
5. **Migration 4 — content**: load the full breed/vaccine/feed-brand catalogs and the Twi/Ga local-name synonym set (CSV → SQL).

Each migration is independently reversible because Migration 1/2 leave the legacy columns alive.

## Section F — What we deliberately are not doing (yet)

- **Multi-tenant taxonomy.** A single canonical taxonomy is enforced for all sellers. Vendor-specific subcategories are not supported — they create the exact drift we're getting rid of.
- **AI auto-classification.** Out of scope for this pass; the structured wizard is enough.
- **Region-specific category visibility** (e.g. "fish only in Volta"). Easy to add later via `category_regions` join — not needed for v2.
- **Multi-currency / non-GHS pricing.** Unit table is ready for it; UI stays GHS only.

## Open decisions (please pick before we start)

1. **Catalog seeding scope.** Do we ship the full Ghana-specific catalogs (breeds, vaccines, feed brands) in Migration 4, or just the skeletons and let admins fill them in?
2. **Locale support depth.** All UI strings stay English; only category/breed/synonym _data_ carries `label_local` and is searchable. Confirm that's enough for v2 (full UI i18n is a much bigger effort).
3. **Wizard UX for new breeds/vaccines.** When a seller types a breed not in the catalog, should we (a) accept it as free-text into `attributes.breed_text` and queue it as `pending` in the catalog for admin promotion, or (b) hard-require picking from the list?
4. **Old shareable links.** Confirm we keep `?category=goat` working forever via the synonym table (the design above does this; flagging in case you'd rather force-redirect to canonical URLs after a grace period).

If you have no strong preference, defaults are: (1) skeletons + bulk import follow-up, (2) data-only locale, (3) accept-and-queue, (4) keep forever.

## Technical summary (for the implementation pass)

- **New tables**: `category_synonyms` (replaces `market_category_synonyms`), `attribute_definitions`, `category_attributes`, `units`, `breeds`, `vaccines`, `feed_brands`, `taxonomy_audit_log`.
- **Rewritten table**: `market_categories` gains `parent_id`, `canonical_path`, `is_promoted`, `accepts_listings`, `status`, `merged_into_id`. `market_pillars` gains `accepts_vendor_stores`, `has_directory`, `default_unit_slug`, `allowed_units`, locale label JSON.
- **Listings/hatcheries/service_profiles** gain `category_id`, `attributes jsonb`, `price_unit_slug`. Old columns kept until Migration 3.
- **New triggers**: `tg_listings_normalize_taxonomy`, `tg_categories_recompute_path`, `tg_listings_search_vector`, audit triggers on the 5 taxonomy tables.
- **New server functions**: `getTaxonomy`, `resolveAlias`, `searchListings` in `src/server/taxonomy.functions.ts` and `src/server/listings.functions.ts`.
- **New UI**: `src/components/post/AttributeForm.tsx`, `src/components/listing/AttributeFacets.tsx`, `src/components/listing/AttributeSpecs.tsx`, `src/routes/_authenticated/admin.taxonomy.tsx` with 4 tabs.
- **Refactored**: `CategoryStrip`, `TopCategoryTabs`, `CategoryFieldsSwitcher` (deleted, replaced), `listings.tsx`, `listings.$id.tsx`, `post.tsx`, `hatcheries.tsx`, `services.tsx`, `dashboard.hatchery.onboarding.tsx`, admin filters.
- **Removed hardcoded data**: `LIVESTOCK_CATEGORIES`, `SEX_OPTIONS`, all per-pillar field-set JSX, the inline `CATEGORIES` arrays, `HATCHERY_CATEGORIES`, `SERVICE_CATEGORIES`.
- **Performance**: GIN index on `listings.attributes` for facet queries; `tsvector` index for search; pillar/category/region B-tree for the listings page; snapshot version-keyed cache so 95% of taxonomy reads are local.

That's the full backend-first, depth-aware, attribute-driven design. Once you approve (and answer the 4 questions), we ship it as the four migrations + code sweep above.