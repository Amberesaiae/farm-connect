import { Link } from "@tanstack/react-router";
import type { Category } from "@/lib/data";

export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      to="/freshly-stocked"
      search={{ category: category.name }}
      className="flex flex-col items-center gap-2"
    >
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-surface-2">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <span className="text-center text-xs font-medium text-foreground">{category.name}</span>
    </Link>
  );
}
