/**
 * Canonical top-level + sub-category enums for the Farmlink listings table.
 *
 * `top_category` = the marketplace pillar (livestock, agrofeed supplements,
 * agromed/veterinary, equipment & tools).
 * `subcategory_slug` = a finer slot inside each pillar.
 *
 * Hatcheries and Services do NOT live in `listings` — they have their own
 * tables. These enums are only for the product-side categories.
 */

export type TopCategory =
  | "livestock"
  | "agrofeed_supplements"
  | "agromed_veterinary"
  | "agro_equipment_tools";

export const TOP_CATEGORIES: { value: TopCategory; label: string; short: string }[] = [
  { value: "livestock", label: "Livestock", short: "Livestock" },
  { value: "agrofeed_supplements", label: "Feed & Supplements", short: "Feed" },
  { value: "agromed_veterinary", label: "Agromed / Veterinary", short: "Agromed" },
  { value: "agro_equipment_tools", label: "Equipment & Tools", short: "Equipment" },
];

export const TOP_CATEGORY_LABEL: Record<TopCategory, string> = Object.fromEntries(
  TOP_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<TopCategory, string>;

export const LIVESTOCK_SUBCATEGORIES: { slug: string; label: string }[] = [
  { slug: "cattle", label: "Cattle" },
  { slug: "goats", label: "Goats" },
  { slug: "sheep", label: "Sheep" },
  { slug: "pigs", label: "Pigs" },
  { slug: "poultry", label: "Poultry" },
  { slug: "rabbits", label: "Rabbits" },
  { slug: "fish", label: "Fish" },
];

export const AGROFEED_SUBCATEGORIES: { slug: string; label: string }[] = [
  { slug: "layer_mash", label: "Layer mash" },
  { slug: "broiler_starter", label: "Broiler starter" },
  { slug: "broiler_finisher", label: "Broiler finisher" },
  { slug: "concentrate", label: "Concentrate" },
  { slug: "mineral_lick", label: "Mineral lick" },
  { slug: "fish_feed", label: "Fish feed" },
];

export const AGROMED_SUBCATEGORIES: { slug: string; label: string }[] = [
  { slug: "vaccine", label: "Vaccine" },
  { slug: "antibiotic", label: "Antibiotic" },
  { slug: "dewormer", label: "Dewormer" },
  { slug: "vitamin", label: "Vitamins / Tonic" },
  { slug: "antiparasitic", label: "Antiparasitic" },
];

export const EQUIPMENT_SUBCATEGORIES: { slug: string; label: string }[] = [
  { slug: "incubator", label: "Incubator" },
  { slug: "feeder", label: "Feeders" },
  { slug: "drinker", label: "Drinkers" },
  { slug: "cage", label: "Cages / Crates" },
  { slug: "milking", label: "Milking equipment" },
  { slug: "spray", label: "Sprayers" },
];

export function subcategoriesFor(top: TopCategory) {
  switch (top) {
    case "livestock":
      return LIVESTOCK_SUBCATEGORIES;
    case "agrofeed_supplements":
      return AGROFEED_SUBCATEGORIES;
    case "agromed_veterinary":
      return AGROMED_SUBCATEGORIES;
    case "agro_equipment_tools":
      return EQUIPMENT_SUBCATEGORIES;
  }
}

export const HATCHERY_CATEGORIES = [
  { value: "poultry", label: "Poultry chicks" },
  { value: "fish", label: "Fish fingerlings" },
  { value: "breeding", label: "Breeding stock" },
] as const;

export type HatcheryCategory = (typeof HATCHERY_CATEGORIES)[number]["value"];

export const HATCHERY_CATEGORY_LABEL: Record<HatcheryCategory, string> = {
  poultry: "Poultry chicks",
  fish: "Fish fingerlings",
  breeding: "Breeding stock",
};

export const SERVICE_CATEGORIES = [
  { value: "vet", label: "Veterinary" },
  { value: "transport", label: "Transport" },
  { value: "feed", label: "Feed & Agro-vet" },
  { value: "insurance", label: "Insurance" },
  { value: "training", label: "Training" },
  { value: "advisory", label: "Advisory" },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]["value"];

export const SERVICE_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  SERVICE_CATEGORIES.map((c) => [c.value, c.label]),
);

export const PERMIT_AUTHORITIES = [
  { value: "vsd", label: "Veterinary Services Directorate (VSD)" },
  { value: "fisheries_commission", label: "Fisheries Commission" },
  { value: "epa", label: "Environmental Protection Agency" },
  { value: "district_assembly", label: "District Assembly" },
  { value: "other", label: "Other authority" },
] as const;
