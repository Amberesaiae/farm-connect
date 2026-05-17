import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard, type ListingCardData } from "./ListingCard";

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

export function SimilarListings({
  category,
  excludeId,
  region,
}: {
  category: string;
  excludeId: string;
  region?: string;
}) {
  const [rows, setRows] = useState<ListingCardData[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = supabase
        .from("listings")
        .select("id,title,category,price_ghs,price_unit,region,district,created_at,seller_id,listing_photos(storage_path,is_cover,display_order)")
        .eq("status", "active")
        .eq("category", category)
        .neq("id", excludeId)
        .order("created_at", { ascending: false })
        .limit(4);
      if (region) q = q.eq("region", region);
      const { data } = await q;
      if (cancelled) return;
      const mapped = (data as unknown as Row[] ?? []).map((r): ListingCardData => {
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
        };
      });
      setRows(mapped);
    })();
    return () => { cancelled = true; };
  }, [category, excludeId, region]);

  if (!rows.length) return null;
  return (
    <section className="mt-10">
      <div className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">More like this</p>
        <h2 className="font-display mt-1 text-[20px] font-extrabold tracking-tight md:text-[22px]">
          Similar listings
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </section>
  );
}
