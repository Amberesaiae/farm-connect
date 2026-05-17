import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GHANA_REGIONS } from "@/lib/constants";
import { MapPinIcon } from "@/components/icons";

/**
 * 16-region browse grid. One single SELECT pulls active listings' region column,
 * then we count client-side — cheaper than 16 head-count round-trips.
 */
export function RegionsMap() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("listings")
        .select("region")
        .eq("status", "active")
        .limit(1000);
      if (cancelled) return;
      const acc: Record<string, number> = {};
      for (const r of (data as { region: string }[] | null) ?? []) {
        acc[r.region] = (acc[r.region] ?? 0) + 1;
      }
      setCounts(acc);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section aria-label="Browse by region">
      <div className="mb-5">
        <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary/80">
          16 regions
        </p>
        <h2 className="font-display mt-1.5 text-[22px] font-extrabold tracking-tight md:text-[26px]">
          Buy close to home
        </h2>
        <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">
          From Greater Accra to the Upper West — find livestock listed in your region.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {GHANA_REGIONS.map((region) => {
          const n = counts[region] ?? 0;
          return (
            <li key={region}>
              <Link
                to="/listings"
                search={{ region } as never}
                className="group flex h-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 transition-colors hover:border-primary hover:bg-primary-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex items-center gap-2 truncate">
                  <MapPinIcon size={13} className="shrink-0 text-muted-foreground group-hover:text-primary" />
                  <span className="truncate text-[13.5px] font-semibold text-foreground">{region}</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-muted-foreground group-hover:text-primary">
                  {loading ? "—" : n}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
