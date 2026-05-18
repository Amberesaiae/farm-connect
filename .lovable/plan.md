## Surgical UI/UX cleanup

A focused fix-it pass on real potholes observed at 390px. No restructuring, no redesign — just hit the broken moments and tighten state handling. Scope: mobile, transactional flows, content pages, and the global shell.

### Potholes observed (with proof)

1. **Listings sort `Select` shows literal "Loading…"** as the trigger text, no accessible label, no placeholder. Looks broken on first paint.
2. **Hatcheries list cards never populate** — skeletons sit forever because the empty-state branch is gated behind `loading`; no empty illustration / CTA. Filter `Select` trigger renders with no placeholder, just a chevron.
3. **Deep-link `/hatcheries/:slug` silently fails** — when the slug doesn't match an approved hatchery, the route's `notFoundComponent` should render, but the user lands back on `/hatcheries` with no message. Either the loader throws wrong or the redirect masks the not-found.
4. **HomeHero on 390px**: `aspect-[4/5]` plus a long Italic headline pushes "Sanga" close to the "01 / CATTLE" meta row, creating visual collision. Top vignette is too thin to separate the eyebrow row from the photo.
5. **AnnouncementBar** wraps the bullet dot to its own line and the text runs under the page scrollbar — no right padding for the gutter, no truncation.
6. **MobileTabBar** sits over page content (the floating + post FAB overlaps the last card of every list). Routes don't add bottom padding to compensate for the fixed bar.
7. **TopNav mobile**: bare magnifier icon button has no `aria-label`, no visible affordance; "Sign in" link has no focus ring matching the rest of the system.
8. **Empty/loading states are inconsistent** — some pages show "Loading…" text, others spinners, others skeletons. We standardise on shadcn `Skeleton` + a tiny `EmptyState` component.

### Fixes (file-by-file)

**Global shell**
- `AppShell.tsx` — add `pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-0` to the `<main>` so the mobile tab bar never overlaps page content.
- `TopNav.tsx` — add `aria-label="Search"` to the icon button; standardise focus-visible ring; ensure 44×44 hit area.
- `AnnouncementBar.tsx` — add `px-4 pr-[calc(1rem+env(safe-area-inset-right))]` and `truncate` on the text; keep the dot inline-flex (no wrap).
- `MobileTabBar.tsx` — confirm `pb-[env(safe-area-inset-bottom)]` and `min-h-11 min-w-11` on every button; add `aria-current="page"` on the active tab.

**Home**
- `HomeHero.tsx` — bump mobile ratio from `aspect-[4/5]` to `aspect-[3/4]` so the headline has more breathing room; thicken top vignette from `h-32` to `h-40`; reduce mobile headline from `text-[40px]` to `text-[34px]` on `<sm`.

**Listings**
- `listings.tsx` — replace the sort `Select` "Loading…" trigger with a shadcn `Skeleton` while options resolve; once loaded, use `<SelectValue placeholder="Sort by" />`; add `aria-label="Sort listings"` to the trigger.
- Same treatment on the category `Select`.

**Hatcheries**
- `hatcheries.tsx` — when `loading=false && rows.length===0`, render an `EmptyState` (icon + "No hatcheries yet" + "Run a hatchery? List yours →" CTA) instead of dangling skeletons; cap skeleton count at 3 so the page doesn't look infinite.
- Add `placeholder` text to the category `Select` trigger.
- `hatcheries.$slug.tsx` — verify the `notFound()` branch actually surfaces `notFoundComponent` and isn't being caught by an upstream redirect; if the loader currently returns `null` on miss instead of throwing, switch to `throw notFound()`.

**Shared primitives (new, small)**
- `src/components/ui/empty-state.tsx` — tiny wrapper around an icon + title + description + optional CTA. Built on shadcn `Card`. Used by Listings, Hatcheries, Saved, Services, Stores empty branches.
- `src/components/ui/list-skeletons.tsx` — `ListingCardSkeleton`, `HatcheryCardSkeleton` using shadcn `Skeleton` so every list shares one loading vocabulary.

**Static / content pages**
- `about.tsx`, `help.tsx`, `safety.tsx`, `privacy.tsx`, `terms.tsx`, `contact.tsx`, `sitemap.tsx` — pass: ensure `<main>` bottom padding picks up tab-bar offset (handled in `AppShell`), tighten heading→lede spacing on mobile (`mt-2` not `mt-4`), and ensure every link has a `focus-visible:ring` token.

**Accessibility quick wins** (no new structure)
- All `size="icon"` shadcn `Button`s get an `aria-label`.
- Replace `outline-none` without a replacement with `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- Replace any `text-muted-foreground/50` / `opacity-50` text with the token `text-muted-foreground` for AA contrast.

### Explicitly out of scope

- No redesign of the hero, no new home sections, no new routes.
- No DB or RLS changes.
- No copy rewrites beyond placeholders for `Select` triggers.
- No motion changes beyond what's needed to stop layout shift.

### Acceptance

- `/`, `/listings`, `/hatcheries`, `/hatcheries/:slug`, `/about`, `/contact` all render with no overlapping FAB, no "Loading…" placeholder text in form controls, and a real empty state when there's no data.
- Lighthouse a11y score stays ≥95 on `/` and `/listings`.
- All icon-only buttons have `aria-label`.
- Mobile content never sits under the bottom tab bar.
