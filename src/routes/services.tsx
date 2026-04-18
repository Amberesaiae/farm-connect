import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ServiceCard } from "@/components/services/ServiceCard";
import {
  SERVICES,
  SERVICE_CATEGORY_LABEL,
  type ServiceCategory,
} from "@/lib/services-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services for farmers — farmlink" },
      {
        name: "description",
        content:
          "Find vets, livestock transport, feed & agro-vet supply and insurance partners across Ghana.",
      },
      { property: "og:title", content: "Services for farmers — farmlink" },
      {
        property: "og:description",
        content: "Vet, transport, feed and insurance partners across Ghana.",
      },
    ],
  }),
  component: ServicesPage,
});

const FILTERS: ("all" | ServiceCategory)[] = [
  "all",
  "vet",
  "transport",
  "feed",
  "insurance",
  "training",
];

function ServicesPage() {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("all");
  const visible = useMemo(
    () => (active === "all" ? SERVICES : SERVICES.filter((s) => s.category === active)),
    [active],
  );
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <header className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary">
            Partner directory · v1
          </span>
          <h1 className="font-display mt-3 text-[32px] font-extrabold leading-[1.05] tracking-tight md:text-[40px]">
            Services for Ghanaian farmers
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            A curated list of vets, transport operators, feed & agro-vet suppliers and
            insurers serving livestock farmers across Ghana. Tap any partner to start a
            WhatsApp conversation.
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
              {f === "all" ? "All services" : SERVICE_CATEGORY_LABEL[f]}
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>

        <p className="mt-10 rounded-2xl border-[1.5px] border-dashed border-border bg-card p-5 text-[13px] text-muted-foreground">
          Run a vet practice, agro-vet shop or transport business?{" "}
          <span className="font-semibold text-foreground">
            Self-listing is coming soon —
          </span>{" "}
          email <span className="font-mono text-primary">partners@farmlink.gh</span> to be
          added to this directory in the meantime.
        </p>
      </div>
    </AppShell>
  );
}
