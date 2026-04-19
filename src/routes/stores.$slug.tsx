import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StoreHero } from "@/components/store/StoreHero";
import { ListingCard } from "@/components/listing/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { AgroPillar } from "@/lib/agro-store-status";
import { listingPhotoUrl } from "@/lib/photo-url";

export const Route = createFileRoute("/stores/$slug")({
  loader: async ({ params }) => {
    const { data: store, error } = await supabase
      .from("agro_vendor_stores")
      .select("id,slug,business_name,pillar,blurb,region,district,address,whatsapp_e164,phone_e164,email,delivers,delivery_regions,min_order_ghs,cover_path,logo_path,status,is_active")
      .eq("slug", params.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!store || store.status !== "approved" || !store.is_active) throw notFound();

    const { data: listings } = await supabase
      .from("listings")
      .select("id,title,category,price_ghs,price_unit,region,district,created_at,listing_photos(storage_path,is_cover,display_order)")
      .eq("vendor_store_id", store.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(60);

    return { store, listings: listings ?? [] };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.store;
    if (!s) return { meta: [{ title: "Shop — farmlink" }] };
    const ogImage = s.cover_path ? listingPhotoUrl(s.cover_path) : undefined;
    const desc = s.blurb || `Shop ${s.business_name} on Farmlink — ${s.region}, Ghana.`;
    return {
      meta: [
        { title: `${s.business_name} — farmlink` },
        { name: "description", content: desc },
        { property: "og:title", content: s.business_name },
        { property: "og:description", content: desc },
        ...(ogImage ? [{ property: "og:image", content: ogImage }, { name: "twitter:image", content: ogImage }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="font-display text-xl font-extrabold">Shop not found</h1>
        <Button asChild className="mt-6 rounded-xl"><Link to="/stores">Browse shops</Link></Button>
      </div>
    </AppShell>
  ),
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <h1 className="font-display text-xl font-extrabold">Couldn't load shop</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <Button className="mt-6 rounded-xl" onClick={() => router.invalidate()}>Try again</Button>
        </div>
      </AppShell>
    );
  },
  component: StoreDetail,
});

function StoreDetail() {
  const { store, listings } = Route.useLoaderData();
  const wa = store.whatsapp_e164;
  const waHref = wa
    ? `https://wa.me/${wa.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in your shop ${store.business_name} on Farmlink.`)}`
    : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-5 md:py-8">
        <StoreHero
          name={store.business_name}
          pillar={store.pillar as AgroPillar}
          region={store.region}
          district={store.district}
          blurb={store.blurb}
          cover_path={store.cover_path}
          logo_path={store.logo_path}
          delivers={store.delivers}
          approved
        />

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_300px]">
          <div>
            <h2 className="font-display text-[18px] font-extrabold tracking-tight">Catalogue</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => {
                const cover = l.listing_photos?.find((p) => p.is_cover)?.storage_path
                  ?? l.listing_photos?.[0]?.storage_path
                  ?? null;
                return (
                  <ListingCard
                    key={l.id}
                    listing={{
                      id: l.id,
                      title: l.title,
                      category: l.category,
                      price_ghs: l.price_ghs,
                      price_unit: l.price_unit,
                      region: l.region,
                      district: l.district,
                      created_at: l.created_at,
                      cover_path: cover,
                      seller_name: store.business_name,
                      seller_badge: "verified",
                    }}
                  />
                );
              })}
            </div>
            {listings.length === 0 && (
              <div className="mt-3 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
                This shop hasn't posted listings yet.
              </div>
            )}
          </div>

          <aside className="space-y-3 md:sticky md:top-20 md:self-start">
            <div className="rounded-2xl border-[1.5px] border-border bg-card p-4">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Contact shop</h3>
              {waHref ? (
                <Button asChild className="mt-3 w-full rounded-xl">
                  <a href={waHref} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
                </Button>
              ) : (
                <p className="mt-3 text-[13px] text-muted-foreground">No WhatsApp on file. Tap a listing to contact.</p>
              )}
              {store.phone_e164 && <a href={`tel:${store.phone_e164}`} className="mt-2 block text-[13px] text-foreground underline">{store.phone_e164}</a>}
              {store.email && <a href={`mailto:${store.email}`} className="mt-1 block text-[13px] text-foreground underline">{store.email}</a>}
            </div>
            {(store.address || store.delivers) && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Pickup & delivery</h3>
                {store.address && <p className="mt-2 text-[13px]">{store.address}</p>}
                {store.delivers && (
                  <p className="mt-2 text-[12.5px] text-muted-foreground">
                    Delivers to: {store.delivery_regions?.length ? store.delivery_regions.join(", ") : "request a quote"}
                  </p>
                )}
                {store.min_order_ghs != null && (
                  <p className="mt-2 text-[12.5px] text-muted-foreground">Min. order: GHS {Number(store.min_order_ghs).toLocaleString()}</p>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
