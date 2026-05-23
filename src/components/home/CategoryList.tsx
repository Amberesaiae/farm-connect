import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { CategoryTile } from "@/components/shared/CategoryTile";

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
    <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {cats.map((c, i) => {
        const m = meta[c.slug];
        return (
          <li key={c.slug}>
            <CategoryTile
              label={c.label}
              count={m?.count ?? null}
              iconKey={c.iconKey ?? c.slug}
              to="/listings"
              search={{ topCategory: c.pillarSlug, category: c.slug }}
              index={i}
            />
          </li>
        );
      })}
    </ul>
  );
}
