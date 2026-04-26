import { Link } from "@tanstack/react-router";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { cn } from "@/lib/utils";

export function CategoryStrip({ active }: { active?: string }) {
  const { taxonomy } = useTaxonomy();
  const cats = taxonomy.categoriesFor("livestock");
  // Resolve `active` (which may be a legacy alias e.g. "goat") to the canonical
  // slug so chips highlight correctly across old and new URLs.
  const activeCanonical = taxonomy.canonicalSlug("livestock", active) ?? active;
  return (
    <>
      {/* Mobile horizontal scroll */}
      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar md:hidden">
        <ul className="flex min-w-max gap-2 pb-1">
          <CatItem active={!active} value={null} label="All" icon="all" />
          {cats.map((c) => (
            <CatItem
              key={c.slug}
              active={activeCanonical === c.slug}
              value={c.slug}
              label={c.label}
              icon={c.iconKey ?? c.slug}
            />
          ))}
        </ul>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:block">
        <ul
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${cats.length + 1}, minmax(0, 1fr))` }}
        >
          <CatItem active={!active} value={null} label="All" icon="all" />
          {cats.map((c) => (
            <CatItem
              key={c.slug}
              active={activeCanonical === c.slug}
              value={c.slug}
              label={c.label}
              icon={c.iconKey ?? c.slug}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

function CatItem({
  value,
  label,
  icon,
  active,
}: {
  value: string | null;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        to="/listings"
        search={(value ? { category: value } : {}) as never}
        className={cn(
          "group flex w-[76px] flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition-all md:w-auto",
          "hover:-translate-y-0.5",
        )}
      >
        <span
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl border-[1.5px] bg-card transition-all",
            active
              ? "border-primary bg-primary-soft shadow-sm"
              : "border-border group-hover:border-primary group-hover:bg-primary-soft",
          )}
        >
          <CategoryIcon name={icon} size={42} />
        </span>
        <span
          className={cn(
            "text-[11.5px] font-semibold leading-tight transition-colors",
            active ? "text-primary" : "text-muted-foreground group-hover:text-primary",
          )}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}
