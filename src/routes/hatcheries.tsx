import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HatcheryCard } from "@/components/services/HatcheryCard";
import {
  HATCHERIES,
  HATCHERY_CATEGORY_LABEL,
  type HatcheryCategory,
} from "@/lib/hatcheries-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hatcheries")({
  head: () => ({
    meta: [
      { title: "Hatcheries & breeders — farmlink" },
      {
        name: "description",
        content:
          "Day-old chicks, fish fingerlings and breeding stock from hatcheries across Ghana.",
      },
      { property: "og:title", content: "Hatcheries & breeders — farmlink" },
      {
        property: "og:description",
        content: "Day-old chicks, fingerlings and breeding stock across Ghana.",
      },
    ],
  }),
  component: HatcheriesPage,
});

const FILTERS: ("all" | HatcheryCategory)[] = ["all", "poultry", "fish", "breeding"];

function HatcheriesPage() {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("all");
  const visible = useMemo(
    () => (active === "all" ? HATCHERIES : HATCHERIES.filter((h) => h.category === active)),
    [active],
  );
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <header className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-secondary/15 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-secondary">
            Partner directory · v1
          </span>
          <h1 className="font-display mt-3 text-[32px] font-extrabold leading-[1.05] tracking-tight md:text-[40px]">
            Hatcheries & breeders
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            Day-old poultry chicks, fish fingerlings and pedigree breeding stock — sourced
            from hatcheries and breeders across Ghana. Contact directly via WhatsApp.
          </p>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              className={cn(
                "rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                active === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {f === "all" ? "All hatcheries" : HATCHERY_CATEGORY_LABEL[f]}
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((h) => (
            <HatcheryCard key={h.id} hatchery={h} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
