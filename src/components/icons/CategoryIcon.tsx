import { cn } from "@/lib/utils";
import type { ReactElement, SVGProps } from "react";

/**
 * Crisp, theme-aware category icons rendered as inline SVG.
 *
 * Every glyph uses `currentColor` for the stroke and a soft accent fill so it
 * picks up the surrounding text colour (active state highlights via Tailwind
 * `text-primary`). Replaces the previous PNG illustrations which were heavy,
 * inconsistent in weight, and blurred at small sizes.
 *
 * Style rules (keep consistent if you add a new glyph):
 *  - 24x24 viewBox, stroke-linecap/linejoin: round, stroke-width: 1.6
 *  - Filled accent body in `text-primary/15`, line on top in `currentColor`
 *  - No drop shadows, no gradients — flat, friendly, fast
 */

type GlyphProps = SVGProps<SVGSVGElement>;

const Body = ({ d }: { d: string }) => (
  <>
    <path d={d} className="fill-current opacity-15" />
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
  </>
);

const Cattle = (p: GlyphProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <Body d="M4 12c0-3 2-5 5-5 .8 0 1.4-1.2 3-1.2S14.2 7 15 7c3 0 5 2 5 5 0 1.2-.6 2-1.5 2.3v2.2c0 1.4-1.1 2.5-2.5 2.5h-8A2.5 2.5 0 0 1 5.5 16.5v-2.2C4.6 14 4 13.2 4 12Z" />
    <circle cx="9.5" cy="13" r="0.9" fill="currentColor" />
    <circle cx="14.5" cy="13" r="0.9" fill="currentColor" />
    <path d="M10.5 16.2c.5.5 2.5.5 3 0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M6.8 8.2c-.6-.8-.6-2 .2-2.6.8-.6 2 0 2 1M17.2 8.2c.6-.8.6-2-.2-2.6-.8-.6-2 0-2 1" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
  </svg>
);

const Goat = (p: GlyphProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <Body d="M5 13c0-3 2.2-5 5-5h1.5l1-2.5c.3-.7 1.3-.5 1.3.3V8c2.5.2 4.2 2.3 4.2 5v3a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-3Z" />
    <path d="M8.5 4.5c-.5 1.2-.3 2.3.5 3M16 4.5c.5 1.2.3 2.3-.5 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <circle cx="9.5" cy="13.5" r="0.8" fill="currentColor" />
    <circle cx="14.5" cy="13.5" r="0.8" fill="currentColor" />
    <path d="M11.5 17v1.5M13.5 17v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const Sheep = (p: GlyphProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <Body d="M6 12c0-1.4 1.1-2.5 2.5-2.5.3-1.4 1.6-2.5 3-2.5h1c1.4 0 2.7 1.1 3 2.5C16.9 9.5 18 10.6 18 12c0 1-.6 1.9-1.5 2.3v1.7a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-1.7C6.6 13.9 6 13 6 12Z" />
    <circle cx="10.5" cy="12.5" r="0.8" fill="currentColor" />
    <circle cx="13.5" cy="12.5" r="0.8" fill="currentColor" />
    <path d="M10 18v1.5M14 18v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const Poultry = (p: GlyphProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <Body d="M7 14c0-3 2.5-5.5 5.5-5.5S18 11 18 14v2.5a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V14Z" />
    <path d="M12 8.5V6.5c0-1 .8-1.8 1.8-1.8.6 0 1 .4 1 1" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <path d="M14.5 5.2l1.5-.4-.6 1.4" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    <circle cx="11" cy="12.5" r="0.8" fill="currentColor" />
    <path d="M12.2 13.5l1.3.6-1.3.6" fill="currentColor" />
    <path d="M10 18.5v1.5M14 18.5v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const Pig = (p: GlyphProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <Body d="M4.5 12.5C4.5 9.5 7.5 7 11 7h2c3.5 0 6.5 2.5 6.5 5.5v3a2 2 0 0 1-2 2h-1l-.5 1.5h-1L14.5 17h-5l-.5 1h-1l-.5-1.5h-1a2 2 0 0 1-2-2v-2Z" />
    <ellipse cx="12" cy="13" rx="2" ry="1.5" fill="currentColor" opacity=".2" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="11.2" cy="13" r="0.4" fill="currentColor" />
    <circle cx="12.8" cy="13" r="0.4" fill="currentColor" />
    <circle cx="9" cy="11" r="0.7" fill="currentColor" />
    <circle cx="15" cy="11" r="0.7" fill="currentColor" />
    <path d="M7 9c-.5-.7-.3-1.7.5-2M17 9c.5-.7.3-1.7-.5-2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </svg>
);

const Rabbit = (p: GlyphProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <Body d="M7 16c0-3 2.2-5 5-5s5 2 5 5v.5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V16Z" />
    <path d="M9 11.5C8 9.5 8 6 9.5 5.5c1.2-.4 1.5 2 1.5 4M15 11.5c1-2 1-5.5-.5-6-1.2-.4-1.5 2-1.5 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <circle cx="10.5" cy="15" r="0.7" fill="currentColor" />
    <circle cx="13.5" cy="15" r="0.7" fill="currentColor" />
    <path d="M11.5 17l.5.5.5-.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

const Fish = (p: GlyphProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <Body d="M3 12c2-3.5 5.5-5 9-5s6 2 7.5 5c-1.5 3-4 5-7.5 5s-7-1.5-9-5Z" />
    <path d="M19.5 12 22 9v6l-2.5-3Z" fill="currentColor" opacity=".3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <circle cx="7.5" cy="11.5" r="0.8" fill="currentColor" />
    <path d="M11 11c1 .5 2 .5 3 0M11 13c1 .5 2 .5 3 0" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
  </svg>
);

const Egg = (p: GlyphProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <Body d="M12 4c-3.5 0-6 4.5-6 8.5S8.5 19 12 19s6-2 6-6.5S15.5 4 12 4Z" />
    <path d="M9 13c.5-1.5 1.5-2.5 3-2.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

const All = (p: GlyphProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <Body d="M5 6h6v6H5zM13 6h6v6h-6zM5 14h6v6H5zM13 14h6v6h-6z" />
  </svg>
);

const Lot = (p: GlyphProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <Body d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" />
    <path d="M4 8.5 12 13l8-4.5M12 13v7" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
  </svg>
);

const GLYPHS: Record<string, (p: GlyphProps) => ReactElement> = {
  cattle: Cattle,
  goat: Goat,
  sheep: Sheep,
  poultry: Poultry,
  pig: Pig,
  rabbit: Rabbit,
  fish: Fish,
  egg: Egg,
  all: All,
  lot: Lot,
};

const LABEL: Record<string, string> = {
  cattle: "Cattle",
  goat: "Goat",
  sheep: "Sheep",
  poultry: "Poultry",
  pig: "Pig",
  rabbit: "Rabbit",
  fish: "Fish",
  egg: "Eggs",
  all: "All livestock",
  lot: "Mixed lot",
};

export interface CategoryIconProps {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
}

export function CategoryIcon({ name, size = 40, className, alt }: CategoryIconProps) {
  const Glyph = GLYPHS[name] ?? All;
  return (
    <span
      role="img"
      aria-label={alt ?? LABEL[name] ?? "Category"}
      className={cn("inline-flex items-center justify-center text-primary", className)}
      style={{ width: size, height: size }}
    >
      <Glyph width={size} height={size} />
    </span>
  );
}
