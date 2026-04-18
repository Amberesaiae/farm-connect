import cattleHero from "@/assets/hero-livestock.jpg";
import goatsHero from "@/assets/goats-hero.jpg";
import poultryHero from "@/assets/poultry-hero.jpg";
import mixedHero from "@/assets/mixed-hero.jpg";

export interface HeroContent {
  src: string;
  alt: string;
  eyebrow: string;
  headline: string;
  highlight: string;
  subcopy: string;
}

const DEFAULT: HeroContent = {
  src: mixedHero,
  alt: "Mixed livestock grazing in a Ghanaian savanna at golden hour",
  eyebrow: "Verified farmers · 16 regions",
  headline: "Ghana's livestock",
  highlight: "marketplace.",
  subcopy:
    "Cattle, goats, sheep, poultry — listed by farmers, priced transparently, one WhatsApp tap away. No middlemen. No guesswork.",
};

const MAP: Record<string, HeroContent> = {
  cattle: {
    src: cattleHero,
    alt: "West African cattle in a Ghanaian savanna at golden hour",
    eyebrow: "Verified herders · 16 regions",
    headline: "Cattle from",
    highlight: "verified farmers.",
    subcopy:
      "Sanga, N'Dama and crossbreeds straight from herders in the Northern, Savannah and Upper regions. Honest pricing, direct WhatsApp contact.",
  },
  goat: {
    src: goatsHero,
    alt: "West African dwarf goats grazing on green pasture in Ghana",
    eyebrow: "Healthy stock · 16 regions",
    headline: "Healthy goats,",
    highlight: "fair prices.",
    subcopy:
      "West African Dwarf, Boer crossbreeds and breeding stock from farmers across Ghana. No middlemen, no surprises.",
  },
  poultry: {
    src: poultryHero,
    alt: "Free-range chickens on a small farm in Ghana",
    eyebrow: "Day-olds, layers, broilers",
    headline: "Poultry from",
    highlight: "trusted farms.",
    subcopy:
      "Broilers, layers, day-old chicks and dual-purpose breeds — sourced direct from Ghanaian poultry farmers and hatcheries.",
  },
};

export function heroForCategory(category?: string): HeroContent {
  if (!category) return DEFAULT;
  return MAP[category] ?? DEFAULT;
}
