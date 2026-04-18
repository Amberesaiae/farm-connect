import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { GHANA_REGIONS, LIVESTOCK_CATEGORIES } from "@/lib/constants";
import type { ListingCardData } from "@/components/listing/ListingCard";
import { Search } from "lucide-react";

interface ListingsSearch {
  q?: string;
  category?: string;
  region?: string;
  verifiedOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const Route = createFileRoute("/listings")({
  validateSearch: (s: Record<string, unknown>): ListingsSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    region: typeof s.region === "string" ? s.region : undefined,
    verifiedOnly: s.verifiedOnly === true || s.verifiedOnly === "true",
    minPrice: typeof s.minPrice === "string" ? Number(s.minPrice) : undefined,
    maxPrice: typeof s.maxPrice === "string" ? Number(s.maxPrice) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse livestock — Farmlink" },
      {
        name: "description",
        content: "Browse cattle, goats, sheep, poultry and more from sellers across Ghana.",
      },
      { property: "og:title", content: "Browse livestock — Farmlink" },
      { property: "og:description", content: "Find livestock for sale across Ghana." },
    ],
  }),
  component: ListingsPage,
});

interface Row {
  id: string;
  title: string;
  category: string;
  price_ghs: number | string;
  price_unit: string;
  region: string;
  district: string | null;
  created_at: string;
  seller_id: string;
  listing_photos: { storage_path: string; is_cover: boolean; display_order: number }[];
  profiles: { badge_tier: string | null } | null;
}

function ListingsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      let query = supabase
        .from("listings")
        .select(
          "id,title,category,price_ghs,price_unit,region,district,created_at,seller_id,listing_photos(storage_path,is_cover,display_order),profiles!listings_seller_id_fkey(badge_tier)",
        )
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(48);

      if (search.category) query = query.eq("category", search.category);
      if (search.region) query = query.eq("region", search.region);
      if (typeof search.minPrice === "number" && !Number.isNaN(search.minPrice))
        query = query.gte("price_ghs", search.minPrice);
      if (typeof search.maxPrice === "number" && !Number.isNaN(search.maxPrice))
        query = query.lte("price_ghs", search.maxPrice);
      if (search.q) query = query.textSearch("search_vector", search.q, { type: "websearch" });

      const { data, error } = await query;
      if (cancelled) return;
      if (error) {
        console.error(error);
        setRows([]);
      } else {
        const mapped: ListingCardData[] = (data as unknown as Row[]).map((r) => {
          const photos = [...(r.listing_photos ?? [])].sort(
            (a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || a.display_order - b.display_order,
          );
          return {
            id: r.id,
            title: r.title,
            category: r.category,
            price_ghs: r.price_ghs,
            price_unit: r.price_unit,
            region: r.region,
            district: r.district,
            created_at: r.created_at,
            cover_path: photos[0]?.storage_path ?? null,
            seller_badge: r.profiles?.badge_tier ?? null,
          };
        });
        const filtered = search.verifiedOnly
          ? mapped.filter((m) => m.seller_badge && m.seller_badge !== "none")
          : mapped;
        setRows(filtered);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [search.q, search.category, search.region, search.verifiedOnly, search.minPrice, search.maxPrice]);

  const update = (patch: Partial<ListingsSearch>) => {
    navigate({ to: "/listings", search: { ...search, ...patch } as never });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Browse livestock</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} listing{rows.length === 1 ? "" : "s"} from sellers across Ghana
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border border-border bg-background p-4 space-y-4 self-start">
            <div>
              <Label htmlFor="q">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="q"
                  defaultValue={search.q ?? ""}
                  placeholder="e.g. Sanga, Boer goat"
                  className="pl-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") update({ q: (e.target as HTMLInputElement).value || undefined });
                  }}
                />
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={search.category ?? "all"}
                onValueChange={(v) => update({ category: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {LIVESTOCK_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Region</Label>
              <Select
                value={search.region ?? "all"}
                onValueChange={(v) => update({ region: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="mt-1 w-full">
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min">Min GH₵</Label>
                <Input
                  id="min"
                  type="number"
                  defaultValue={search.minPrice ?? ""}
                  className="mt-1"
                  onBlur={(e) =>
                    update({ minPrice: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max">Max GH₵</Label>
                <Input
                  id="max"
                  type="number"
                  defaultValue={search.maxPrice ?? ""}
                  className="mt-1"
                  onBlur={(e) =>
                    update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="vo">Verified sellers only</Label>
              <Switch
                id="vo"
                checked={!!search.verifiedOnly}
                onCheckedChange={(c) => update({ verifiedOnly: c || undefined })}
              />
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate({ to: "/listings", search: {} as never })}
            >
              Clear filters
            </Button>
          </aside>

          <section>
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] animate-pulse rounded-xl bg-surface"
                  />
                ))}
              </div>
            ) : (
              <ListingGrid
                listings={rows}
                emptyMessage="No listings match your filters yet. Try clearing some filters."
              />
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
