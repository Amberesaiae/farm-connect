import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import catCattle from "@/assets/cat-cattle.jpg";
import catGoats from "@/assets/cat-goats.jpg";
import catSheep from "@/assets/cat-sheep.jpg";
import catPoultry from "@/assets/cat-poultry.jpg";
import catSwine from "@/assets/cat-swine.jpg";
import catFeed from "@/assets/cat-feed.jpg";

const IMAGE_BY_KEY: Record<string, string> = {
  cattle: catCattle,
  cow: catCattle,
  goats: catGoats,
  goat: catGoats,
  sheep: catSheep,
  poultry: catPoultry,
  chicken: catPoultry,
  swine: catSwine,
  pig: catSwine,
  feed: catFeed,
};

const TONES = [
  "bg-surface-peach",
  "bg-surface-mint",
  "bg-surface-sky",
  "bg-surface-butter",
  "bg-surface-rose",
  "bg-surface-lilac",
] as const;

/**
 * Agora-style circular pastel disc with a product photo inside.
 * Label sits below; count chip slides in on hover.
 */
export function CategoryTile({
  label,
  count,
  iconKey,
  to,
  search,
  index = 0,
}: {
  label: string;
  count: number | null;
  iconKey: string;
  to: string;
  search?: Record<string, string>;
  index?: number;
}) {
  const tone = TONES[index % TONES.length];
  const img = IMAGE_BY_KEY[iconKey] ?? IMAGE_BY_KEY[label.toLowerCase()] ?? null;

  return (
    <Link
      to={to as never}
      search={search as never}
      className="group block focus-visible:outline-none"
      aria-label={`Browse ${label}${count != null ? ` — ${count} listings` : ""}`}
    >
      <div
        className={cn(
          "relative grid aspect-square place-items-center overflow-hidden rounded-full transition-transform group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
          tone,
        )}
      >
        {img ? (
          <img
            src={img}
            alt=""
            loading="lazy"
            width={512}
            height={512}
            className="h-[78%] w-[78%] object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="font-display text-[36px] font-extrabold text-foreground/30">
            {label[0]}
          </span>
        )}
      </div>
      <p className="mt-3 text-center text-[14px] font-bold text-foreground transition-colors group-hover:text-primary">
        {label}
      </p>
      <p className="text-center text-[11px] font-medium text-muted-foreground">
        {count == null ? "·" : count === 0 ? "Be the first" : `${count} listed`}
      </p>
    </Link>
  );
}
