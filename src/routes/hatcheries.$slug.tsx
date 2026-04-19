import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HatcheryProfileHero } from "@/components/hatchery/HatcheryProfileHero";
import { BatchCard, type BatchCardData } from "@/components/hatchery/BatchCard";
import { supabase } from "@/integrations/supabase/client";
import type { HatcheryCategory } from "@/lib/categories";

export const Route = createFileRoute("/hatcheries/$slug")({
  loader: async ({ params }) => {
    const { data: hatchery, error } = await supabase
      .from("hatcheries")
      .select(
        "id, slug, name, category, region, district, blurb, cover_path, capacity_per_cycle, permit_authority, permit_number",
      )
      .eq("slug", params.slug)
      .eq("status", "approved")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!hatchery) throw notFound();
    return { hatchery };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.hatchery.name ?? "Hatchery"} — farmlink` },
      {
        name: "description",
        content: loaderData?.hatchery.blurb ?? "Reserve chicks and breeding stock on Farmlink.",
      },
      { property: "og:title", content: `${loaderData?.hatchery.name ?? "Hatchery"} — farmlink` },
      {
        property: "og:description",
        content: loaderData?.hatchery.blurb ?? "Reserve chicks and breeding stock on Farmlink.",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="font-display text-2xl font-extrabold">Could not load hatchery</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link to="/hatcheries" className="mt-4 inline-block font-semibold text-primary">
          ← Back to hatcheries
        </Link>
      </div>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="font-display text-2xl font-extrabold">Hatchery not found</h1>
        <Link to="/hatcheries" className="mt-4 inline-block font-semibold text-primary">
          ← Back to hatcheries
        </Link>
      </div>
    </AppShell>
  ),
  component: HatcheryProfilePage,
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
  capacity_per_cycle: number | null;
  permit_authority: string | null;
  permit_number: string | null;
}

function HatcheryProfilePage() {
  const { hatchery } = Route.useLoaderData() as { hatchery: HatcheryRow };
  const [batches, setBatches] = useState<BatchCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("hatchery_batches")
        .select(
          "id, batch_type, breed, hatch_date, pickup_start_date, pickup_end_date, total_quantity, reserved_quantity, price_per_unit, unit_label, region, status, min_order_qty",
        )
        .eq("hatchery_id", hatchery.id)
        .in("status", ["open", "full"])
        .order("pickup_start_date", { ascending: true });
      setBatches((data ?? []) as BatchCardData[]);
      setLoading(false);
    })();
  }, [hatchery.id]);

  const open = batches.filter((b) => b.status === "open");
  const full = batches.filter((b) => b.status === "full");

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <Link
          to="/hatcheries"
          className="inline-block text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
        >
          ← All hatcheries
        </Link>
        <div className="mt-3">
          <HatcheryProfileHero hatchery={hatchery} />
        </div>

        <section className="mt-8">
          <h2 className="font-display text-[22px] font-extrabold tracking-tight">
            Open batches {open.length > 0 ? `(${open.length})` : ""}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Reserve a quantity from any open batch — the hatchery confirms within 24 hours.
          </p>
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading batches…</p>
          ) : open.length === 0 ? (
            <div className="mt-4 rounded-2xl border-[1.5px] border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No open batches right now. Check back soon.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {open.map((b) => (
                <BatchCard key={b.id} hatcherySlug={hatchery.slug} batch={b} />
              ))}
            </div>
          )}
        </section>

        {full.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-[20px] font-extrabold tracking-tight text-muted-foreground">
              Recently full ({full.length})
            </h2>
            <div className="mt-4 grid gap-4 opacity-80 sm:grid-cols-2 lg:grid-cols-3">
              {full.map((b) => (
                <BatchCard key={b.id} hatcherySlug={hatchery.slug} batch={b} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12 rounded-2xl border-[1.5px] border-dashed border-border bg-card p-6 text-center">
          <p className="text-[13px] font-semibold text-foreground">Reviews & ratings</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Coming soon — buyer ratings will appear here once reservations are fulfilled.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
