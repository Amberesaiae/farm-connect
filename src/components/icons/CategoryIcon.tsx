import { cn } from "@/lib/utils";
import cattle from "@/assets/icons/cattle.png";
import goat from "@/assets/icons/goat.png";
import sheep from "@/assets/icons/sheep.png";
import poultry from "@/assets/icons/poultry.png";
import pig from "@/assets/icons/pig.png";
import rabbit from "@/assets/icons/rabbit.png";
import all from "@/assets/icons/all.png";
import lot from "@/assets/icons/lot.png";

/**
 * High-end illustrated category icons (PNG, transparent).
 * Drawn in a soft, friendly line+fill style — sits on the Farmlink cream/white
 * surfaces without needing a tinted background.
 */

const MAP: Record<string, string> = {
  cattle,
  goat,
  sheep,
  poultry,
  pig,
  rabbit,
  all,
  lot,
  // Fallbacks (no dedicated illustration yet — reuse closest match)
  fish: all,
  egg: poultry,
};

const LABEL: Record<string, string> = {
  cattle: "Cattle",
  goat: "Goat",
  sheep: "Sheep",
  poultry: "Poultry",
  pig: "Pig",
  rabbit: "Rabbit",
  all: "All livestock",
  lot: "Mixed lot",
  fish: "Fish",
  egg: "Eggs",
};

export interface CategoryIconProps {
  name: keyof typeof MAP | string;
  size?: number;
  className?: string;
  alt?: string;
}

export function CategoryIcon({ name, size = 40, className, alt }: CategoryIconProps) {
  const src = MAP[name] ?? all;
  return (
    <img
      src={src}
      alt={alt ?? LABEL[name] ?? "Category"}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={cn("inline-block object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
