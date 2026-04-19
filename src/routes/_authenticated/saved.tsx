import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ListingGrid } from "@/components/listing/ListingGrid";
import type { ListingCardData } from "@/components/listing/ListingCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved listings — farmlink" }] }),
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
        "listing:listings(id,title,category,price_ghs,price_unit,region,district,created_at,seller_id,listing_photos(storage_path,is_cover,display_order))",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        if (cancelled) return;
        const listings = ((data ?? []) as { listing: any }[])
          .map((s) => s.listing)
          .filter(Boolean);
        const sellerIds = Array.from(new Set(listings.map((l: any) => l.seller_id)));
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
        if (cancelled) return;
        const mapped: ListingCardData[] = listings.map((r: any) => {
          const photos = [...(r.listing_photos ?? [])].sort(
            (a: any, b: any) =>
              (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || a.display_order - b.display_order,
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
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-5 md:py-8">
        <h1 className="font-display text-[28px] font-extrabold tracking-tight">
          Saved listings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} saved listing{rows.length === 1 ? "" : "s"}
        </p>
        <div className="mt-5">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-2xl border-[1.5px] border-border bg-card"
                />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Heart className="h-6 w-6" />
              </span>
              <p className="mt-3 text-sm font-semibold">No saved listings yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tap the heart on any listing to save it for later.
              </p>
              <Button asChild className="mt-5 rounded-xl">
                <Link to="/listings">Browse listings</Link>
              </Button>
            </div>
          ) : (
            <ListingGrid listings={rows} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
