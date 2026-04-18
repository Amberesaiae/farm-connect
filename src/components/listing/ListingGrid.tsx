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
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
