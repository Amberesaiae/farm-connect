

## Farmlink — v2 Propagation, Brand Cleanup & New Sections

Apply the warm-cream + forest-green v2 visual language to **every page** (login, dashboard, post wizard, listing detail, saved, all admin), drop the price ticker entirely, lock the brand to a clean lowercase **"farmlink"** wordmark (no leaf, no Sprout, no emoji), add **Services** and **Hatcheries** as real routes, and rotate the hero image based on the active category. All work stays atomic — no monolithic files, every section is its own component.

### 1. Brand & global chrome
- **Wordmark**: replace every `<Sprout>` / `<Leaf>` icon-plus-text combo with a single `<Wordmark />` component rendering plain lowercase `farmlink` in `font-display font-extrabold tracking-tight` — no icon, no colored span. Used in `TopNav`, `MobileTabBar` (none currently), `login`, footer.
- **`AppShell`**: drop the `showTicker` prop and the `<PriceTicker />` import entirely. Delete `src/components/layout/PriceTicker.tsx`. Add a slim `<Footer />` with farmlink wordmark, links to Browse / Sell / Services / Hatcheries / Verification / About, copyright.
- **`AnnouncementBar`**: keep, but soften copy to one line, no link clutter.
- **`TrustBanner`**: keep, used on `/listings` and the new section pages.

### 2. New routes (real pages, not hash anchors)
Create separate route files so each page gets its own SSR head/og:
- `src/routes/services.tsx` — Services directory (vets, transport, feed/agro-vet supply, insurance). Card grid, each card = name, region, phone (WhatsApp link), category chip. Seeded from a new `src/lib/services-data.ts` mock list (clearly labelled "Coming soon — partner directory") so it ships now without DB changes.
- `src/routes/hatcheries.tsx` — Hatcheries directory (poultry chicks, fish fingerlings, breeding stock). Same card format, different mock dataset in `src/lib/hatcheries-data.ts`.
- `src/routes/about.tsx` — short brand page: how Farmlink works, 3-step "Browse → Contact → Trade", trust banner, CTA to post.
- `src/routes/how-it-works.tsx` — buyer & seller guides side-by-side.
- All four routes use `AppShell` + the v2 token system. Each defines its own `head()` with title, description, og:title, og:description (and og:image where a hero exists).

### 3. Category-aware hero imagery
- Generate three more photographic heroes via Lovable AI (`google/gemini-2.5-flash-image`):
  - `goats-hero.jpg`, `poultry-hero.jpg`, `mixed-hero.jpg` (default).
- New helper `src/lib/hero-image.ts` exporting `heroForCategory(cat?: string)` that returns the right import. `HeroOffer` accepts an optional `category` prop, swaps image + headline copy ("Cattle from verified farmers" / "Healthy goats, fair prices" / etc.). `/listings` passes `search.category` in.

### 4. Propagate v2 styling everywhere
Replace any lingering `bg-background` panel cards, hard borders, or generic `rounded-2xl` shells with the v2 pattern: **cream page canvas, white cards, soft beige `bg-surface` insets, `border-[1.5px] border-border`, `font-display` headings, `font-mono` numerals for prices/stats**. Files touched:
- `src/routes/_authenticated/dashboard.tsx` — KPI tiles → bordered v2 cards, listing rows → bordered surface, prices in `font-mono`.
- `src/routes/_authenticated/post.tsx` — wizard `<Section>` wrapper → bordered v2 card, sticky footer styled to match cream theme.
- `src/routes/_authenticated/saved.tsx` — empty state and grid backgrounds → v2 surface tokens.
- `src/routes/_authenticated/dashboard.verification.tsx` — section cards → bordered v2 cards, status badges restyled.
- `src/routes/listings.$id.tsx` — header price → `font-mono`, sticky bar updated to safe-area-only (no tab-bar offset on desktop), `SpecsPanel` lifted to bordered white card.
- `src/routes/login.tsx` — drop the Leaf icon, use `<Wordmark />`, card uses bordered v2 surface.
- `src/routes/_authenticated/admin*.tsx` — apply v2 cards to all three admin pages, add a small admin sub-nav component `src/components/layout/AdminNav.tsx` for consistent navigation between queue/listings/users.

### 5. Components touched / added
**New (atomic):**
- `src/components/brand/Wordmark.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/AdminNav.tsx`
- `src/components/services/ServiceCard.tsx`
- `src/components/services/HatcheryCard.tsx`
- `src/lib/services-data.ts`, `src/lib/hatcheries-data.ts`, `src/lib/hero-image.ts`

**Edited:**
- `AppShell` (drop ticker, mount Footer), `TopNav` (Wordmark + add Services/Hatcheries links + drop the unused MapPin location chip), `MobileTabBar` (no brand change needed — already iconless), `HeroOffer` (category-aware), `SpecsPanel`, `SellerCard` (v2 card), `ListingGrid` empty state (v2), all touched routes above.

**Deleted:**
- `src/components/layout/PriceTicker.tsx`

### 6. Navigation wiring
- Desktop `TopNav` adds: Browse · Services · Hatcheries · Sell.
- Mobile `MobileTabBar` stays 5-slot (Browse / Saved / Post FAB / Account) — Services & Hatcheries reachable via the Account dropdown / Footer / TopNav on tablet+.
- Footer present on every page so mobile users still get to Services / Hatcheries / About / How-it-works.

### What stays unchanged
DB schema, server functions, RLS, auth flow, routing structure beyond the four new public routes.

### Open assumption (no clarifying question needed)
Services & Hatcheries ship as **static curated lists** in v1 (mock data file). Once you want sellers to self-list services, we'll add a `services` table + admin moderation in a follow-up — out of scope for this visual+structure pass.

