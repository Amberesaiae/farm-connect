
# Full-platform Agora alignment — pass 2

The previous passes left visible patchwork: AI-generic hero+search composition, generic role cards, stats band, regions grid, How-it-works panel, trust strips on every page, and inner pages (listings, dashboard, post, static) still on the old visual hierarchy. This plan scraps those and rebuilds end-to-end to one DNA: cream canvas + green accent, italic display word, pill controls, rounded baskets, soft shadow, editorial section headers with an oversized "See more" pill, single line ticker, no duplicated trust panels.

## 1 — Global shell

- **AnnouncementBar → AgoraTicker.** Replace with a single-line marquee using the existing `.ticker-track` keyframes. Content = rotating verified-seller lines (`"ID-verified sellers · Direct WhatsApp · 16 regions · No middlemen · Verified hatcheries · …"`) separated by a `•` glyph. Pauses on hover, respects `prefers-reduced-motion`.
- **Delete `TrustBanner.tsx`** and remove the `showTrust` prop from `AppShell`. The ticker now carries that signal; the standalone yellow band duplicates it on every page.
- **TopNav.** Keep pill search on desktop but tone down: remove the inner green Search button (search-on-Enter only, with subtle right-side `⌘K` hint chip); ghost "Sell" link in nav promoted to a small pill "+ Sell" on the far right next to avatar. Mobile slide-down search keeps the green Go button (touch target).
- **MobileTabBar.** Recolor active state to vivid primary, replace center FAB shadow with `--shadow-soft`, increase icon weight on active.
- **Footer.** Keep cream surface; add a slim sign-off row with the same ticker style (static) and a "Built in Ghana" pill — but remove the duplicated v2 monospace tag.

## 2 — Tokens / primitives

- Add `--surface-band` (slightly warmer cream) for full-bleed section bands and a `.section-band` utility (`bg-surface-band rounded-[32px] px-6 py-12 md:px-12 md:py-20`).
- Add `PillButton` variants (`primary | ghost | outline`) and `SeeMorePill` (ghost pill with arrow) — extract from inline duplications across home, services, hatcheries, agro strip.
- Add `MetaChip` (icon + label, fully rounded) and `EditorialQuote` for testimonials.
- All `SectionHeader` usages now render the new "See more" ghost pill on both mobile and desktop (currently hidden on mobile).

## 3 — Homepage rebuild

Sections kept (redesigned): Hero, CategoryDiscs, FreshListings, PromoPair, ServicesAndHatcheries, AgroVendorStrip, HowItWorks, FarmerVoices.
**Removed entirely:** `RolePicker`, `MarketplacePulse` (stats band), `RegionsMap`, `TrustStrip` (duplicates ticker). The 16-region browse moves to the Listings page as a compact pill cloud inside the filter rail; pulse stats move into the About page where they belong.

Per-section work:
- **HomeHero**: omit the search pill entirely (user request). Composition becomes: italic-accented headline left, lifestyle portrait right inside cream basket with floating price card, *no* form. Quick chips and trust strip stay. Search lives only in TopNav.
- **CategoryDiscs**: bigger discs, 2 rows on mobile (3-up) flowing to 6-up desktop, ditch the absolute count badge (cluttered) — count moves below label as a thin meta line. Add a hover lift + subtle ring in the tone color. Generate 2 missing animal images (sheep already exists; add `cat-rabbit.jpg` and `cat-fish.jpg` if taxonomy needs them).
- **FreshListings**: keep but wrap in a `.section-band` cream surface; add a real "See more →" ghost pill on the right of `SectionHeader` (mobile too).
- **PromoPair**: increase image side to 55%, swap "See hatcheries"/"Open directory" copy to verb-led ("Reserve a batch" / "Shop essentials"), align to a single rounded-[32px] container.
- **ServicesAndHatcheries**: scrap the two-column subsection layout. Replace with one editorial header + a single 6-card horizontal scroll-snap row mixing services & hatcheries, each with the new MetaChip set (region · type). Bottom row: two side-by-side pill CTAs ("Browse vets & services" / "Browse hatcheries").
- **AgroVendorStrip**: align header to `SectionHeader`, increase card width to 320px desktop, add an animated peek of the next card on the right edge.
- **HowItWorks**: scrap the bordered card; render directly on the cream band with three large oversized numerals (`01 02 03`) in italic display green, two-row tab swap with a smooth crossfade, single primary pill CTA centered below.
- **FarmerVoices**: scrap the white card grid. Editorial quote pattern: very large opening italic quote glyph in primary green, blockquote in display weight 500 at 22–26px, author row underneath with avatar + tier pill. 3-up desktop / scroll-snap on mobile.

Final `routes/index.tsx` order: AgoraTicker → Hero → CategoryDiscs → PromoPair → FreshListings → ServicesAndHatcheries → AgroVendorStrip → HowItWorks → FarmerVoices.

## 4 — Listings page rebuild

- Replace the patched cream hero with a real `PageHero` (compact variant) containing italic-accented title + a single search pill (this page is where search belongs).
- **TopCategoryTabs** + **SubcategoryPills**: merge into a single segmented pill carousel with horizontal scroll; selected pill = solid primary, others = ghost. Drop the divider line between them.
- **ResultsBar**: rebuild as a clean row — left side count + sort dropdown styled as a pill; right side mobile filter trigger pill. Active filter chips move into a dedicated row above with a leading "Filters:" label.
- **Filters sidebar**: redesigned as a sticky cream-surfaced card, all inputs become rounded-full or rounded-2xl pills; verified toggle gets a custom pill switch. Add the new "Browse by region" pill cloud (replacing the deleted home-page RegionsMap) at the bottom of the sidebar.
- **Empty state**: replace inline `EmptyResults` with the shared `EmptyState`.

## 5 — Detail / static / dashboard / post / admin / auth

Every page swept to one pattern:

- **`listings.$id.tsx`**: photo carousel inside cream basket, sticky right-rail seller card on desktop, specs as MetaChip grid, WhatsApp CTA as full-width primary pill, similar listings use the new `SectionHeader` + ghost see-more.
- **`hatcheries.tsx`, `hatcheries.$slug.tsx`, `services.tsx`, `services.$slug.tsx`, `stores.index.tsx`, `stores.$slug.tsx`**: use `PageHero`, replace grid headers with `SectionHeader`, restyle their card components (`HatcheryCard`, `ServiceCard`, `StoreCard`, `StorefrontCard`) to the new ListingCard basket pattern (cream image area, MetaChips, pill CTA).
- **Static pages** (`about`, `contact`, `help`, `safety`, `privacy`, `terms`, `sitemap`, `how-it-works`): all routed through `StaticPage` + `PageHero`. About becomes the new home for the stats band (rebuilt as a clean 4-column editorial stat block with italic numerals). Help/FAQs become accordion pills on cream surface. Privacy/Terms/Sitemap get readable serif-toned typography on cream.
- **Auth (`login`)**: split-screen — left lifestyle image inside cream panel, right form on white with rounded-full inputs and primary pill submit. Google button as ghost pill with brand glyph.
- **Dashboard suite** (`dashboard.tsx` + all `_authenticated/dashboard.*`): scrap card-only grids. Header band with `PageHero` compact. Sidebar nav as vertical pill list. `KpiTile`, `ListingQuotaBanner`, `VerificationProgressCard` restyled to soft cream with italic accent numerals. Tables → rounded-2xl card rows with MetaChips. All status pills (hatchery / reservation / quote) recolored against the new token set.
- **Post wizard (`_authenticated/post.tsx`)**: `Stepper` + `WizardProgress` redrawn as connected pill steps in primary. Form fields use rounded-2xl inputs, section headers use display italic accent, sticky bottom action bar with two pills (Back ghost / Next primary).
- **Admin shell** (`AdminNav`, `admin.*`): cream sidebar, pill nav, table rows redesigned to match dashboard; ShieldIcon header band.

## 6 — Component-level grooming

- `ListingCard`: tighten meta row, move Save button visually into top-right of basket (already), make verified chip use solid mint, sellerName moves to its own line under price for legibility, "Contact" pill always primary (no hover-darken to foreground).
- `BadgeChip`, `HatcheryStatusPill`, `ReservationStatusPill`, `QuoteStatusPill`, `BatchStatusPill`, `AgroStoreStatus`: unified `StatusPill` styling — fully rounded, 11px bold uppercase, tone-mapped to mint / peach / butter / rose surfaces.
- `MobileFilterSheet`, `RequireSignInModal`, `RequirePhoneVerifyModal`, `RequireIdVerifyModal`, `ActionConfirmDialog`: redraw to use rounded-3xl cream sheets with primary pill confirm.
- Generate one missing hero image: `auth-hero.jpg` (Ghanaian farmer with goats, golden hour, cream tone).

## 7 — Deduplication & hygiene

- Remove `TrustStrip` + `TrustBanner` references everywhere.
- Drop unused `HeroOffer`, `CategoryStrip` (legacy).
- Single source for ticker content list in `lib/constants.ts`.
- Sweep for `fl-lift` on cards: keep only on grid items, remove from sections that get their own band lift.

## Out of scope

- No backend / RLS / route / data changes.
- No new third-party motion libs; keep existing CSS keyframes.
- No dark-mode redesign.

## Sequencing

1. Tokens + new primitives (PillButton, SeeMorePill, MetaChip, EditorialQuote, AgoraTicker, StatusPill).
2. Global shell (ticker, TopNav, Footer, MobileTabBar, AppShell prop cleanup).
3. Home — delete RolePicker / MarketplacePulse / RegionsMap / TrustStrip; rebuild remaining sections; reorder.
4. Listings + ListingCard + filter rail.
5. Detail, hatcheries, services, stores pages + their cards.
6. Static pages (PageHero everywhere; About absorbs stats band).
7. Dashboard suite + post wizard + admin.
8. Auth.
9. Generate missing imagery.
10. Final screenshot QA at 360 / 768 / 1280 across every route; remove orphaned files.
