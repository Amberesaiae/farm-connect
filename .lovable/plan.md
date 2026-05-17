# QA & Hardening Pass: About, Footer, Accessibility, Reusability

## 1. About page — enrich beyond the current 3-step + 4-tile layout

`/about` currently has a header, a 3-step "How it works" mini, an ecosystem grid, and a CTA. It reads as a landing teaser, not a real About. Add:

- **Mission & origin** — a short editorial block explaining why farmlink exists (middlemen, price opacity, WhatsApp-first reality).
- **By the numbers** — live stats band (regions covered, active listings, verified sellers, hatcheries) reusing the `MarketplacePulse` data pattern but in an About-appropriate "Our reach" framing.
- **What we stand for** — 4 principle cards (No middlemen / WhatsApp-native / Verified IDs / Built for 16 regions) using existing icon set.
- **Who farmlink is for** — 3 audience cards (Farmers selling stock, Buyers & traders, Service providers & hatcheries) each linking to the matching onboarding route.
- **Trust & safety blurb** — link to a new `/safety` page, summarise verification tiers (reuse `VerifiedBadge`).
- **Team / built-in-Ghana note** — small editorial footer block above CTA.
- **FAQ accordion** — 6–8 Q&As using shadcn `Accordion`.
- Keep existing ecosystem grid and final CTA.

## 2. Footer — fix "dead" links

The footer currently lists only 6 in-app routes. The complaint is that nothing supporting (legal, help, contact, safety, policies) exists. Add a 3rd column and create the missing pages so no footer link 404s.

New routes to create (all public, shadcn-built):

- `/contact` — contact form (Name, Region, Topic select, Message) + WhatsApp + email; uses `Form`, `Input`, `Textarea`, `Select`, `Button`, `Card`. Posts via a TanStack server function to a new `contact_messages` table (RLS: anyone can insert, only admins read).
- `/safety` — buyer & seller safety guide, red-flag list, reporting flow.
- `/privacy` — privacy policy (static MDX-style content).
- `/terms` — terms of use.
- `/help` — FAQ hub (reuses Accordion data with About).
- `/sitemap` — human sitemap linking to every public route.

Footer column rework:

- **Marketplace** — Browse, Sell, Services, Hatcheries, Agro stores
- **Trust & safety** — Get verified, Safety guide, How it works, Report an issue (→ `/contact?topic=report`)
- **Company** — About, Contact, Help, Privacy, Terms, Sitemap
- Add region/language line and a "Built in Ghana 🇬🇭" badge.
- Add social links row (WhatsApp community, X, Facebook) as `Button variant="ghost" size="icon"` with `aria-label`.

## 3. Accessibility sweep (WCAG 2.1 AA)

Project-wide pass touching every route and shared component:

- **Landmarks** — verify exactly one `<main>` per route (currently inconsistent — `AppShell` wraps content but some routes nest extra `main`s). Audit and standardise on AppShell providing `<main id="content">`, remove duplicates.
- **Skip link** — add "Skip to content" link in `__root.tsx`, visible on focus, targeting `#content`.
- **Heading order** — audit every route for single H1 + no skipped levels. Fix offenders (hero rotator, dashboard pages, admin pages).
- **Focus visibility** — add a global `:focus-visible` ring token in `styles.css`; remove `outline-none` without replacement in shadcn overrides.
- **Icon-only buttons** — sweep for `<Button size="icon">` / icon links missing `aria-label` (TopNav avatar trigger, MobileTabBar items, carousel/scroll-row controls, dialog close buttons, hero pause control).
- **Form labels** — every `Input`/`Textarea`/`Select` paired with `Label htmlFor=` or `aria-label`; replace placeholder-only forms (login, post wizard search, contact).
- **Color contrast** — replace ad-hoc opacity classes (`text-white/70`, `text-foreground/60`) with semantic tokens where they fall under 4.5:1; specifically audit hero overlay text, `TrustBanner`, footer copyright, badge variants.
- **Live regions** — ensure toasts (`sonner`) announce politely; verify hero `aria-live` from prior pass.
- **Keyboard** — tab through every interactive surface on home, listings, listing detail, post wizard, dashboard, admin. Fix any custom `<div onClick>` (convert to `Button`).
- **Reduced motion** — extend the `prefers-reduced-motion` block in `styles.css` to cover any new animated components (carousel autoplay, ticker, scroll-row hover).
- **Alt text** — audit all `<img>` for meaningful alt or `alt=""` if decorative (hero photography, listing cards, store/hatchery covers, avatars).
- **Dialog/sheet** — ensure every shadcn `Dialog`/`Sheet` has `DialogTitle` (currently MobileFilterSheet may be missing one) and `aria-describedby` when content needs it.

## 4. shadcn reusability audit

Goal: replace hand-rolled patterns with shadcn primitives so styling stays consistent and accessible-by-default.

Sweep for and refactor:

- **Custom buttons** (raw `<button className="rounded-md bg-primary ...">`) → `Button` with variants. Add new variants if needed (`hero`, `ghost-on-dark`) via CVA.
- **Custom cards** (raw `<div className="rounded-2xl border-[1.5px] border-border bg-card ...">`) → `Card` + `CardHeader/Content/Footer`. Keep the editorial radius/border in the base `Card` style.
- **Custom badges/chips** → `Badge` with `variant` (primary-soft, success, warning, neutral).
- **Region pickers** — confirm all 4 (services, stores, hatcheries, listings) use `Select`; replace any remaining `<select>`.
- **Tabs** in dashboard pages → `Tabs`.
- **FAQ/expanders** → `Accordion`.
- **Mobile filter sheet** → ensure built on `Sheet` (already), add `Tabs` for grouping.
- **Toasts** — consolidate on `sonner`; remove any console `alert()` if present.
- **Skeletons** — replace bespoke `animate-pulse` blocks with `Skeleton` component for consistency.
- **Tooltips** on verification badges, trust signals → `Tooltip`.

Outcome: a short components manifest at `src/components/ui/README.md` listing which primitives map to which design tokens.

## 5. User-journey QA matrix

Walk each flow end-to-end, fix bugs found, and document the verified state:

1. **Anonymous visitor** — Home → Listings → Listing detail → WhatsApp CTA → back; About → Footer link → each footer destination renders.
2. **Sign up & verify** — Sign in → Email confirm → Dashboard → Verification flow → tier badge appears in listings.
3. **Seller post a listing** — `/post` wizard from cold start: every step keyboard-reachable, validation messages announced, success toast.
4. **Buyer save & contact** — Save toggle persists, `/saved` lists saved items, WhatsApp link opens with prefilled message.
5. **Hatchery booking** — Hatchery list → detail → batch → reserve.
6. **Services / Stores** — directory → detail → quote request (where applicable).
7. **Admin** — admin pages gated correctly, tables paginated, actions confirm via `AlertDialog`.

Each journey gets a row in a new `docs/qa-journeys.md` with: pass/fail, fixes applied, residual notes.

## 6. Technical details

- New DB: `contact_messages (id uuid pk, name text, region text, topic text, message text, created_at timestamptz default now())`. RLS: insert allowed to anon, select only via `has_role(auth.uid(),'admin')`.
- New server function `src/lib/contact.functions.ts` (`createServerFn` POST) inserting via `supabaseAdmin` after Zod validation (name 1–80, message 10–2000, topic enum).
- Routes added: `src/routes/contact.tsx`, `safety.tsx`, `privacy.tsx`, `terms.tsx`, `help.tsx`, `sitemap.tsx` — each with proper `head()` meta.
- `__root.tsx` gets the skip-link + ensures `<main id="content">` lives in `AppShell` only.
- New `Badge` variants + `Button` variants in `src/components/ui/*` (extend, do not break existing API).
- All new accordions/forms wired through shadcn `Form` + `react-hook-form` + `zod`.

## Out of scope

- Sending email on contact submissions (no provider configured) — messages are stored only; we surface them in admin.
- Multilingual content (Twi/Ga) — copy stays English.
- Replacing the existing icon set.
- Rewriting auth or RLS beyond the new `contact_messages` table.

```text
Deliverables
├── About: 7 new sections + FAQ
├── Footer: 3 columns + socials, 6 new live pages
├── A11y: skip link, single main, focus ring, labels, alt, reduced-motion
├── shadcn refactors: Card/Button/Badge/Tabs/Accordion/Skeleton
└── docs/qa-journeys.md + components/ui/README.md
```
