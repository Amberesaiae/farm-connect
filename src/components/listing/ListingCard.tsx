import { Link } from "@tanstack/react-router";
import { MapPinIcon, CheckIcon } from "@/components/icons";
import { formatGhs, formatPriceUnit, formatRelative } from "@/lib/format";
import { listingPhotoUrl } from "@/lib/photo-url";
import { CardSaveButton } from "./CardSaveButton";

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
  store_name?: string | null;
  store_slug?: string | null;
  breed?: string | null;
  age_months?: number | null;
  sex?: string | null;
  weight_kg?: number | string | null;
}

/**
 * Agora-style product card: image in a cream-tinted rounded basket on top,
 * meta-row + title + price below. Single primary chip in green for verified.
 */
export function ListingCard({ listing }: { listing: ListingCardData }) {
  const cover = listingPhotoUrl(listing.cover_path);
  const verified = listing.seller_badge && listing.seller_badge !== "none";
  const sellerName = listing.seller_name ?? "Farmer";
  const ageDays =
    (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const isNew = ageDays < 3;

  const specs: string[] = [];
  if (listing.breed) specs.push(String(listing.breed));
  if (listing.age_months != null) specs.push(`${listing.age_months} mo`);
  if (listing.weight_kg != null) specs.push(`${listing.weight_kg} kg`);

  return (
    <article className="group relative flex flex-col rounded-[20px] bg-card p-2.5 transition-transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-ring">
      <Link
        to="/listings/$id"
        params={{ id: listing.id }}
        className="flex flex-1 flex-col focus:outline-none"
        aria-label={listing.title}
      >
        {/* Image basket — cream tinted, rounded */}
        <div className="relative aspect-square overflow-hidden rounded-[16px] bg-surface-cream">
          {cover ? (
            <img
              src={cover}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
              No photo yet
            </div>
          )}
          {/* Top-left chip */}
          {isNew ? (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              New
            </span>
          ) : verified ? (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-soft">
              <CheckIcon size={9} strokeWidth={3} /> Verified
            </span>
          ) : null}
        </div>

        {/* Meta + title */}
        <div className="flex flex-1 flex-col gap-1.5 px-1.5 pb-1 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <MapPinIcon size={11} />
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

          {specs.length > 0 && (
            <p className="truncate text-[11.5px] text-muted-foreground">
              {specs.join(" · ")}
            </p>
          )}

          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[18px] font-bold leading-none tracking-tight text-foreground">
                {formatGhs(listing.price_ghs)}
              </span>
              <span className="mt-0.5 text-[10.5px] text-muted-foreground">
                {formatPriceUnit(listing.price_unit)} · {sellerName}
              </span>
            </div>
            <span className="inline-flex h-9 items-center rounded-full bg-primary px-3.5 text-[12px] font-bold text-primary-foreground transition-colors group-hover:bg-foreground">
              Contact
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute right-3.5 top-3.5 z-10">
        <CardSaveButton listingId={listing.id} />
      </div>
    </article>
  );
}
