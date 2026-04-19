import { ListingCard, type ListingCardData } from "./ListingCard";
import { Link } from "@tanstack/react-router";
import { CategoryIcon } from "@/components/icons/CategoryIcon";

export function ListingGrid({
  listings,
  emptyMessage = "No listings found.",
  showBrowseCta = false,
}: {
  listings: ListingCardData[];
  emptyMessage?: string;
  showBrowseCta?: boolean;
}) {
  if (!listings.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border-[1.5px] border-dashed border-border bg-card p-12 text-center">
        <CategoryIcon name="lot" size={64} alt="Empty" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        {showBrowseCta ? (
          <Link
            to="/listings"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse listings
          </Link>
        ) : null}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
