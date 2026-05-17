import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoreCard, type StoreCardData } from "@/components/store/StoreCard";
import { ArrowRightIcon } from "@/components/icons";

interface Row {
  id: string;
  slug: string;
  business_name: string;
  pillar: string | null;
  region: string;
  district: string | null;
  cover_path: string | null;
  logo_path: string | null;
  blurb: string | null;
}

/**
 * Horizontal scroll-snap row of agro-vendor stores. Empty state stays quiet —
 * the section only renders if at least one published store exists.
 */
export function AgroVendorStrip() {
  const [rows, setRows] = useState<StoreCardData[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("agro_vendor_stores")
        .select("id,slug,business_name,pillar,region,district,cover_path,logo_path,blurb")
        .order("created_at", { ascending: false })
        .limit(8);
      if (cancelled) return;
      const mapped: StoreCardData[] = ((data as Row[] | null) ?? []).map((r) => ({
        store_kind: "agro",
        id: r.id,
        slug: r.slug,
        name: r.business_name,
        pillar_or_category: r.pillar ?? "Agro-vendor",
        region: r.region,
        district: r.district,
        cover_path: r.cover_path,
        logo_path: r.logo_path,
        blurb: r.blurb,
      }));
      setRows(mapped);
    })();
    return () => { cancelled = true; };
  }, []);

  if (rows !== null && rows.length === 0) return null;

  return (
    <section aria-label="Featured agro-vendor stores">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary/80">
            Stocked & ready
          </p>
          <h2 className="font-display mt-1.5 text-[22px] font-extrabold tracking-tight md:text-[26px]">
            Feed, equipment & supplies
          </h2>
          <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">
            Independent shops across Ghana selling everything from layer mash to incubators.
          </p>
        </div>
        <Link
          to="/stores"
          className="hidden shrink-0 items-center gap-1.5 self-end text-[13px] font-semibold text-primary hover:underline md:inline-flex"
        >
          All stores <ArrowRightIcon size={14} />
        </Link>
      </div>

      <div className="scroll-snap-row -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-8 md:px-8">
        {rows === null
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[260px] shrink-0 animate-pulse rounded-2xl border border-border bg-card">
                <div className="aspect-[16/9] rounded-t-2xl bg-surface" />
                <div className="h-24" />
              </div>
            ))
          : rows.map((s) => (
              <div key={s.id} className="w-[260px] shrink-0 md:w-[300px]">
                <StoreCard store={s} />
              </div>
            ))}
      </div>
    </section>
  );
}
