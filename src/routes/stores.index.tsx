import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StoreCard, type StoreCardData, type StoreKind } from "@/components/store/StoreCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GHANA_REGIONS } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TABS: { value: "all" | StoreKind; label: string }[] = [
  { value: "all", label: "All shops" },
  { value: "hatchery", label: "Hatcheries" },
  { value: "service", label: "Services" },
  { value: "agro", label: "Feed · Agromed · Equipment" },
];

export const Route = createFileRoute("/stores/")({
  head: () => ({
    meta: [
      { title: "Vendor shops — farmlink" },
      { name: "description", content: "Browse approved hatcheries, service providers, feed dealers, agromed pharmacies and equipment shops on Farmlink." },
      { property: "og:title", content: "Vendor shops — farmlink" },
      { property: "og:description", content: "All Farmlink-verified vendors in one directory." },
    ],
  }),
  loader: async () => {
    const { data, error } = await supabase
      .from("vendor_stores_v")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { stores: (data ?? []) as StoreCardData[] };
  },
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <h1 className="font-display text-xl font-extrabold">Couldn't load shops</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <Button className="mt-6 rounded-xl" onClick={() => router.invalidate()}>Try again</Button>
        </div>
      </AppShell>
    );
  },
  component: StoresIndex,
});

function StoresIndex() {
  const { stores } = Route.useLoaderData();
  const [tab, setTab] = useState<"all" | StoreKind>("all");
  const [region, setRegion] = useState<string>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      if (tab !== "all" && s.store_kind !== tab) return false;
      if (region !== "all" && s.region !== region) return false;
      if (q.trim() && !s.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
      return true;
    });
  }, [stores, tab, region, q]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-5 md:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-extrabold tracking-tight">Shops</h1>
            <p className="mt-1 text-[14px] text-muted-foreground">Verified hatcheries, service providers and agro dealers.</p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/dashboard/store">Open a shop</Link>
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5 rounded-2xl border-[1.5px] border-border bg-card p-1.5">
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`rounded-xl px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name…" className="max-w-xs rounded-xl" />
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[180px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {GHANA_REGIONS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
            </SelectContent>
          </Select>
          <span className="text-[12px] text-muted-foreground">{filtered.length} shop{filtered.length === 1 ? "" : "s"}</span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => <StoreCard key={`${s.store_kind}:${s.id}`} store={s} />)}
        </div>
        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            No shops match these filters yet.
          </div>
        )}
      </div>
    </AppShell>
  );
}
