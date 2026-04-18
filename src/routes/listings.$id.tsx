import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PhotoCarousel } from "@/components/listing/PhotoCarousel";
import { SellerCard } from "@/components/listing/SellerCard";
import { WhatsAppCTA } from "@/components/listing/WhatsAppCTA";
import { SaveButton } from "@/components/listing/SaveButton";
import { SpecsPanel } from "@/components/listing/SpecsPanel";
import { StickyContactBar } from "@/components/listing/StickyContactBar";
import { BadgeChip } from "@/components/listing/BadgeChip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatGhs, formatPriceUnit, formatRelative } from "@/lib/format";
import { listingPhotoUrl } from "@/lib/photo-url";
import { useServerFn } from "@tanstack/react-start";
import { logView } from "@/server/listings.functions";
import { ArrowLeft, Eye, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/listings/$id")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,category,breed,age_months,sex,quantity,weight_kg,price_ghs,price_unit,region,district,description,status,view_count,created_at,seller_id,listing_photos(storage_path,is_cover,display_order),profiles!listings_seller_id_fkey(display_name,avatar_url,badge_tier,trade_count,listing_count,whatsapp_e164)",
      )
      .eq("id", params.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw notFound();
    return { listing: data };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.listing;
    if (!l) return { meta: [{ title: "Listing — Farmlink" }] };
    const cover = l.listing_photos?.[0]?.storage_path;
    const ogImage = cover ? listingPhotoUrl(cover) : undefined;
    const desc = `${l.title} for ${formatGhs(l.price_ghs)} ${formatPriceUnit(l.price_unit)} in ${l.region}, Ghana.`;
    return {
      meta: [
        { title: `${l.title} — Farmlink` },
        { name: "description", content: desc },
        { property: "og:title", content: l.title },
        { property: "og:description", content: desc },
        ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
        ...(ogImage ? [{ name: "twitter:image", content: ogImage }] : []),
      ],
    };
  },
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <h1 className="text-xl font-bold">Couldn't load this listing</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <Button className="mt-6 rounded-full" onClick={() => router.invalidate()}>
            Try again
          </Button>
        </div>
      </AppShell>
    );
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been removed or sold.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/listings">Browse listings</Link>
        </Button>
      </div>
    </AppShell>
  ),
  component: ListingDetail,
});

function ListingDetail() {
  const { listing } = Route.useLoaderData();
  const { user } = useAuth();
  const [savedInitial, setSavedInitial] = useState(false);
  const [savedLoaded, setSavedLoaded] = useState(false);
  const logViewFn = useServerFn(logView);

  useEffect(() => {
    void logViewFn({ data: { listingId: listing.id } });
  }, [listing.id, logViewFn]);

  useEffect(() => {
    if (!user) {
      setSavedLoaded(true);
      return;
    }
    void supabase
      .from("saved_listings")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", listing.id)
      .maybeSingle()
      .then(({ data }) => {
        setSavedInitial(!!data);
        setSavedLoaded(true);
      });
  }, [user, listing.id]);

  const photos = [...(listing.listing_photos ?? [])]
    .sort(
      (a, b) =>
        (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || a.display_order - b.display_order,
    )
    .map((p) => p.storage_path);

  const seller = listing.profiles;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-4 md:py-8">
        <Link
          to="/listings"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <div className="grid gap-6 md:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <PhotoCarousel paths={photos} alt={listing.title} />

            <div className="md:hidden">
              <Header listing={listing} sellerBadge={seller?.badge_tier ?? null} />
            </div>

            <SpecsPanel
              specs={[
                { label: "Category", value: listing.category },
                { label: "Breed", value: listing.breed },
                { label: "Sex", value: listing.sex },
                { label: "Age", value: listing.age_months != null ? `${listing.age_months} mo` : null },
                {
                  label: "Weight",
                  value: listing.weight_kg != null ? `${Number(listing.weight_kg).toFixed(1)} kg` : null,
                },
                { label: "Quantity", value: listing.quantity },
              ]}
            />

            {listing.description && (
              <section>
                <h2 className="text-lg font-bold">About this listing</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {listing.description}
                </p>
              </section>
            )}
          </div>

          <aside className="space-y-4 md:sticky md:top-20 md:self-start">
            <div className="hidden md:block">
              <Header listing={listing} sellerBadge={seller?.badge_tier ?? null} />
            </div>

            {seller && (
              <SellerCard
                sellerId={listing.seller_id}
                displayName={seller.display_name}
                avatarUrl={seller.avatar_url}
                badgeTier={seller.badge_tier}
                tradeCount={seller.trade_count ?? 0}
                listingCount={seller.listing_count ?? 0}
              />
            )}

            <div className="hidden space-y-2 md:block">
              <WhatsAppCTA
                listingId={listing.id}
                listingTitle={listing.title}
                sellerWhatsappE164={seller?.whatsapp_e164 ?? null}
              />
              {savedLoaded && (
                <SaveButton listingId={listing.id} initialSaved={savedInitial} variant="full" />
              )}
            </div>
          </aside>
        </div>
      </div>

      {savedLoaded && seller?.whatsapp_e164 && (
        <StickyContactBar>
          <div className="flex-1">
            <WhatsAppCTA
              listingId={listing.id}
              listingTitle={listing.title}
              sellerWhatsappE164={seller.whatsapp_e164}
            />
          </div>
          <SaveButton listingId={listing.id} initialSaved={savedInitial} variant="square" />
        </StickyContactBar>
      )}
    </AppShell>
  );
}

function Header({
  listing,
  sellerBadge,
}: {
  listing: {
    title: string;
    price_ghs: number | string;
    price_unit: string;
    district: string | null;
    region: string;
    created_at: string;
    view_count: number;
  };
  sellerBadge: string | null;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold leading-tight">{listing.title}</h1>
        <BadgeChip tier={sellerBadge} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold">{formatGhs(listing.price_ghs)}</span>
        <span className="text-sm text-muted-foreground">{formatPriceUnit(listing.price_unit)}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {listing.district ? `${listing.district}, ` : ""}
          {listing.region}
        </span>
        <span>·</span>
        <span>{formatRelative(listing.created_at)}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {listing.view_count} views
        </span>
      </div>
    </div>
  );
}
