import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PhotoCarousel } from "@/components/listing/PhotoCarousel";
import { SellerCard } from "@/components/listing/SellerCard";
import { WhatsAppCTA } from "@/components/listing/WhatsAppCTA";
import { SaveButton } from "@/components/listing/SaveButton";
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
          <Button className="mt-6" onClick={() => router.invalidate()}>
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
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been removed or sold.
        </p>
        <Button asChild className="mt-6">
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
      <div className="mx-auto max-w-4xl px-4 py-4 md:py-8">
        <Link
          to="/listings"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <div className="grid gap-6 md:grid-cols-[1fr_360px]">
          <div>
            <PhotoCarousel paths={photos} alt={listing.title} />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-2xl font-bold leading-tight">{listing.title}</h1>
                <BadgeChip tier={seller?.badge_tier} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{formatGhs(listing.price_ghs)}</span>
                <span className="text-sm text-muted-foreground">
                  {formatPriceUnit(listing.price_unit)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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

            <dl className="grid grid-cols-2 gap-2 rounded-xl border border-border p-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium capitalize">{listing.category}</dd>
              </div>
              {listing.breed && (
                <div>
                  <dt className="text-muted-foreground">Breed</dt>
                  <dd className="font-medium">{listing.breed}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Quantity</dt>
                <dd className="font-medium">{listing.quantity}</dd>
              </div>
              {listing.sex && (
                <div>
                  <dt className="text-muted-foreground">Sex</dt>
                  <dd className="font-medium capitalize">{listing.sex}</dd>
                </div>
              )}
              {listing.age_months != null && (
                <div>
                  <dt className="text-muted-foreground">Age</dt>
                  <dd className="font-medium">{listing.age_months} months</dd>
                </div>
              )}
              {listing.weight_kg != null && (
                <div>
                  <dt className="text-muted-foreground">Weight</dt>
                  <dd className="font-medium">{Number(listing.weight_kg).toFixed(1)} kg</dd>
                </div>
              )}
            </dl>

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

            <div className="space-y-2">
              <WhatsAppCTA
                listingId={listing.id}
                listingTitle={listing.title}
                sellerWhatsappE164={seller?.whatsapp_e164 ?? null}
              />
              {savedLoaded && (
                <SaveButton listingId={listing.id} initialSaved={savedInitial} variant="full" />
              )}
            </div>
          </div>
        </div>

        {listing.description && (
          <section className="mt-8">
            <h2 className="text-lg font-bold">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {listing.description}
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
