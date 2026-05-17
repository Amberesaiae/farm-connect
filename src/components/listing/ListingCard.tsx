import { Link } from "@tanstack/react-router";
import { MapPinIcon, CheckIcon } from "@/components/icons";
import { formatGhs, formatPriceUnit, formatRelative } from "@/lib/format";
import { listingPhotoUrl } from "@/lib/photo-url";
import { SaveButton } from "./SaveButton";
import { cn } from "@/lib/utils";

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

const TIER_RING: Record<string, string> = {
  sprout: "ring-2 ring-[color:var(--accent-2)]/40",
  grower: "ring-2 ring-primary/40",
  trusted: "ring-2 ring-[color:var(--info)]/50",
  verified_pro: "ring-2 ring-amber-400",
  // back-compat values
  bronze: "ring-2 ring-[color:var(--accent-2)]/40",
  silver: "ring-2 ring-zinc-400/50",
  gold: "ring-2 ring-amber-400",
  platinum: "ring-2 ring-emerald-500",
};

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const cover = listingPhotoUrl(listing.cover_path);
  const verified = listing.seller_badge && listing.seller_badge !== "none";
  const tierRing = listing.seller_badge ? (TIER_RING[listing.seller_badge] ?? "") : "";
  const sellerName = listing.seller_name ?? "Farmer";
  const initials = sellerName
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "F";
  const ageDays =
    (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const isNew = ageDays < 3;

  const specs: string[] = [];
  if (listing.sex) specs.push(listing.sex === "male" ? "♂" : listing.sex === "female" ? "♀" : listing.sex);
  if (listing.breed) specs.push(String(listing.breed));
  if (listing.age_months != null) specs.push(`${listing.age_months} mo`);
  if (listing.weight_kg != null) specs.push(`${listing.weight_kg} kg`);

  return (
    <div className="group fl-lift relative flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-border bg-card focus-within:ring-2 focus-within:ring-ring">
      <Link
        to="/listings/$id"
        params={{ id: listing.id }}
        className="flex flex-1 flex-col focus:outline-none"
        aria-label={listing.title}
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
          <span className="absolute left-2.5 top-2.5 rounded-full bg-info-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--info)]">
            New
          </span>
        ) : verified ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Verified
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <MapPinIcon size={12} />
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
          <p className="truncate text-[11.5px] font-medium text-muted-foreground">
            {specs.join(" · ")}
          </p>
        )}

        <div className="flex items-baseline gap-1">
          <span className="font-mono text-[17px] font-semibold tracking-tight text-primary">
            {formatGhs(listing.price_ghs)}
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">
            {formatPriceUnit(listing.price_unit)}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-2.5">
          <span
            className={cn(
              "flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-primary-soft text-[9.5px] font-bold tracking-wider text-primary",
              tierRing,
            )}
          >
            {initials}
          </span>
          <span className="flex-1 truncate text-[11.5px] font-semibold text-muted-foreground">
            {listing.store_name ? (
              <span className="inline-flex items-center gap-1">
                <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary">Shop</span>
                <span className="truncate text-foreground">{listing.store_name}</span>
              </span>
            ) : (
              sellerName
            )}
          </span>
          {verified ? (
            <span
              aria-label="Verified seller"
              className="flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-primary"
            >
              <CheckIcon size={9} strokeWidth={3} className="text-primary-foreground" />
            </span>
          ) : null}
        </div>
      </div>
      </Link>
      {/* Real save button — sits above the link so the click is captured */}
      <div className="absolute right-2.5 top-2.5">
        <SaveButton listingId={listing.id} initialSaved={false} />
      </div>
    </div>
  );
}
