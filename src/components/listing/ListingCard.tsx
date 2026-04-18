import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { BadgeChip } from "./BadgeChip";
import { formatGhs, formatPriceUnit, formatRelative } from "@/lib/format";
import { listingPhotoUrl } from "@/lib/photo-url";

export interface ListingCardData {
  id: string;
  title: string;
  category: string;
  price_ghs: number | string;
  price_unit: string;
  region: string;
  district: string | null;
  created_at: string;
  cover_path: string | null;
  seller_badge?: string | null;
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const cover = listingPhotoUrl(listing.cover_path);
  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-background shadow-[var(--shadow-card)] transition-shadow group-hover:shadow-[var(--shadow-card-hover)]">
          {cover ? (
            <img
              src={cover}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
          {listing.seller_badge && listing.seller_badge !== "none" && (
            <div className="absolute bottom-2 left-2">
              <BadgeChip tier={listing.seller_badge} />
            </div>
          )}
          <div
            aria-hidden
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur"
          >
            <Heart className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="px-1 pt-2.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{listing.title}</h3>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-base font-bold text-foreground">{formatGhs(listing.price_ghs)}</span>
          <span className="text-[11px] text-muted-foreground">{formatPriceUnit(listing.price_unit)}</span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
          {listing.district ? `${listing.district}, ` : ""}
          {listing.region} · {formatRelative(listing.created_at)}
        </p>
      </div>
    </Link>
  );
}
