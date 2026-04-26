import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  ServiceProfileCard,
  type ServiceProfileCardData,
} from "@/components/services/ServiceProfileCard";
import { supabase } from "@/integrations/supabase/client";
import { GHANA_REGIONS } from "@/lib/constants";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Search {
  category?: string;
  region?: string;
}

export const Route = createFileRoute("/services")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    region: typeof s.region === "string" ? s.region : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Services for farmers — farmlink" },
      {
        name: "description",
        content: "Find vets, livestock transport, feed suppliers and insurance partners across Ghana.",
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

function ServicesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { taxonomy } = useTaxonomy();
  const [rows, setRows] = useState<ServiceProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      let q = supabase
        .from("service_profiles")
        .select(
          "id,slug,business_name,category,blurb,coverage_regions,pricing_model,base_rate_ghs,cover_path,rating_avg,rating_count,badge_tier",
        )
        .eq("is_active", true)
        .order("rating_count", { ascending: false })
        .limit(60);
      if (search.category) q = q.eq("category", search.category);
      if (search.region) q = q.contains("coverage_regions", [search.region]);
      const { data } = await q;
      if (!cancelled) {
        setRows((data ?? []) as ServiceProfileCardData[]);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [search.category, search.region]);

  const filters = useMemo(
    () => [
      { value: "all", label: "All" },
      ...taxonomy.categoriesFor("services").map((c) => ({ value: c.slug, label: c.label })),
    ],
    [taxonomy],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <header className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary">
            Service providers
          </span>
          <h1 className="font-display mt-3 text-[32px] font-extrabold leading-[1.05] tracking-tight md:text-[40px]">
            Vets, transport & feed across Ghana
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            Browse verified service providers and request a quote in seconds — no WhatsApp ping-pong required.
          </p>
          <Button asChild className="mt-4 rounded-xl">
            <a href="/dashboard/provider">Become a provider</a>
          </Button>
        </header>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          {filters.map((f) => {
            const active = f.value === "all" ? !search.category : search.category === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() =>
                  navigate({
                    to: "/services",
                    search: {
                      ...search,
                      category: f.value === "all" ? undefined : f.value,
                    } as never,
                  })
                }
                className={cn(
                  "rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            );
          })}
          <div className="ml-auto w-[180px]">
            <Select
              value={search.region ?? "all"}
              onValueChange={(v) =>
                navigate({
                  to: "/services",
                  search: { ...search, region: v === "all" ? undefined : v } as never,
                })
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {GHANA_REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[5/4] animate-pulse rounded-2xl border-[1.5px] border-border bg-card"
              />
            ))
          ) : rows.length === 0 ? (
            <p className="col-span-full rounded-2xl border-[1.5px] border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No providers match these filters yet.
            </p>
          ) : (
            rows.map((s) => <ServiceProfileCard key={s.id} profile={s} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
