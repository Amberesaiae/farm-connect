## Analysis

### Hero accessibility audit — current gaps

The rotating hero violates several WCAG 2.2 success criteria:

1. **2.2.2 Pause, Stop, Hide** — auto-advancing every 5.5s with no pause control.
2. **2.3.3 / `prefers-reduced-motion`** — animations run regardless of OS setting.
3. **1.3.1 / 4.1.2** — progress-bar buttons lack `aria-current`/`aria-selected`; no role group for the indicator set.
4. **4.1.3 Status Messages** — scene changes are silent to screen readers (no `aria-live` region).
5. **2.1.1 Keyboard** — no arrow-key nav between scenes; no focus-pause behaviour.
6. **2.4.6 Headings** — `<h1>` *text changes* on every rotation, confusing both AT users and SEO crawlers. There should be one stable H1.
7. **1.4.3 Contrast** — white text sits over photography with no measured contrast guarantee; the bottom scrim helps but the eyebrow row near the top sometimes lands on bright sky.
8. **Tab order** — progress dots are reachable after the CTAs, which is awkward; controls should sit near the region they control.

### Homepage content audit — what's missing

The site already has services, hatcheries, agro-vendor stores, 16-region coverage, and live listing data — but the home page surfaces *only* listings + categories + trust. The "I need help" role card promises vets/hatcheries/feed but never delivers a single example above the fold of `/services`.

Critical gaps for a Ghana livestock marketplace:

- **Services & Hatcheries showcase** — pillar feature, invisible on home.
- **Browse by region** — 16 regions, strong SEO + matches how Ghanaian buyers actually search ("goats in Ashanti").
- **Live marketplace stats** — listings / sellers / regions covered as a single trust signal.
- **How it works (3 steps)** — first-time buyer/seller education.
- **Farmer voices / testimonials** — social proof for the verified-seller positioning.

## Plan

### 1. Hero accessibility hardening

`src/components/home/HomeHero.tsx`:

- **Stable H1**: keep one page-level `<h1>` with the brand promise ("Ghana's livestock marketplace, direct from the farm."). Demote the rotating scene copy to a `<p>` styled large, marked with `role="group"` + `aria-roledescription="slide"` + `aria-label="{scene.word}, {scene.eyebrow}"`.
- **Pause control**: add a visible play/pause toggle (bottom-right of the stage) with `aria-pressed`. Default state respects `prefers-reduced-motion` (paused if reduced).
- **Auto-pause** on `:hover`, `:focus-within`, document `visibilitychange`, and when reduced-motion is set.
- **Reduced-motion mode**: skip image cross-fade + clip-path reveal; just swap content. Detect via `matchMedia('(prefers-reduced-motion: reduce)')` once in a `useEffect`, listen for changes.
- **Live region**: invisible `aria-live="polite" aria-atomic="true"` element announcing the current scene label.
- **Keyboard nav**: arrow-left / arrow-right on the indicator group navigates scenes; `Home`/`End` jump to first/last. Indicator container uses `role="tablist"`, each indicator is `role="tab"` with `aria-selected` + `tabindex` roving.
- **Tab order fix**: move the indicator strip *above* the CTAs in DOM (visually still at the bottom via absolute positioning) so tabbing flows: brand → indicators → headline copy → CTAs.
- **Contrast guarantee**: add a per-scene radial gradient anchored to the headline block (not full-bleed) to guarantee ≥4.5:1 against any underlying image area, without darkening the photograph.
- **Image alt**: leave descriptive `alt` only on the *active* image; outgoing image keeps `alt=""`. Already correct.
- **Skip link target**: ensure the hero region has `id="hero"` so a future skip link works.

### 2. New homepage sections

Insert in this order between existing blocks. Each is its own component under `src/components/home/`.

```text
Hero
├── (existing) RolePicker
├── (existing) CategoryList — "Browse by animal · live counts"
├── NEW  MarketplacePulse        ← live counts band
├── (existing) FreshListings
├── NEW  ServicesAndHatcheries   ← 2-up: vets + hatcheries previews
├── NEW  AgroVendorStrip         ← featured agro stores (feed, equipment)
├── NEW  RegionsMap              ← browse by region (16 chips/grid)
├── NEW  HowItWorks              ← 3 steps, buyer + seller flips
├── NEW  FarmerVoices            ← 3 testimonials (static seed for now)
└── (existing) TrustStrip
```

**`MarketplacePulse`** — thin horizontal band, 4 stats (`active listings`, `verified sellers`, `regions covered`, `WhatsApp inquiries this week`). Numbers pull from Supabase head-count queries; falls back to seeded values if zero.

**`ServicesAndHatcheries`** — two-column section. Left: 3 featured vet/service profiles (reuse `ServiceCard`). Right: 3 hatchery batches with availability (reuse `HatcheryCard`). Each side has a "See all" link.

**`AgroVendorStrip`** — horizontal scroll-snap row of agro-vendor stores (reuse `StoreCard`). Header: "Feed, equipment & supplies."

**`RegionsMap`** — 16-region chip grid (4×4 on desktop, 2×8 on mobile). Each chip shows region name + active-listing count, links to `/listings?region={name}`. Visually distinct from category list (no icons, denser type, primary-soft chips).

**`HowItWorks`** — 3-step illustrated explainer with a buyer/seller toggle. Steps for buyer: *Browse → Chat on WhatsApp → Meet the farmer*. Steps for seller: *Post in 3 minutes → Get verified → Sell direct*. Each step is a numbered tile with a short body.

**`FarmerVoices`** — 3 testimonial cards. Avatar (initial-only placeholder), quote, name, region, role badge ("Verified seller / Trusted"). Seed with 3 realistic quotes from a static `lib/testimonials.ts`. Cards lift on hover.

### 3. Route assembly

`src/routes/index.tsx`:

- Import + place the 5 new components.
- Wrap the entire scrolling content in `<main id="content">` (currently inside `AppShell`; verify single-main rule).
- Update meta description to mention "vets, hatcheries, agro-vendors and 16-region delivery" so it matches the new scope.

### 4. Styles

`src/styles.css`:

- Add `prefers-reduced-motion` overrides for `hero-img-active`, `hero-img-leaving`, `hero-text-active`, `hero-text-leaving`, `hero-progress` → animation becomes instant.
- Add a `.scroll-snap-row` utility for the agro-vendor strip.

## Technical notes

- All Supabase reads use the existing `supabase` browser client with `head: true` counts — cheap, no migration.
- `FarmerVoices` is static seed data only for this iteration; a future migration would add a `testimonials` table with RLS.
- `RegionsMap` reuses the existing `GHANA_REGIONS` constant in `src/lib/constants`.
- No new dependencies. No backend changes.

## Out of scope

- Newsletter/SMS alerts signup (no provider configured; would need Twilio/Africa's Talking).
- A real testimonials table with admin moderation.
- Personalised "recently viewed" strip (separate phase already in earlier backlog).
