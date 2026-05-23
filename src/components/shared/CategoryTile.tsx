import { Link } from "@tanstack/react-router";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import { cn } from "@/lib/utils";

const TONES = [
  "bg-surface-mint",
  "bg-surface-peach",
  "bg-surface-butter",
  "bg-surface-sky",
  "bg-surface-lilac",
  "bg-surface-rose",
] as const;

/** Pastel-tinted square category tile à la Agora's "Featured Categories" strip. */
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
  return (
    <Link
      to={to as never}
      search={search as never}
      className="group block focus-visible:outline-none"
    >
      <div
        className={cn(
          "relative grid aspect-square place-items-center overflow-hidden rounded-3xl border border-border/60 transition-transform group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
          tone,
        )}
      >
        <CategoryIcon name={iconKey} size={56} className="text-foreground/80" />
      </div>
      <div className="mt-3 text-center">
        <p className="truncate text-[13.5px] font-bold text-foreground transition-colors group-hover:text-primary">
          {label}
        </p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          {count == null ? "—" : count === 0 ? "Be the first" : `${count} listed`}
        </p>
      </div>
    </Link>
  );
}