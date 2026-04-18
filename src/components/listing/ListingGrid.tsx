import { ListingCard, type ListingCardData } from "./ListingCard";

export function ListingGrid({
  listings,
  emptyMessage = "No listings found.",
}: {
  listings: ListingCardData[];
  emptyMessage?: string;
}) {
  if (!listings.length) {
    return (
      <div className="rounded-2xl bg-background p-10 text-center text-sm text-muted-foreground shadow-[var(--shadow-card)]">
        {emptyMessage}
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
