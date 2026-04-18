import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
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
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="overflow-hidden border-border transition-shadow group-hover:shadow-md py-0 gap-0">
        <div className="relative aspect-[4/3] bg-surface">
          {cover ? (
            <img
              src={cover}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
          {listing.seller_badge && listing.seller_badge !== "none" && (
            <div className="absolute left-2 top-2">
              <BadgeChip tier={listing.seller_badge} />
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold text-sm">{listing.title}</h3>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base font-bold text-foreground">
              {formatGhs(listing.price_ghs)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatPriceUnit(listing.price_unit)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {listing.district ? `${listing.district}, ` : ""}
                {listing.region}
              </span>
            </span>
            <span className="shrink-0">{formatRelative(listing.created_at)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
