import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeChip } from "./BadgeChip";

interface SellerCardProps {
  sellerId: string;
  displayName: string;
  avatarUrl: string | null;
  badgeTier: string | null;
  tradeCount: number;
  listingCount: number;
}

export function SellerCard({
  displayName,
  avatarUrl,
  badgeTier,
  tradeCount,
  listingCount,
}: SellerCardProps) {
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="rounded-2xl bg-background p-4 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Seller
      </p>
      <div className="mt-2 flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
          <AvatarFallback className="bg-primary-soft text-primary font-semibold">
            {initials || "S"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{displayName}</p>
            <BadgeChip tier={badgeTier} />
          </div>
          <p className="text-xs text-muted-foreground">
            {listingCount} listing{listingCount === 1 ? "" : "s"} · {tradeCount} sale
            {tradeCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </div>
  );
}
