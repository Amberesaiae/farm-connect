import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard, type ListingCardData } from "@/components/listing/ListingCard";
import { ArrowRightIcon } from "@/components/icons";

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

export function FreshListings() {
  const [rows, setRows] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("listings")
        .select(
          "id,title,category,price_ghs,price_unit,region,district,created_at,seller_id,listing_photos(storage_path,is_cover,display_order)",
        )
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(8);

      if (cancelled) return;
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
      setRows(mapped);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Just posted
          </p>
          <h2 className="font-display mt-1 text-[22px] font-extrabold tracking-tight md:text-[26px]">
            Fresh from farmers this week
          </h2>
        </div>
        <Link
          to="/listings"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
        >
          See all <ArrowRightIcon size={14} />
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-2xl border-[1.5px] border-border bg-card"
              />
            ))
          : rows.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </section>
  );
}