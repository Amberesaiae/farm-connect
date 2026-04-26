/**
 * Type re-exports for the marketplace pillars and per-pillar categories.
 *
 * The actual data lives in the `market_pillars` / `market_categories` tables
 * and is exposed via {@link useTaxonomy} (see `src/lib/taxonomy-context.tsx`).
 * Nothing in this file holds a hardcoded list of pillars or categories — add
 * a row to the database instead.
 *
 * The only non-taxonomy thing here is `PERMIT_AUTHORITIES`, which maps to a
 * Postgres enum and is therefore stable across environments.
 */

export type TopCategory =
  | "livestock"
  | "agrofeed_supplements"
  | "agromed_veterinary"
  | "agro_equipment_tools";

/** Hatchery categories are a Postgres enum, not a free-text taxonomy entry. */
export type HatcheryCategory = "poultry" | "fish" | "breeding";

export const PERMIT_AUTHORITIES = [
  { value: "vsd", label: "Veterinary Services Directorate (VSD)" },
  { value: "fisheries_commission", label: "Fisheries Commission" },
  { value: "epa", label: "Environmental Protection Agency" },
  { value: "district_assembly", label: "District Assembly" },
  { value: "other", label: "Other authority" },
] as const;
