import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hatcheryPhotoUrl } from "@/lib/hatchery-photo-url";
import { type HatcheryCategory } from "@/lib/categories";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { GHANA_REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hatcheries")({
  head: () => ({
    meta: [
      { title: "Hatcheries & breeders — farmlink" },
      {
        name: "description",
        content:
          "Day-old chicks, fish fingerlings and breeding stock from approved hatcheries across Ghana. Reserve directly in the app.",
      },
      { property: "og:title", content: "Hatcheries & breeders — farmlink" },
      {
        property: "og:description",
        content: "Reserve from approved hatcheries across Ghana — chicks, fingerlings & breeders.",
      },
    ],
  }),
  component: HatcheriesPage,
});

interface HatcheryRow {
  id: string;
  slug: string;
  name: string;
  category: HatcheryCategory;
  region: string;
  district: string | null;
  blurb: string | null;
  cover_path: string | null;
}

function HatcheriesPage() {
  const { taxonomy } = useTaxonomy();
  const [rows, setRows] = useState<HatcheryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<"all" | HatcheryCategory>("all");
  const [region, setRegion] = useState<string>("all");

  const categoryFilters = useMemo(
    () => [
      { value: "all" as const, label: "All hatcheries" },
      ...taxonomy.categoriesFor("hatcheries").map((c) => ({
        value: c.slug as HatcheryCategory,
        label: c.label,
      })),
    ],
    [taxonomy],
  );

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("hatcheries")
        .select("id, slug, name, category, region, district, blurb, cover_path")
        .eq("status", "approved")
        .order("name");
      setRows((data ?? []) as HatcheryRow[]);
      setLoading(false);
    })();
  }, []);

  const visible = useMemo(
    () =>
      rows.filter(
        (h) => (cat === "all" || h.category === cat) && (region === "all" || h.region === region),
      ),
    [rows, cat, region],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <header className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-secondary/15 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-secondary">
            Approved hatcheries
          </span>
          <h1 className="font-display mt-3 text-[32px] font-extrabold leading-[1.05] tracking-tight md:text-[40px]">
            Hatcheries & breeders
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            Day-old poultry chicks, fish fingerlings and breeding stock from hatcheries vetted by
            Farmlink. Reserve quantities directly — the hatchery confirms availability.
          </p>
          <Link
            to="/dashboard/hatchery/onboarding"
            className="mt-3 inline-block text-[12.5px] font-semibold text-primary hover:underline"
          >
            Run a hatchery? List yours →
          </Link>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {categoryFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setCat(f.value)}
              className={cn(
                "rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                cat === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRegion("all")}
            className={cn(
              "rounded-full border-[1.5px] px-3 py-1 text-[11.5px] font-semibold transition-colors",
              region === "all"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            All regions
          </button>
          {GHANA_REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              className={cn(
                "rounded-full border-[1.5px] px-3 py-1 text-[11.5px] font-semibold transition-colors",
                region === r
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-7">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading hatcheries…</p>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No approved hatcheries match this filter yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((h) => (
                <Link
                  key={h.id}
                  to="/hatcheries/$slug"
                  params={{ slug: h.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border-[1.5px] border-border bg-card transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="h-36 w-full bg-surface">
                    {h.cover_path ? (
                      <img
                        src={hatcheryPhotoUrl(h.cover_path)}
                        alt={h.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-soft to-surface">
                        <span className="font-display text-3xl font-extrabold text-primary/40">
                          {h.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="inline-flex w-fit items-center rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                      {taxonomy.labelFor("hatcheries", h.category)}
                    </span>
                    <h3 className="font-display mt-2 text-[16px] font-extrabold tracking-tight text-foreground">
                      {h.name}
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {h.district ? `${h.district}, ` : ""}
                      {h.region}
                    </p>
                    {h.blurb ? (
                      <p className="mt-2 line-clamp-3 flex-1 text-[12.5px] leading-relaxed text-foreground/75">
                        {h.blurb}
                      </p>
                    ) : null}
                    <p className="mt-3 text-[12px] font-semibold text-primary group-hover:underline">
                      View hatchery →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
