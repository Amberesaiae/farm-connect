import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Check } from "lucide-react";
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
  seller_name?: string | null;
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const cover = listingPhotoUrl(listing.cover_path);
  const verified = listing.seller_badge && listing.seller_badge !== "none";
  const sellerName = listing.seller_name ?? "Farmer";
  const initials = sellerName
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "F";
  const ageDays =
    (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const isNew = ageDays < 3;

  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-input hover:shadow-[0_8px_32px_rgba(17,24,20,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No photo
          </div>
        )}
        {/* Top-left badge */}
        {isNew ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
            New
          </span>
        ) : verified ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Verified
          </span>
        ) : null}
        {/* Save heart */}
        <span
          aria-hidden
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground backdrop-blur transition-colors group-hover:bg-white group-hover:text-destructive"
        >
          <Heart className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {listing.district ? `${listing.district}, ` : ""}
            {listing.region}
          </span>
          <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-muted-foreground/40" />
          <span className="shrink-0">{formatRelative(listing.created_at)}</span>
        </div>

        <h3 className="font-display line-clamp-2 text-[15px] font-bold leading-[1.2] tracking-tight text-foreground">
          {listing.title}
        </h3>

        <div className="flex items-baseline gap-1">
          <span className="font-mono text-[17px] font-semibold tracking-tight text-primary">
            {formatGhs(listing.price_ghs)}
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">
            {formatPriceUnit(listing.price_unit)}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-2.5">
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-primary-soft text-[9px] font-bold tracking-wider text-primary">
            {initials}
          </span>
          <span className="flex-1 truncate text-[11.5px] font-semibold text-muted-foreground">
            {sellerName}
          </span>
          {verified ? (
            <span
              aria-label="Verified seller"
              className="flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-primary"
            >
              <Check className="h-2 w-2 text-primary-foreground" strokeWidth={3.5} />
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
