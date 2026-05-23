import { Link } from "@tanstack/react-router";
import { type TopCategory } from "@/lib/categories";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { cn } from "@/lib/utils";

interface Props {
  active?: TopCategory;
}

/** Agora-style segmented pill bar — fully rounded, bright green active state. */
export function TopCategoryTabs({ active }: Props) {
  const { taxonomy } = useTaxonomy();
  const pillars = taxonomy.marketplacePillars;
  return (
    <div className="-mx-4 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
      <div className="flex w-max items-center gap-1 rounded-full bg-surface-cream p-1">
        <Link
          to="/listings"
          search={{} as never}
          className={cn(
            "inline-flex h-10 items-center rounded-full px-5 text-[13px] font-semibold transition-colors",
            !active
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-foreground/70 hover:text-foreground",
          )}
        >
          All
        </Link>
        {pillars.map((c) => {
          const isActive = active === c.slug;
          return (
            <Link
              key={c.slug}
              to="/listings"
              search={{ topCategory: c.slug } as never}
              className={cn(
                "inline-flex h-10 items-center rounded-full px-5 text-[13px] font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-foreground/70 hover:text-foreground",
              )}
            >
              {c.shortLabel || c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
