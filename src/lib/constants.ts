export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Western North",
  "Oti",
  "Savannah",
  "North East",
] as const;

export type GhanaRegion = (typeof GHANA_REGIONS)[number];

export const LIVESTOCK_CATEGORIES = [
  { value: "cattle", label: "Cattle" },
  { value: "goat", label: "Goats" },
  { value: "sheep", label: "Sheep" },
  { value: "poultry", label: "Poultry" },
  { value: "pig", label: "Pigs" },
  { value: "rabbit", label: "Rabbits" },
  { value: "fish", label: "Fish" },
  { value: "other", label: "Other" },
] as const;

export const PRICE_UNITS = [
  { value: "per_head", label: "per head" },
  { value: "per_kg", label: "per kg" },
  { value: "per_lb", label: "per lb" },
  { value: "lot", label: "for the lot" },
] as const;

export const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "mixed", label: "Mixed" },
] as const;

export const LISTING_PHOTOS_BUCKET = "listing-photos";
export const VERIFICATION_DOCS_BUCKET = "verification-docs";
