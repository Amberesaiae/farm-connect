import { Link } from "@tanstack/react-router";
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
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <Avatar className="h-12 w-12">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
        <AvatarFallback>{initials || "S"}</AvatarFallback>
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
  );
}
