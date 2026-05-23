import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard, type ListingCardData } from "@/components/listing/ListingCard";
import { ArrowRightIcon } from "@/components/icons";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { DisplayAccent } from "@/components/shared/DisplayAccent";
import { EmptyState } from "@/components/shared/EmptyState";

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
      <SectionHeader
        eyebrow="Just posted · updated hourly"
        title={
          <>
            Fresh from <DisplayAccent>farmers</DisplayAccent> this week
          </>
        }
        description="New listings from every region — tap any card to start a WhatsApp conversation with the farmer."
        seeAll={{ to: "/listings", label: "See all" }}
      />
      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-2xl border border-border bg-surface-cream"
              />
            ))
          : rows.length === 0
            ? null
            : rows.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
      {!loading && rows.length === 0 ? (
        <div className="mt-7">
          <EmptyState
            title="No listings yet — be the first."
            description="Post your livestock in under 3 minutes and reach buyers across 16 regions."
            action={{ to: "/post", label: "Post a listing" }}
          />
        </div>
      ) : null}
      <div className="mt-6 flex justify-center md:hidden">
        <Link
          to="/listings"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-[13px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          See all listings <ArrowRightIcon size={14} />
        </Link>
      </div>
    </section>
  );
}