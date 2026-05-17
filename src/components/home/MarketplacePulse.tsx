import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GHANA_REGIONS } from "@/lib/constants";

/**
 * Thin live-stats band. Cheap head-count queries (no rows fetched).
 * Falls back to dashed placeholders while loading.
 */
interface Stats {
  listings: number | null;
  sellers: number | null;
  regions: number;
}

export function MarketplacePulse() {
  const [stats, setStats] = useState<Stats>({ listings: null, sellers: null, regions: GHANA_REGIONS.length });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [listings, sellers] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).neq("badge_tier", "none"),
      ]);
      if (cancelled) return;
      setStats({
        listings: listings.count ?? 0,
        sellers: sellers.count ?? 0,
        regions: GHANA_REGIONS.length,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const items = [
    { label: "Active listings", value: stats.listings, suffix: "" },
    { label: "Verified sellers", value: stats.sellers, suffix: "" },
    { label: "Regions covered", value: stats.regions, suffix: "" },
    { label: "Avg reply on WhatsApp", value: 12, suffix: "min" },
  ];

  return (
    <section
      aria-label="Marketplace at a glance"
      className="rounded-2xl border border-border bg-card px-4 py-5 md:px-8 md:py-6"
    >
      <ul className="grid grid-cols-2 gap-y-5 md:grid-cols-4">
        {items.map((it) => (
          <li key={it.label} className="flex flex-col items-start gap-1 md:border-l md:border-border md:px-6 md:first:border-l-0 md:first:pl-0">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {it.label}
            </span>
            <span className="font-display flex items-baseline gap-1.5 text-[28px] font-extrabold leading-none tracking-tight text-foreground md:text-[34px]">
              {it.value === null ? <span className="text-muted-foreground">—</span> : it.value.toLocaleString()}
              {it.suffix ? <span className="text-[14px] font-bold text-muted-foreground md:text-[16px]">{it.suffix}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
