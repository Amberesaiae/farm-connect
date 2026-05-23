## Goal

Refactor the entire farmlink UI to the Agora reference language — bright, airy, grocery-marketplace polish — while preserving every existing feature. Lock the visual DNA into shared shadcn-based primitives so every page (home, listings, hatcheries, services, stores, dashboard, auth, static, admin) inherits the same elegance with no per-page divergence.

## Design DNA extracted from the reference

- **Canvas**: near-white #FCFBF7 with cream section bands (#F4EFE6) alternating for rhythm. White cards float on cream.
- **Primary**: vivid grocery green (~#1FAE57) for CTAs and emphasis. Deep forest reserved for body/headlines. Soft mint pill backgrounds (#E6F6EC).
- **Accent tiles**: pastel category chips — peach, mint, butter, sky, lilac — each at ~12% saturation on near-white.
- **Type**: serif/grotesque display ("Make healthy life with **fresh** grocery" pattern — bold sans with italicized accent word in primary green) + clean geometric sans body. Keep `Bricolage Grotesque` for display, swap body to `Inter` for tighter rhythm; introduce italic accent treatment via a `<DisplayAccent>` span.
- **Components**: fully rounded pill buttons (`rounded-full`), 20–24px rounded cards with hairline borders + soft shadow, micro-meta chips, countdown strip, "See more" ghost pill, badge chips inside product cards.
- **Spacing**: generous — 80–120px section gaps on desktop, 56–72px mobile. Two-up promo banners. 6-up category strip.
- **Imagery**: lifestyle photography in cream-tinted product baskets; here translated to livestock/poultry/feed product shots on cream backgrounds.

## Scope of pages touched

Home, Listings (browse + filters), Listing detail, Hatcheries (list + profile + batch), Services (list + profile), Stores (list + profile), Post wizard, Dashboard (all sub-routes), Saved, Login, About, Contact, Help, Safety, Privacy, Terms, Sitemap, How-it-works, Admin shell. Global shell (TopNav, AnnouncementBar, Footer, MobileTabBar, TrustBanner).

## Workstreams

### 1. Token + typography refresh (`src/styles.css`)
- Repaint `--background` to bright off-white, introduce `--surface-cream` band, `--surface-mint`, `--surface-peach`, `--surface-butter`, `--surface-sky`, `--surface-lilac` pastel tokens.
- Raise `--primary` to vivid green; keep `--primary-deep` (forest) for type emphasis.
- Tighten radii scale to match reference (cards 20px, pills full, tiles 24px).
- Add `--shadow-soft` (low, diffuse) replacing current card shadow.
- Swap body font to Inter; keep Bricolage Grotesque display; register italic-display utility.

### 2. Shared primitives (new + consolidated)
Build once in `src/components/ui/` and `src/components/shared/`, then replace ad-hoc usage everywhere:
- `SectionHeader` — eyebrow + display title with italic accent word + optional "See all" link.
- `DisplayAccent` — span that renders an italicized green word inside any display heading.
- `PillButton` variants on shadcn `Button` (primary pill, ghost pill, outline pill, icon pill).
- `CategoryTile` — pastel-tinted square with image + label + count, color cycles through pastel tokens.
- `PromoBanner` — two-up cream card with copy left, image right, pill CTA.
- `ProductCard` (livestock + agro variant) — image, name, meta row, price, "Contact seller" or "Add to quote" pill, save heart. Replaces the current `ListingCard`, `StoreCard`, `StorefrontCard`, `HatcheryCard`, `ServiceCard` internals so all cards share one anatomy with category-specific slots.
- `CountdownStrip` — for time-bound things (batch availability, market deals).
- `EmptyState`, `LoadingSkeleton`, `StatusPill` — unified empty/loading/status vocabulary used across every list and dashboard.
- `PageHero` — shared static-page hero (about/help/contact/safety/privacy/terms) replacing current `StaticPage` shell with image + eyebrow + display headline + lede.

All primitives wrap shadcn (`Button`, `Card`, `Badge`, `Skeleton`, `Separator`, `Avatar`, `Input`, `Select`, `Dialog`, `Sheet`, `Tabs`) — no hand-rolled equivalents remain.

### 3. Global shell refresh
- **TopNav**: white bar, pill search field, primary pill "Sell" CTA, ghost cart-style saved indicator. Mobile: clean hamburger + search icon with `aria-label`s.
- **AnnouncementBar**: thin cream strip with marquee disabled, single-line truncation, tiny dot separators.
- **MobileTabBar**: floating pill on cream background with active-pill highlight in primary green.
- **Footer**: cream band, big italic "farmlink" wordmark, three link columns in Inter, region-tag chip, newsletter pill input.

### 4. Page-by-page application
For each page: rebuild composition with new primitives, refresh copy to feel grounded and specific (Ghanaian regions, breeds, seasonal cues), swap placeholder copy/loading text for `<EmptyState>`/`<LoadingSkeleton>`, audit a11y (alt text, aria-labels, focus rings, heading order, 44px tap targets).

- **Home**: hero kept but recomposed with italic accent word + pastel side panel + pill CTAs; new 6-up `CategoryTile` strip; two-up `PromoBanner` ("Verified hatcheries" / "Agro essentials"); `FreshListings` rebuilt on shared `ProductCard`; `MarketplacePulse` as countdown strip + stat tiles; testimonials and how-it-works re-typeset.
- **Listings / Hatcheries / Services / Stores**: shared two-column layout (filter rail + grid), shared `ResultsBar`, shared `ProductCard`, shared `EmptyState`. Detail pages adopt shared `PageHero` + spec panel + sticky CTA.
- **Post wizard**: shadcn `Form` + `Stepper` refresh; pill primary buttons; cream step backgrounds.
- **Dashboard**: white cards on cream, KPI tiles use shared primitive, verification card uses shared progress, all status pills standardized.
- **Auth (login)**: centered card with italic display headline, pastel side image.
- **Static pages** (about, help, contact, safety, privacy, terms, sitemap, how-it-works): rewritten copy with stronger narrative (about → farmer-first manifesto with Ghanaian context; help → categorized FAQ accordion using shadcn `Accordion`; contact → split layout with form + WhatsApp/phone cards; safety → 5-step grounded guide; legal pages → clean prose template).
- **Admin**: cream shell, pill nav (already close), reuse shared primitives.

### 5. Imagery
Use existing hero assets (`hero-cattle`, `hero-goats`, `hero-poultry`, `mixed-hero`) plus generate cream-background product shots for:
- 6 category tiles (cattle, goats, sheep, poultry, swine, feed/agro)
- 2 promo banners (verified hatchery basket, agro essentials basket)
- About page hero (farmer + livestock lifestyle)
- Static-page accent imagery
Generated via `imagegen` at `standard` quality, stored under `src/assets/`, imported as ES6 modules with descriptive `alt` text.

### 6. Copy pass
Rewrite every headline, sub-headline, empty state, error state, and CTA on every touched page. Tone: confident, grounded, specifically Ghanaian, never generic SaaS. Examples:
- Home hero: "Livestock, *direct* from the farm that raised them."
- Categories: "Browse by animal" → "Pick your animal. We'll show you the farms."
- Empty saved: "Nothing saved yet — tap the heart on any listing to keep it here."

### 7. Accessibility hardening (carried through every page)
- All icon-only `Button`s get `aria-label`.
- `focus-visible:ring-2 ring-ring ring-offset-2` everywhere (replace any `outline-none`).
- Single `<main>` (already in `__root` via AppShell), correct heading order, no skipped levels.
- Min 44×44 tap targets on mobile.
- All images get meaningful `alt`; decorative get `alt=""`.
- Replace `text-muted-foreground/50` with `text-muted-foreground` (AA contrast).
- Live regions on async actions where appropriate (already on hero).

## Technical notes

- **No backend changes.** Pure frontend refactor — no schema, no RLS, no server functions touched.
- **shadcn-first**: every new primitive composes shadcn `Button`/`Card`/`Badge`/`Input`/`Select`/`Skeleton`/`Accordion`/`Tabs`/`Dialog`/`Sheet`/`Avatar`/`Separator`. No bespoke unstyled equivalents survive.
- **Token-only colors**: zero hex literals in components — everything routes through `src/styles.css` tokens.
- **Refactor strategy**: introduce tokens + primitives first (one PR-sized batch), then sweep pages section by section so the app stays buildable at every step.
- **No route changes**, no URL changes, no link-target changes — purely presentational + copy.
- **Imagery**: generated once, committed to `src/assets/`, never inlined from external URLs.

## Out of scope

- Backend logic, DB, auth flows, RLS.
- New routes or features.
- Motion library swaps (keep current CSS transitions; only add subtle `transition-transform`/`hover:-translate-y-0.5` consistent with reference).
- Dark mode redesign (token map updated, but no dedicated dark-mode pass).

## Sequencing (single build pass)

1. Tokens + typography in `styles.css`.
2. Shared primitives in `src/components/ui/` + `src/components/shared/`.
3. Global shell (TopNav, AnnouncementBar, Footer, MobileTabBar, TrustBanner).
4. Home page recomposition.
5. Browse pages (listings, hatcheries, services, stores) + their detail pages.
6. Dashboard + post wizard + login + saved.
7. Static pages copy + layout rewrite.
8. Admin shell pass.
9. Generate + wire imagery.
10. Final a11y + copy sweep + screenshot QA at 360px and 1280px.

Deliverable: a unified, Agora-grade marketplace where every page shares one DNA — same type rhythm, same green, same card, same pill, same cream bands, same elegant empty states.
