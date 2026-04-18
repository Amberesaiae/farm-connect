

## Farmlink — UI/UX Refinement Plan

Take the **visual language** from the produce mockups (clean white cards on a soft gray canvas, generous radii, a confident green hero block, sticky bottom action, big square thumbnails, calm typography) and apply it to **Farmlink's livestock domain** — without copying the produce app's content, layout literally, or that "Good morning Jenny / location" pattern. No emojis, no avatar, no fake phone bezel. The brand mark stays "Farmlink".

### Design tokens (refine `src/styles.css`)
- App canvas becomes `--surface` (soft gray `#F6F6F6`), cards stay pure white → instant depth.
- Bump `--radius` from `1rem` → `1.25rem` for the mockup's pillowy feel.
- Introduce one extra token: `--shadow-card: 0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.08)` for resting cards.
- Keep WhatsApp green (`#25D366`) reserved exclusively for the contact CTA.

### Layout shell (`AppShell`, `TopNav`, `MobileTabBar`)
- `AppShell`: switch `bg-background` → `bg-surface` so the white cards pop.
- `TopNav`: collapse to a single 56px row on mobile — wordmark left, **bell + user avatar** right (no separate mobile search bar; the search lives on `/listings`). On desktop: wordmark, primary nav links (Browse, Sell, How it works), pill-shaped search field, "Post listing" green pill.
- `MobileTabBar`: 4 items (Browse / Saved / **Post (raised FAB)** / Account). Active tab = filled green pill behind the icon, inactive = slate. Add 1px hairline top border + safe-area padding (already there). Remove the "Mine/Sign in" duality — show "Account" always; tapping it routes to `/dashboard` if signed in, else `/login`.

### Home / Browse (`/listings`) — biggest visual lift
Restructure into three stacked sections inside a `max-w-6xl` container:
1. **Hero offer panel** (replaces the bare "Browse livestock" h1). Soft green card (`bg-primary-soft`), 2-column on desktop / stacked on mobile: left = headline "Buy livestock direct from Ghanaian farmers" + subcopy + two pill buttons ("Browse all" primary, "Post a listing" outline); right = a single high-quality livestock photo with rounded-3xl mask. No carousel dots, no avatar.
2. **Category strip** — horizontal scroll of 8 round category chips (Cattle, Goats, Sheep, Poultry, Pigs, Rabbits, Donkeys, Other) with small monochrome livestock icon + label. Tapping filters the grid below via search params. Replaces the dropdown-only category filter on mobile.
3. **Listings section** with a left-rail filter sidebar on `md+` (Region, price range, verified-only toggle, sort) and a top **filter sheet** trigger on mobile. Grid stays 2/3/4 cols but cards are restyled (see below).

### `ListingCard` redesign (atomic component)
- Square `aspect-square` image (mockup uses square thumbs, not 4:3) with `rounded-2xl` and the **save-heart in a white circular pill** at top-right (currently the badge sits there — move badge to bottom-left of image as a subtle chip).
- Below image: title (one line, `font-semibold text-sm`), price line in bolder treatment (`text-base font-bold` + small unit suffix), then a single muted meta line: "Region · 3d ago".
- Card has no border — relies on white surface against gray canvas + `--shadow-card` on hover only. Removes the boxy look.

### Listing detail (`/listings/$id`) — sticky CTA pattern from mockup
- Photo carousel becomes edge-to-edge on mobile with the dot indicator at the bottom inside the image (mockup pattern), back-arrow as a floating white circle top-left.
- Specs grid (category/breed/sex/age/weight/qty) becomes 2-col chip rows inside a flat soft-gray panel (`bg-surface rounded-2xl`, no border) — feels lighter than the current bordered dl.
- **Sticky bottom action bar on mobile** (the mockup's signature move): full-width WhatsApp green pill "Contact on WhatsApp" + small square save button beside it, fixed `bottom-[calc(env(safe-area-inset-bottom)+72px)]` so it sits above the tab bar. On desktop the actions stay in the right rail.
- Seller card: white, rounded-2xl, avatar + name + badge chip + "X listings · Y trades" + a ghost link "View seller's listings".

### Post wizard (`/post`)
- Replace the WizardProgress bar pills with a **stepper** showing 3 numbered circles + connecting line (filled green up to current step) + "Step 2 of 3 · Pricing & location" caption — clearer than four equal bars.
- Group fields into card sections with subheads instead of one big bordered box.
- Step 3 photo grid: enlarge tiles to `aspect-square` with dashed `+ Add photo` first tile labelled "Cover photo" so users understand the cover convention.
- Sticky footer with Back / Continue (Post listing on step 3) — matches the mockup's bottom-action language.

### Dashboard (`/dashboard`)
- Add a 3-tile KPI strip at top: Active listings · Total views · WhatsApp taps (read from existing aggregates). Each tile = white rounded-2xl, big number, small label.
- Listing rows: increase thumb from 64px → 80px square `rounded-xl`; right-side actions become an icon-only `MoreHorizontal` dropdown (Mark sold, Edit, Hide, Relist) instead of multiple inline buttons.
- Empty state per tab gets an illustration-free but warmer copy + primary CTA.

### Login (`/login`)
- Already on `bg-surface`. Tighten the card to `max-w-sm`, lift wordmark, add a small subhead "Sell or save livestock listings across Ghana" under the logo, and put the Google button **above** the email tabs (industry convention, fewer clicks).

### Saved (`/saved`)
- Reuse the new `ListingGrid` + `ListingCard` directly. Empty state with a "Browse listings" primary CTA.

### Admin pages
- Apply the same surface/card system; no functional changes. Tables get sticky headers and zebra rows for legibility.

### Atomic component additions (no monolith)
- `src/components/home/HeroOffer.tsx`
- `src/components/home/CategoryStrip.tsx` + `CategoryChip.tsx`
- `src/components/listing/StickyContactBar.tsx`
- `src/components/listing/SpecsPanel.tsx`
- `src/components/dashboard/KpiTile.tsx`
- `src/components/wizard/Stepper.tsx` (replaces `WizardProgress`)
- `src/components/layout/MobileFilterSheet.tsx` (uses existing shadcn `Sheet`)
- `src/assets/hero-livestock.jpg` — single AI-generated photographic hero (cattle in Ghanaian savanna landscape) via Lovable AI image gen, used only on the home hero + as `og:image` for `/listings`.

### What stays unchanged
Database schema, routes, server functions, auth, and all data flows. This is **purely a visual + component-composition pass** — no migrations, no breaking API changes.

### Out of scope
Dark-mode polish (already wired, will inherit), animations beyond hover, blog/about pages, marketing landing.

