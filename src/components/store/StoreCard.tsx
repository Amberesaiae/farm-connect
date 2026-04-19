import { Link } from "@tanstack/react-router";
import { MapPinIcon } from "@/components/icons";
import { listingPhotoUrl } from "@/lib/photo-url";

export type StoreKind = "hatchery" | "service" | "agro";

export interface StoreCardData {
  store_kind: StoreKind;
  id: string;
  slug: string;
  name: string;
  pillar_or_category: string;
  region: string;
  district: string | null;
  cover_path: string | null;
  logo_path: string | null;
  blurb: string | null;
}

const KIND_LABEL: Record<StoreKind, string> = {
  hatchery: "Hatchery",
  service: "Service",
  agro: "Shop",
};

const KIND_CTA: Record<StoreKind, string> = {
  hatchery: "View batches",
  service: "Request quote",
  agro: "Browse catalogue",
};

function storeLink(s: StoreCardData) {
  if (s.store_kind === "hatchery") return { to: "/hatcheries/$slug" as const, params: { slug: s.slug } };
  if (s.store_kind === "service") return { to: "/services/$slug" as const, params: { slug: s.slug } };
  return { to: "/stores/$slug" as const, params: { slug: s.slug } };
}

export function StoreCard({ store }: { store: StoreCardData }) {
  const cover = listingPhotoUrl(store.cover_path);
  const link = storeLink(store);
  return (
    <Link
      {...link}
      className="group flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-border bg-card transition-all hover:-translate-y-0.5 hover:border-input hover:shadow-[0_8px_32px_rgba(17,24,20,0.08)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-surface">
        {cover ? (
          <img src={cover} alt={store.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No cover</div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          {KIND_LABEL[store.store_kind]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <MapPinIcon size={12} />
          <span className="truncate">
            {store.district ? `${store.district}, ` : ""}{store.region}
          </span>
        </div>
        <h3 className="font-display line-clamp-1 text-[15px] font-bold leading-[1.2] tracking-tight text-foreground">
          {store.name}
        </h3>
        {store.blurb ? (
          <p className="line-clamp-2 text-[12px] text-muted-foreground">{store.blurb}</p>
        ) : null}
        <span className="mt-auto pt-2 text-[12px] font-semibold text-primary">{KIND_CTA[store.store_kind]} →</span>
      </div>
    </Link>
  );
}
