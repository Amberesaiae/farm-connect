import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { HeroOffer } from "@/components/home/HeroOffer";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { MobileFilterSheet } from "@/components/layout/MobileFilterSheet";
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
import { GHANA_REGIONS } from "@/lib/constants";
import type { ListingCardData } from "@/components/listing/ListingCard";
import { TopCategoryTabs } from "@/components/listing/TopCategoryTabs";
import { TOP_CATEGORIES, type TopCategory } from "@/lib/categories";
import mixedHero from "@/assets/mixed-hero.jpg";

interface ListingsSearch {
  q?: string;
  topCategory?: TopCategory;
  category?: string;
  subcategory?: string;
  region?: string;
  verifiedOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

const TOP_VALUES = TOP_CATEGORIES.map((c) => c.value) as readonly string[];

export const Route = createFileRoute("/listings")({
  validateSearch: (s: Record<string, unknown>): ListingsSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    topCategory:
      typeof s.topCategory === "string" && TOP_VALUES.includes(s.topCategory)
        ? (s.topCategory as TopCategory)
        : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    subcategory: typeof s.subcategory === "string" ? s.subcategory : undefined,
    region: typeof s.region === "string" ? s.region : undefined,
    verifiedOnly: s.verifiedOnly === true || s.verifiedOnly === "true",
    minPrice: typeof s.minPrice === "string" ? Number(s.minPrice) : undefined,
    maxPrice: typeof s.maxPrice === "string" ? Number(s.maxPrice) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse livestock — farmlink" },
      {
        name: "description",
        content: "Browse cattle, goats, sheep, poultry and more from sellers across Ghana.",
      },
      { property: "og:title", content: "Browse livestock — farmlink" },
      { property: "og:description", content: "Find livestock for sale across Ghana." },
      { property: "og:image", content: mixedHero },
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
          "id,title,category,price_ghs,price_unit,region,district,created_at,seller_id,listing_photos(storage_path,is_cover,display_order)",
        )
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(48);

      if (search.topCategory) query = query.eq("top_category", search.topCategory);
      if (search.subcategory) query = query.eq("subcategory_slug", search.subcategory);
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
        const listings = (data as unknown as Row[]) ?? [];
        const sellerIds = Array.from(new Set(listings.map((l) => l.seller_id)));
        const profilesById = new Map<string, { badge_tier: string | null; display_name: string | null }>();
        if (sellerIds.length) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id,badge_tier,display_name")
            .in("id", sellerIds);
          for (const p of profs ?? []) {
            profilesById.set(p.id, { badge_tier: p.badge_tier, display_name: p.display_name });
          }
        }
        const mapped: ListingCardData[] = listings.map((r) => {
          const photos = [...(r.listing_photos ?? [])].sort(
            (a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || a.display_order - b.display_order,
          );
          const prof = profilesById.get(r.seller_id);
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
            seller_badge: prof?.badge_tier ?? null,
            seller_name: prof?.display_name ?? null,
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
  }, [search.q, search.topCategory, search.subcategory, search.category, search.region, search.verifiedOnly, search.minPrice, search.maxPrice]);

  const update = (patch: Partial<ListingsSearch>) => {
    navigate({ to: "/listings", search: { ...search, ...patch } as never });
  };

  const activeCount =
    (search.region ? 1 : 0) +
    (search.minPrice ? 1 : 0) +
    (search.maxPrice ? 1 : 0) +
    (search.verifiedOnly ? 1 : 0);

  const FiltersPanel = (
    <FiltersInner search={search} update={update} navigate={navigate} />
  );

  return (
    <AppShell showTrust>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 md:px-8 md:py-10">
        <HeroOffer category={search.category} />

        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[20px] font-extrabold tracking-tight md:text-[22px]">
              Marketplace
            </h2>
            <p className="hidden text-[12px] text-muted-foreground md:block">
              Filter by pillar, then drill into a category
            </p>
          </div>
          <div className="mt-4">
            <TopCategoryTabs active={search.topCategory} />
          </div>
          {search.topCategory === undefined || search.topCategory === "livestock" ? (
            <div className="mt-4">
              <CategoryStrip active={search.category} />
            </div>
          ) : null}
        </section>

        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[22px] font-extrabold tracking-tight md:text-[26px]">
                {search.category
                  ? `${search.category[0].toUpperCase()}${search.category.slice(1)} listings`
                  : "Latest listings"}
              </h2>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                {rows.length} listing{rows.length === 1 ? "" : "s"} from sellers across Ghana
              </p>
            </div>
            <MobileFilterSheet activeCount={activeCount}>{FiltersPanel}</MobileFilterSheet>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[260px_1fr]">
            <aside className="hidden self-start rounded-2xl border-[1.5px] border-border bg-card p-5 md:block">
              {FiltersPanel}
            </aside>

            <div>
              {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] animate-pulse rounded-2xl border-[1.5px] border-border bg-card"
                    />
                  ))}
                </div>
              ) : (
                <ListingGrid
                  listings={rows}
                  emptyMessage="No listings match your filters yet. Try clearing some filters."
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function FiltersInner({
  search,
  update,
  navigate,
}: {
  search: ListingsSearch;
  update: (patch: Partial<ListingsSearch>) => void;
  navigate: ReturnType<typeof useNavigate>;
}): ReactNode {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="q-rail" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Keyword
        </Label>
        <Input
          id="q-rail"
          defaultValue={search.q ?? ""}
          placeholder="e.g. Sanga, Boer"
          className="mt-1.5 h-10 rounded-xl"
          onKeyDown={(e) => {
            if (e.key === "Enter") update({ q: (e.target as HTMLInputElement).value || undefined });
          }}
        />
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Region</Label>
        <Select
          value={search.region ?? "all"}
          onValueChange={(v) => update({ region: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="mt-1.5 w-full rounded-xl">
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

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Price (GH₵)
        </Label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={search.minPrice ?? ""}
            className="h-10 rounded-xl"
            onBlur={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="Max"
            defaultValue={search.maxPrice ?? ""}
            className="h-10 rounded-xl"
            onBlur={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5">
        <Label htmlFor="vo" className="cursor-pointer text-sm font-medium">
          Verified sellers only
        </Label>
        <Switch
          id="vo"
          checked={!!search.verifiedOnly}
          onCheckedChange={(c) => update({ verifiedOnly: c || undefined })}
        />
      </div>

      <Button
        variant="ghost"
        className="w-full rounded-xl"
        onClick={() => navigate({ to: "/listings", search: {} as never })}
      >
        Clear filters
      </Button>
    </div>
  );
}
