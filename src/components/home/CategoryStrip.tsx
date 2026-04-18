import { Link } from "@tanstack/react-router";
import { Beef, Bird, Fish, Rabbit, Egg, Shapes } from "lucide-react";
import { cn } from "@/lib/utils";

interface Cat {
  value: string;
  label: string;
  Icon: typeof Beef;
}

const CATEGORIES: Cat[] = [
  { value: "cattle", label: "Cattle", Icon: Beef },
  { value: "goat", label: "Goats", Icon: Bird },
  { value: "sheep", label: "Sheep", Icon: Bird },
  { value: "poultry", label: "Poultry", Icon: Egg },
  { value: "pig", label: "Pigs", Icon: Beef },
  { value: "rabbit", label: "Rabbits", Icon: Rabbit },
  { value: "fish", label: "Fish", Icon: Fish },
  { value: "other", label: "Other", Icon: Shapes },
];

export function CategoryStrip({ active }: { active?: string }) {
  return (
    <div className="-mx-4 overflow-x-auto no-scrollbar px-4">
      <ul className="flex min-w-max gap-3 pb-1">
        <li>
          <Link
            to="/listings"
            search={{} as never}
            className={cn(
              "flex w-16 flex-col items-center gap-1.5 text-center text-[11px] font-medium transition-colors",
              !active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full border transition-colors",
                !active
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-background",
              )}
            >
              <Shapes className="h-5 w-5" />
            </span>
            All
          </Link>
        </li>
        {CATEGORIES.map(({ value, label, Icon }) => {
          const isActive = active === value;
          return (
            <li key={value}>
              <Link
                to="/listings"
                search={{ category: value } as never}
                className={cn(
                  "flex w-16 flex-col items-center gap-1.5 text-center text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full border transition-colors",
                    isActive
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-background",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
