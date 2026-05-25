import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoreCard, type StoreCardData } from "@/components/store/StoreCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { DisplayAccent } from "@/components/shared/DisplayAccent";

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
      <SectionHeader
        eyebrow="Stocked & ready"
        title={
          <>
            Feed, equipment <DisplayAccent>&amp; supplies</DisplayAccent>.
          </>
        }
        description="Independent agro shops across Ghana — layer mash, incubators, vet meds, tools."
        seeAll={{ to: "/stores", label: "All stores" }}
      />

      <div className="scroll-snap-row -mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-8 md:px-8">
        {rows === null
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[280px] shrink-0 animate-pulse rounded-2xl border border-border bg-card md:w-[320px]">
                <div className="aspect-[16/9] rounded-t-2xl bg-surface" />
                <div className="h-24" />
              </div>
            ))
          : rows.map((s) => (
              <div key={s.id} className="w-[280px] shrink-0 md:w-[320px]">
                <StoreCard store={s} />
              </div>
            ))}
      </div>
    </section>
  );
}
