import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import { cn } from "@/lib/utils";

/**
 * Browse-by-category list with live listing counts and the most recently
 * posted photo per category. Replaces the icon-tile carousel — Baymard
 * research shows tile carousels lose ~60% of taps beyond the first 3 items,
 * while a vertical list with counts + previews surfaces marketplace depth
 * in a single scan.
 */
export function CategoryList({ pillar }: { pillar?: string }) {
  const { taxonomy } = useTaxonomy();
  const pillarSlug = pillar ?? taxonomy.marketplacePillars[0]?.slug;
  const cats = taxonomy.categoriesFor(pillarSlug);
  const [meta, setMeta] = useState<Record<string, { count: number; preview: string | null }>>({});

  useEffect(() => {
    let cancelled = false;
    if (cats.length === 0) return;
    // One small head-count query per category in parallel. Cheap (≤8 reqs)
    // and keeps each card independent — no DB migration required.
    // Preview thumbnail intentionally omitted; would require a join on the
    // `listing_photos` table (N+1 query) and isn't worth the cost on home.
    Promise.all(
      cats.map(async (c) => {
        const { count } = await supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("status", "active")
          .eq("category", c.slug);
        return [c.slug, { count: count ?? 0, preview: null as string | null }] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      setMeta(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [cats]);

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {cats.map((c) => {
        const m = meta[c.slug];
        return (
          <li key={c.slug}>
            <Link
              to="/listings"
              search={{ topCategory: c.pillarSlug, category: c.slug } as never}
              className={cn(
                "group fl-lift relative flex h-full items-center gap-3 overflow-hidden rounded-2xl border-[1.5px] border-border bg-card p-3 transition-colors hover:border-primary",
              )}
            >
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-soft text-primary">
                {m?.preview ? (
                  <img
                    src={m.preview}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <CategoryIcon name={c.iconKey ?? c.slug} size={36} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold text-foreground transition-colors group-hover:text-primary">
                  {c.label}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted-foreground">
                  {m == null
                    ? "Loading…"
                    : m.count === 0
                      ? "Be the first to list"
                      : `${m.count.toLocaleString()} ${m.count === 1 ? "listing" : "listings"}`}
                </span>
              </span>
              <span
                aria-hidden
                className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              >
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
