import { Link } from "@tanstack/react-router";
import { Beef, Bird, Fish, Rabbit, Egg, Shapes, Drumstick, Wheat } from "lucide-react";
import { cn } from "@/lib/utils";

interface Cat {
  value: string;
  label: string;
  Icon: typeof Beef;
}

const CATEGORIES: Cat[] = [
  { value: "cattle", label: "Cattle", Icon: Beef },
  { value: "goat", label: "Goats", Icon: Wheat },
  { value: "sheep", label: "Sheep", Icon: Bird },
  { value: "poultry", label: "Poultry", Icon: Drumstick },
  { value: "pig", label: "Pigs", Icon: Beef },
  { value: "rabbit", label: "Rabbits", Icon: Rabbit },
  { value: "fish", label: "Fish", Icon: Fish },
  { value: "egg", label: "Eggs", Icon: Egg },
];

export function CategoryStrip({ active }: { active?: string }) {
  // Mobile: horizontal scroll. Desktop: 9-column grid (All + 8 cats).
  return (
    <>
      {/* Mobile horizontal scroll */}
      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar md:hidden">
        <ul className="flex min-w-max gap-2 pb-1">
          <CatItem active={!active} value={null} label="All" Icon={Shapes} />
          {CATEGORIES.map((c) => (
            <CatItem key={c.value} active={active === c.value} value={c.value} label={c.label} Icon={c.Icon} />
          ))}
        </ul>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:block">
        <ul className="grid grid-cols-9 gap-2">
          <CatItem active={!active} value={null} label="All" Icon={Shapes} />
          {CATEGORIES.map((c) => (
            <CatItem key={c.value} active={active === c.value} value={c.value} label={c.label} Icon={c.Icon} />
          ))}
        </ul>
      </div>
    </>
  );
}

function CatItem({
  value,
  label,
  Icon,
  active,
}: {
  value: string | null;
  label: string;
  Icon: typeof Beef;
  active: boolean;
}) {
  return (
    <li>
      <Link
        to="/listings"
        search={(value ? { category: value } : {}) as never}
        className={cn(
          "group flex w-[72px] flex-col items-center gap-2 rounded-2xl px-2 py-3.5 text-center transition-all md:w-auto",
          "hover:-translate-y-0.5 hover:bg-surface",
        )}
      >
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] bg-card transition-colors",
            active
              ? "border-primary bg-primary-soft text-primary"
              : "border-border text-muted-foreground group-hover:border-primary group-hover:bg-primary-soft group-hover:text-primary",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
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
