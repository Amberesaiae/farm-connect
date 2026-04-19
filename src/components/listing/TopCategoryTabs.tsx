import { Link } from "@tanstack/react-router";
import { TOP_CATEGORIES, type TopCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface Props {
  active?: TopCategory;
}

export function TopCategoryTabs({ active }: Props) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div className="flex w-max gap-1.5 rounded-2xl border-[1.5px] border-border bg-card p-1.5">
        <Link
          to="/listings"
          search={{} as never}
          className={cn(
            "inline-flex items-center rounded-xl px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
            !active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-surface hover:text-foreground",
          )}
        >
          All
        </Link>
        {TOP_CATEGORIES.map((c) => {
          const isActive = active === c.value;
          return (
            <Link
              key={c.value}
              to="/listings"
              search={{ topCategory: c.value } as never}
              className={cn(
                "inline-flex items-center rounded-xl px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground",
              )}
            >
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
