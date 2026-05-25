import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { Link } from "@tanstack/react-router";
import { MobileFilterSheet } from "@/components/layout/MobileFilterSheet";
import { ResultsBar, type ListingSort } from "@/components/listing/ResultsBar";
import { ActiveFilterChips, type FilterChip } from "@/components/listing/ActiveFilterChips";
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
import { type TopCategory } from "@/lib/categories";
import { useTaxonomy } from "@/lib/taxonomy-context";
import type { ResolvedAttribute, Taxonomy } from "@/lib/taxonomy";
import mixedHero from "@/assets/mixed-hero.jpg";
import { PageHero } from "@/components/shared/PageHero";
import { DisplayAccent } from "@/components/shared/DisplayAccent";
import { EmptyState } from "@/components/shared/EmptyState";

interface ListingsSearch {
  q?: string;
  topCategory?: TopCategory;
  category?: string;
  subcategory?: string;
  region?: string;
  verifiedOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: ListingSort;
  /** Dynamic per-category attribute filters keyed `attr_<key>`. */
  attrs?: Record<string, string>;
}

const TOP_VALUES: readonly string[] = [
  "livestock",
  "agrofeed_supplements",
  "agromed_veterinary",
  "agro_equipment_tools",
];

const SORT_VALUES: readonly ListingSort[] = ["newest", "oldest", "price_asc", "price_desc"];

export const Route = createFileRoute("/listings")({
  validateSearch: (s: Record<string, unknown>): ListingsSearch => {
    const attrs: Record<string, string> = {};
    for (const [k, v] of Object.entries(s)) {
      if (k.startsWith("attr_") && typeof v === "string" && v.length > 0) {
        attrs[k.slice(5)] = v;
      }
    }
    return {
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
      sort:
        typeof s.sort === "string" && (SORT_VALUES as readonly string[]).includes(s.sort)
          ? (s.sort as ListingSort)
          : undefined,
      attrs: Object.keys(attrs).length ? attrs : undefined,
    };
  },
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
  const { taxonomy } = useTaxonomy();
  const [rows, setRows] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolve the active category id (for filter rendering + JSONB query).
  const pillarForCat = search.topCategory ?? "livestock";
  const activeSlug = search.subcategory ?? search.category ?? null;
  const activeCategory = taxonomy.resolveCategory(pillarForCat, activeSlug);
  const filterableAttrs = taxonomy.filterableFor(activeCategory?.id);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      // Resolve any legacy alias (e.g. ?category=goat) to its canonical slug
      // so old shared links keep working with the new taxonomy.
      const pillarForCat = search.topCategory ?? "livestock";
      const canonicalSubcategory =
        search.subcategory
          ? (taxonomy.canonicalSlug(pillarForCat, search.subcategory) ?? search.subcategory)
          : null;
      const canonicalCategory = search.category
        ? (taxonomy.canonicalSlug(pillarForCat, search.category) ?? search.category)
        : null;

      let query = supabase
        .from("listings")
        .select(
          "id,title,category,price_ghs,price_unit,region,district,created_at,seller_id,listing_photos(storage_path,is_cover,display_order)",
        )
        .eq("status", "active")
        .limit(48);
      const sort: ListingSort = search.sort ?? "newest";
      if (sort === "newest") query = query.order("created_at", { ascending: false });
      else if (sort === "oldest") query = query.order("created_at", { ascending: true });
      else if (sort === "price_asc") query = query.order("price_ghs", { ascending: true });
      else if (sort === "price_desc") query = query.order("price_ghs", { ascending: false });

      if (search.topCategory) query = query.eq("top_category", search.topCategory);
      if (canonicalSubcategory) query = query.eq("subcategory_slug", canonicalSubcategory);
      // The legacy `category` column is mirrored from subcategory_slug by the DB
      // trigger, so a single canonical filter covers both old and new rows.
      if (canonicalCategory && !canonicalSubcategory) query = query.eq("category", canonicalCategory);
      if (search.region) query = query.eq("region", search.region);
      if (typeof search.minPrice === "number" && !Number.isNaN(search.minPrice))
        query = query.gte("price_ghs", search.minPrice);
      if (typeof search.maxPrice === "number" && !Number.isNaN(search.maxPrice))
        query = query.lte("price_ghs", search.maxPrice);
      if (search.q) query = query.textSearch("search_vector", search.q, { type: "websearch" });

      // Dynamic attribute filters → JSONB containment (uses GIN index).
      const attrEntries = Object.entries((search.attrs ?? {}) as Record<string, string>).filter(
        ([, v]) => typeof v === "string" && v.length > 0,
      );
      if (attrEntries.length > 0) {
        const obj: Record<string, unknown> = {};
        for (const [k, v] of attrEntries) {
          if (v === "true") obj[k] = true;
          else if (v === "false") obj[k] = false;
          else obj[k] = v;
        }
        query = query.contains("attributes", obj);
      }

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
  }, [
    search.q,
    search.topCategory,
    search.subcategory,
    search.category,
    search.region,
    search.verifiedOnly,
    search.minPrice,
    search.maxPrice,
    search.sort,
    // re-fetch when dynamic attribute filters change
    JSON.stringify(search.attrs ?? {}),
  ]);

  const update = (patch: Partial<ListingsSearch>) => {
    // When the category context changes, drop attrs that no longer apply.
    const next = { ...search, ...patch };
    if (
      ("topCategory" in patch || "subcategory" in patch || "category" in patch) &&
      !("attrs" in patch)
    ) {
      next.attrs = undefined;
    }
    // Flatten attrs into top-level `attr_<key>` search params for shareable URLs.
    const flat: Record<string, unknown> = { ...next };
    delete (flat as { attrs?: unknown }).attrs;
    for (const [k, v] of Object.entries(next.attrs ?? {})) {
      if (v) flat[`attr_${k}`] = v;
    }
    // Strip any stale `attr_*` params from current search that aren't in next.attrs.
    for (const key of Object.keys(search)) {
      if (key.startsWith("attr_") && !(key in flat)) {
        flat[key] = undefined;
      }
    }
    navigate({ to: "/listings", search: flat as never });
  };

  const activeCount =
    (search.region ? 1 : 0) +
    (search.minPrice ? 1 : 0) +
    (search.maxPrice ? 1 : 0) +
    (search.verifiedOnly ? 1 : 0) +
    (search.q ? 1 : 0) +
    Object.values(search.attrs ?? {}).filter(Boolean).length;

  const chips: FilterChip[] = [];
  if (search.q) chips.push({ key: "q", label: `"${search.q}"`, onRemove: () => update({ q: undefined }) });
  if (search.region) chips.push({ key: "region", label: search.region, onRemove: () => update({ region: undefined }) });
  if (search.minPrice) chips.push({ key: "minp", label: `Min GH₵${search.minPrice}`, onRemove: () => update({ minPrice: undefined }) });
  if (search.maxPrice) chips.push({ key: "maxp", label: `Max GH₵${search.maxPrice}`, onRemove: () => update({ maxPrice: undefined }) });
  if (search.verifiedOnly) chips.push({ key: "vo", label: "Verified only", onRemove: () => update({ verifiedOnly: undefined }) });
  for (const [k, v] of Object.entries(search.attrs ?? {})) {
    chips.push({
      key: `attr_${k}`,
      label: `${k.replace(/_/g, " ")}: ${v}`,
      onRemove: () => {
        const next = { ...(search.attrs ?? {}) };
        delete next[k];
        update({ attrs: Object.keys(next).length ? next : undefined });
      },
    });
  }

  const FiltersPanel = (
    <FiltersInner
      search={search}
      update={update}
      navigate={navigate}
      filterableAttrs={filterableAttrs}
      taxonomy={taxonomy}
    />
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 md:px-8 md:py-10">
        <PageHero
          eyebrow="Marketplace"
          title={
            <>
              Browse <DisplayAccent>fresh</DisplayAccent> livestock &amp; farm supplies.
            </>
          }
          lede="Pick a pillar, drill into a category, filter by region or breed. Every seller is one WhatsApp tap away."
        />

        {/* Pillar + subcategory navigation — secondary tier */}
        <section aria-label="Categories">
          <TopCategoryTabs active={search.topCategory} />
          <SubcategoryPills
            pillar={search.topCategory ?? "livestock"}
            active={search.category}
          />
        </section>

        <section>
          <div className="flex items-end justify-between gap-3 border-t border-border pt-6">
            <div>
              <h2 className="font-display text-[20px] font-extrabold tracking-tight md:text-[22px]">
                {search.category
                  ? `${search.category[0].toUpperCase()}${search.category.slice(1)} listings`
                  : "Latest listings"}
              </h2>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Direct from sellers across Ghana
              </p>
            </div>
            <MobileFilterSheet activeCount={activeCount}>{FiltersPanel}</MobileFilterSheet>
          </div>

          <ResultsBar
            count={rows.length}
            loading={loading}
            sort={search.sort ?? "newest"}
            onSortChange={(s) => update({ sort: s === "newest" ? undefined : s })}
            chips={
              chips.length ? (
                <ActiveFilterChips
                  chips={chips}
                  onClearAll={() => navigate({ to: "/listings", search: { topCategory: search.topCategory, category: search.category, subcategory: search.subcategory } as never })}
                />
              ) : null
            }
          />

          <div className="grid gap-6 md:grid-cols-[260px_1fr]">
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
              ) : rows.length === 0 ? (
                activeCount > 0 ? (
                  <EmptyState
                    title="No listings match these filters"
                    description="Try widening your price range, picking a different region, or clearing a filter or two."
                    action={{ to: "/listings", label: "Clear all filters" }}
                  />
                ) : (
                  <EmptyState
                    title="Nothing here yet"
                    description="Be the first to post a listing in this category."
                    action={{ to: "/post", label: "Post a listing" }}
                  />
                )
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
  filterableAttrs,
  taxonomy,
}: {
  search: ListingsSearch;
  update: (patch: Partial<ListingsSearch>) => void;
  navigate: ReturnType<typeof useNavigate>;
  filterableAttrs: ResolvedAttribute[];
  taxonomy: Taxonomy;
}): ReactNode {
  const setAttr = (key: string, value: string | undefined) => {
    const next = { ...(search.attrs ?? {}) };
    if (value === undefined || value === "" || value === "all") delete next[key];
    else next[key] = value;
    update({ attrs: Object.keys(next).length ? next : undefined });
  };

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

      {filterableAttrs.length > 0 && (
        <div className="space-y-3 rounded-xl border border-dashed border-border p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            More filters
          </div>
          {filterableAttrs.map((a) => (
            <AttributeFilter
              key={a.definition.key}
              attr={a}
              value={search.attrs?.[a.definition.key]}
              onChange={(v) => setAttr(a.definition.key, v)}
              taxonomy={taxonomy}
            />
          ))}
        </div>
      )}

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

function humanise(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function AttributeFilter({
  attr,
  value,
  onChange,
  taxonomy,
}: {
  attr: ResolvedAttribute;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  taxonomy: Taxonomy;
}) {
  const def = attr.definition;
  const label = (
    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {def.labelEn || humanise(def.key)}
    </Label>
  );

  if (def.dataType === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
        <Label className="cursor-pointer text-sm font-medium">{def.labelEn}</Label>
        <Switch
          checked={value === "true"}
          onCheckedChange={(c) => onChange(c ? "true" : undefined)}
        />
      </div>
    );
  }

  let options: { value: string; label: string }[] = [];
  if (def.dataType === "enum") {
    options = def.enumValues.map((o) => ({ value: o, label: humanise(o) }));
  } else if (def.dataType === "reference") {
    if (def.referenceTable === "breeds") {
      options = taxonomy.breeds.map((b) => ({ value: b.slug, label: b.labelEn }));
    } else if (def.referenceTable === "vaccines") {
      options = taxonomy.vaccines.map((v) => ({ value: v.slug, label: v.labelEn }));
    } else if (def.referenceTable === "feed_brands") {
      options = taxonomy.feedBrands.map((f) => ({ value: f.slug, label: f.labelEn }));
    }
  }

  if (options.length > 0) {
    return (
      <div>
        {label}
        <Select value={value ?? "all"} onValueChange={(v) => onChange(v === "all" ? undefined : v)}>
          <SelectTrigger className="mt-1.5 w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Fallback for text/number/date — free input that contains-matches.
  return (
    <div>
      {label}
      <Input
        defaultValue={value ?? ""}
        placeholder={def.helpText ?? ""}
        className="mt-1.5 h-10 rounded-xl"
        onBlur={(e) => onChange(e.target.value || undefined)}
      />
    </div>
  );
}

/**
 * Compact horizontal pill row for picking a subcategory inside the active
 * pillar. Replaces the icon-tile carousel — text labels scan in one pass,
 * no carousel-blindness, and a single tap-target row scrolls horizontally
 * on narrow viewports.
 */
function SubcategoryPills({ pillar, active }: { pillar: string; active?: string }) {
  const { taxonomy } = useTaxonomy();
  const cats = taxonomy.categoriesFor(pillar);
  const activeCanonical = taxonomy.canonicalSlug(pillar, active) ?? active;
  if (cats.length === 0) return null;
  return (
    <div className="-mx-4 mt-3 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
      <div className="flex w-max gap-1.5">
        <Link
          to="/listings"
          search={((prev: Record<string, unknown>) => ({ ...prev, category: undefined })) as never}
          className={
            !active
              ? "inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground"
              : "inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground hover:border-primary hover:text-primary"
          }
        >
          All
        </Link>
        {cats.map((c) => {
          const isActive = activeCanonical === c.slug;
          return (
            <Link
              key={c.slug}
              to="/listings"
              search={((prev: Record<string, unknown>) => ({ ...prev, category: c.slug })) as never}
              className={
                isActive
                  ? "inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground"
                  : "inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground hover:border-primary hover:text-primary"
              }
            >
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
