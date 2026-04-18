export type HatcheryCategory = "poultry" | "fish" | "breeding";

export interface Hatchery {
  id: string;
  name: string;
  category: HatcheryCategory;
  region: string;
  blurb: string;
  whatsappE164: string;
}

export const HATCHERY_CATEGORY_LABEL: Record<HatcheryCategory, string> = {
  poultry: "Poultry chicks",
  fish: "Fish fingerlings",
  breeding: "Breeding stock",
};

/**
 * Curated hatcheries / breeders directory — placeholder data for v1.
 */
export const HATCHERIES: Hatchery[] = [
  {
    id: "hatch-poultry-accra",
    name: "Akropong Day-Old Hatchery",
    category: "poultry",
    region: "Eastern",
    blurb: "Layer & broiler day-olds weekly. Vaccinated against Marek & Newcastle.",
    whatsappE164: "+233200000101",
  },
  {
    id: "hatch-poultry-kumasi",
    name: "Ashanti Broilers Hatchery",
    category: "poultry",
    region: "Ashanti",
    blurb: "Cobb 500 and Ross 308 broiler chicks. Pickup or regional delivery.",
    whatsappE164: "+233200000102",
  },
  {
    id: "hatch-poultry-bono",
    name: "Sunyani Layer Hatchery",
    category: "poultry",
    region: "Bono",
    blurb: "Lohmann Brown layer chicks, point-of-lay pullets available.",
    whatsappE164: "+233200000103",
  },
  {
    id: "hatch-fish-volta",
    name: "Volta Tilapia Fingerlings",
    category: "fish",
    region: "Volta",
    blurb: "Mono-sex Nile tilapia fingerlings, sized 5–10g and 20g+.",
    whatsappE164: "+233200000104",
  },
  {
    id: "hatch-fish-eastern",
    name: "Akosombo Catfish Nursery",
    category: "fish",
    region: "Eastern",
    blurb: "African catfish fry and fingerlings, year-round supply.",
    whatsappE164: "+233200000105",
  },
  {
    id: "hatch-breed-tamale",
    name: "Northern Sanga Stud",
    category: "breeding",
    region: "Northern",
    blurb: "Pure Sanga and Sanga × Friesian breeding bulls.",
    whatsappE164: "+233200000106",
  },
  {
    id: "hatch-breed-savannah",
    name: "Savannah Boer Goats",
    category: "breeding",
    region: "Savannah",
    blurb: "Pedigree Boer bucks and does for crossbreeding programmes.",
    whatsappE164: "+233200000107",
  },
];
