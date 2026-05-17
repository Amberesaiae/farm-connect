
# farmlink — UI/UX Gap Audit & Replan

## 1. What I looked at

Read the live shell: `AppShell`, `TopNav`, `HeroOffer`, `ListingCard`, `/listings`, `/index` (redirect), `styles.css` tokens, the dashboard/admin route map, and the modal/gate components (`Require*Modal`, `StaffGate`). Then benchmarked patterns against five comparable products: **OLX**, **Jiji.ng**, **Cowsoko** (Kenya livestock), **Animall** (India cattle) and the **GSMA AgriTech UX Guidebook** for LMIC mobile users.

## 2. Gap analysis — what is hurting the product today

### A. Information architecture
1. **No real homepage.** `routes/index.tsx` redirects to `/listings`. We lose the strongest SEO surface, the first-impression trust story, and the only place to teach the three roles (buyer / seller / service provider). Every competitor in the benchmark has a dedicated landing.
2. **Account dropdown is a 12-item dump** (My listings, reservations, quotes, saved, verification, hatchery, provider, services, hatcheries, how-it-works, admin, sign out). No grouping, no separation between "my activity" vs "explore" vs "become a vendor". On a 948px viewport this is the only nav for many destinations.
3. **`HeroOffer` lives on `/listings` instead of `/`.** It re-renders on every browse-back, eating ~360px above the fold every time the user filters. Hero belongs on the landing; the listings page needs results-first density.
4. **Verification, hatchery, store, provider** are 4 parallel onboarding entry points with no unified "Become a verified seller" funnel. Users don't know which to start with.

### B. Discovery & browse (the money page)
5. **Filters are a dead-end on mobile**: behind a sheet, no chip row showing active filters, no quick-clear per filter, no sort control at all (relevance / newest / price asc/desc / closest).
6. **No persistent search on mobile.** The search input only exists in desktop `TopNav` (hidden `md:flex`). Mobile users must tap into the filter sheet to type a keyword — a documented OLX/Jiji conversion killer.
7. **No "results meta" sticky bar** (count + sort + map-toggle). Once filters are applied you can't tell at a glance what's filtered.
8. **No recently-viewed / saved-search row.** Both Animall and Jiji report ~15–25% return-session lift from this single strip.
9. **No empty-state recovery.** "No listings match your filters" is plain text — no "clear region", "broaden price", or "notify me when new ones arrive".

### C. Listing card
10. **The heart icon is fake** — it's a decorative `<span>`, while the real `SaveButton` component is unused in the grid. Users tap it and nothing happens.
11. **Cards leak design tokens**: hard-coded `bg-blue-100 text-blue-800` for the "New" badge bypasses our theme; will break in dark mode.
12. **No spec chips** (breed, age, sex, weight) on the card. The detail page has them but the grid forces a click to compare. Animall's biggest win was 3 chips on the card.
13. **Seller row buries trust** — initials + name + tiny check. No badge tier surfaced, no "Responds in X hours", no listing count. Trust signals are the #1 lever in livestock/agritech (Cowsoko, GSMA).

### D. Listing detail + contact
14. **Sticky contact bar exists but no progressive trust panel** — no aggregate trust score, no "verified phone + ID + licence" stack visualised, no "report listing" within the bar.
15. **WhatsApp CTA + phone reveal are not gated visually as a journey** — the new ID/phone-verify modals throw an error from the server. Should be a pre-emptive trust checklist on the listing.
16. **No image lightbox/zoom** for the carousel. Livestock buyers need to see the animal — every benchmark has full-screen zoom + swipe.
17. **No "similar listings" rail** at the bottom of detail. Standard for marketplaces; cheap re-engagement.

### E. Onboarding & seller funnel
18. **No "What kind of seller are you?" picker** on first `/post`. Today everyone lands in the same post wizard regardless of whether they're a single farmer, a hatchery, or an agro store.
19. **Verification page is a passive form**, not a gamified trust ladder (Bronze → Silver → Gold → Platinum mapped to phone / ID / licence / store). Users have no idea why to bother.
20. **Hatchery / store onboarding wizards exist but the dashboard shell doesn't show progress**. No "you're 60% complete" affordance.

### F. Visual system & polish
21. **Palette under-used.** Forest primary + warm cream is strong, but the amber `--secondary` is essentially invisible in the app — wasted accent. No tertiary "data" colour for stats / KPIs.
22. **One font scale.** Display + body are good, but the type ramp jumps from 13.5 → 22 → 34 with nothing in between for card heroes / KPI numbers.
23. **No motion language.** Cards, modals, sheets all snap. Even a 150ms transform-only fade would lift perceived quality without hurting perf.
24. **Iconography mixed**: brand uses lucide via `@/components/icons` but several places import raw lucide names directly. Visual weight inconsistent (some 12px, some 16px) on the same row.
25. **Mobile tab bar + desktop nav have no tablet bridge** — at 768–1023px the desktop nav appears but the search is cramped and the dropdown overflows.

### G. Accessibility & LMIC realities (GSMA-aligned)
26. **Tap targets** for the rail filter `<Input className="h-10 …"/>` and the card heart (h-8 w-8) are below the WHO/GSMA-recommended 48px for one-handed phone use in rural Ghana.
27. **No skeleton parity** with the grid (we render skeletons but they don't match card shape → layout shift).
28. **No offline / poor-connection signalling.** Image-heavy pages on 3G need a "low-data mode" toggle (GSMA pattern).
29. **No bilingual hook.** Even if we ship English-only first, the copy strings should be in a single i18n source so Twi / Hausa land later.

## 3. Replanned UI/UX — concrete moves

The plan is grouped into 4 phases so we can ship value early. Each phase is self-contained and shippable.

### Phase 1 — Foundations (palette, motion, nav, real homepage)
**P1.1 Design tokens refresh** in `src/styles.css`
- Add `--accent-2` (warm clay) and `--info` (sky) — used for "New" badges and data viz, replacing hard-coded `bg-blue-100`.
- Add a typography ramp: `--text-display-1/2/3`, `--text-kpi`, `--text-body`, `--text-caption` mapped to clamp() pairs.
- Add motion tokens: `--ease-out-soft`, `--duration-fast/base/slow`.
- Add `--shadow-lift` and `--shadow-overlay`.

**P1.2 Replace the redirect homepage** with `src/routes/index.tsx` containing:
- Hero with rotating role pitch (Buy / Sell / Find services).
- 3-tile "I want to…" picker (Buy livestock · Sell my animals · Find a vet/hatchery).
- Category strip (livestock pillars).
- Live "fresh listings" carousel (top 8 active).
- Trust strip (verified sellers count, hatchery count, region coverage).
- "How farmlink protects you" 3-step.
- Footer testimonials.

**P1.3 TopNav restructure**
- Persistent search on **all** breakpoints (collapses to icon → full-screen sheet on mobile).
- Account dropdown split into three labelled groups: **My activity**, **Sell on farmlink**, **Help & admin**.
- Tablet bridge: at `md` show icon-only nav + search; at `lg` show labels.

**P1.4 Motion baseline** — add a `Motion` wrapper using Tailwind `transition` tokens for cards, modals, sheets. 150–220ms, transform/opacity only.

### Phase 2 — Browse experience (the highest-leverage page)
**P2.1 `/listings` overhaul**
- Remove `HeroOffer`; move to `/`. Replace with a compact "browsing **Goats in Ashanti**" context header that doubles as breadcrumb.
- Sticky **ResultsBar** under the nav: `{count} listings · Sort ▾ · Map · Saved search ★`.
- **Active filter chips** row above grid; each chip has × to remove. "Clear all" pill on the right.
- **Sort control** (Newest, Price ↑, Price ↓, Verified first, Nearest).
- Mobile: bottom-aligned **floating filter pill** instead of header button; keeps thumb-reach.

**P2.2 ListingCard v2**
- Wire `SaveButton` (real) into the grid card heart.
- Replace hard-coded blue badge with `--info` token; "Verified" uses `--primary-soft`.
- Add a 1-line **spec chip row** (e.g. "♂ Boer · 18 mo · 35 kg") derived from `attributes` JSONB.
- Surface seller `badge_tier` as a coloured ring on the avatar (bronze/silver/gold/platinum).
- 48px-min tap targets on heart + card link.

**P2.3 Empty + skeleton states**
- Replace text-only empty with illustration + 3 recovery actions ("Clear region", "Widen price by 50%", "Notify me when matched").
- Skeleton cards mirror the real card shape (image 4:3, 3 text rows, footer).

**P2.4 Recently viewed + saved searches**
- Lightweight localStorage strip above the grid (server sync later).
- "Save this search" button in the ResultsBar → bell icon.

### Phase 3 — Listing detail, trust, contact
**P3.1 PhotoCarousel → lightbox** with pinch/zoom, keyboard arrows, swipe.

**P3.2 Trust panel** on detail page, replacing the small seller card:
- Aggregated trust score (0–4) computed from `{phone_verified, id_verified, business_licensed, has_store}`.
- Vertical checklist with green ticks; greyed items show "Ask seller to verify".
- Response time + listings count + member since.

**P3.3 Sticky contact bar v2**
- Primary: WhatsApp (if phone present + viewer authenticated).
- Secondary: Call (reveal flow, with the existing `RequirePhoneVerifyModal` / `RequireIdVerifyModal` triggered **before** click rather than reactively).
- Overflow: Report listing, Share.

**P3.4 "Similar listings" rail** at the bottom — same `top_category` + region, exclude current id, limit 8.

### Phase 4 — Seller funnel & onboarding
**P4.1 `/post` role picker** — first step asks: "Selling once / Running a store / Hatchery / Service provider", then routes into the right wizard. Persists choice on profile.

**P4.2 Trust Ladder** on `/dashboard/verification`
- Visual 4-rung ladder (Bronze → Platinum) with clear "what each unlocks" copy (e.g. Silver = WhatsApp visible, Gold = featured placement, Platinum = store page).
- Each rung is a card with the action it requires (verify phone, upload ID, upload licence, open store).

**P4.3 Dashboard progress KPI tile** — top of every `/dashboard/*` route shows "Profile completeness 60% · 2 steps left" linking to verification.

**P4.4 Wizard polish** — share a single `Stepper` between `/post`, hatchery onboarding, store onboarding, provider onboarding (already exists, currently inconsistent). Save-and-resume on every wizard.

## 4. Out of scope (call out so we don't bikeshed)

- Full i18n switch (we'll structure copy in one place so Twi can land later, but no language picker now).
- Real-time chat (WhatsApp deep-link stays the contact channel).
- Map view (the ResultsBar will have a Map toggle but it'll be a stub until a later phase).
- Dark mode pass — tokens are dark-ready; we'll only QA dark in Phase 1.

## 5. Technical / implementation notes

- **No new backend** needed for Phases 1, 2.4, 3.4 (purely presentational + localStorage).
- **Phase 2.2** spec chips read from existing `listings.attributes` JSONB — already selected by the grid query.
- **Phase 2.4** "save search" stub uses localStorage now; a `saved_searches` table is a small follow-up migration.
- **Phase 3.1** lightbox: use a tiny library or hand-roll with native `<dialog>` to keep bundle small (Workers runtime).
- **Phase 3.2** trust score: computed client-side from existing profile fields returned by `getMySession` / listing detail query — no new SQL.
- **Phase 3.4** similar-listings: extends the existing `listings` query in `listings.$id.tsx`, no new endpoint.
- **Phase 4.2** trust ladder is pure UI on top of the existing `phone_verified / id_verified / business_licensed` fields.

## 6. Suggested order & rough size

```text
Phase 1  Foundations + real homepage      M  (1 PR, mostly new + token edits)
Phase 2  Browse overhaul                  L  (the biggest visual impact)
Phase 3  Listing detail trust + contact   M
Phase 4  Seller funnel + trust ladder     M
```

Ship in this order — Phase 1 unlocks the design vocabulary the rest of the plan relies on.

## 7. What I need from you before I start building

1. **Confirm scope**: build all four phases in order, or trim (e.g. Phases 1+2 only for now)?
2. **Homepage tone**: warm/illustrated (Animall, Mooofarm style) or premium/photographic (Cowsoko, OLX)?
3. **"Save listing" persistence in Phase 2.2**: localStorage-only for now, or wire to the existing `saved` table so it syncs across devices?
4. **Trust ladder names**: keep Bronze/Silver/Gold/Platinum, or use farmlink-native names (Sprout / Grower / Trusted / Verified Pro)?

Answer those and I'll start with Phase 1.
