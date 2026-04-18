import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ListingGrid } from "@/components/listing/ListingGrid";
import type { ListingCardData } from "@/components/listing/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved listings — Farmlink" }] }),
  component: SavedPage,
});

function SavedPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void supabase
      .from("saved_listings")
      .select(
        "listing:listings(id,title,category,price_ghs,price_unit,region,district,created_at,seller_id,listing_photos(storage_path,is_cover,display_order),profiles!listings_seller_id_fkey(badge_tier))",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        const mapped: ListingCardData[] = ((data ?? []) as { listing: any }[])
          .filter((s) => s.listing)
          .map((s) => {
            const r = s.listing;
            const photos = [...(r.listing_photos ?? [])].sort(
              (a: any, b: any) =>
                (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || a.display_order - b.display_order,
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
              seller_badge: r.profiles?.badge_tier ?? null,
            };
          });
        setRows(mapped);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Saved listings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} saved listing{rows.length === 1 ? "" : "s"}
        </p>
        <div className="mt-5">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ListingGrid listings={rows} emptyMessage="You haven't saved any listings yet." />
          )}
        </div>
      </div>
    </AppShell>
  );
}
