# Vendor Stores — Roadmap

Farmlink ships unified vendor storefronts: every vendor type (hatchery, service provider, agro shop) gets a public profile with shared identity columns and pillar-specific commerce.

## v1 (shipped)

- `agro_vendor_stores` table for feed / agromed / equipment dealers
- Cross-table slug uniqueness across hatcheries, service profiles, agro stores
- `vendor_stores_v` unified read view powering `/stores`
- Admin moderation queue at `/admin/stores` with audited approve/reject/suspend
- Listings auto-link to the seller's approved agro store via DB trigger
- Vendor hub at `/dashboard/store` with one-click flows into each onboarding wizard
- Notifications: `agro_store_approved`, `agro_store_rejected`, `agro_store_suspended`
- Private `vendor-licences` storage bucket for compliance docs

## v2 candidates (out of scope today)

- Multi-pillar single store (e.g., one shop selling both feed and equipment)
- In-store search, sorting and filters
- Store ratings & reviews UI (table can be added in a follow-up migration)
- In-app checkout / escrow / payments
- Promotional ad placements & featured shops on `/stores`
- Per-store analytics dashboards (views, contact taps, conversion funnel)
- Shared inventory / stock-sync between listings and external POS
- Automated VSD / EPA licence registry checks
- Storefront themes (cover, accent colour, layout density)

## Compliance posture (MVP)

Documented but not enforced:

- Business registration number (Registrar General's Department)
- VSD licence number for agromed pharmacies
- Licence document upload (private, owner + admin signed-URL only)

All four are review aids for the human admin queue. v2 will add automated lookups.
