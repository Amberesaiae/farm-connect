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
    <div className="rounded-2xl border-[1.5px] border-border bg-card p-4">
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
        Seller
      </p>
      <div className="mt-2 flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
          <AvatarFallback className="bg-primary-soft font-semibold text-primary">
            {initials || "S"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{displayName}</p>
            <BadgeChip tier={badgeTier} />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {listingCount} listing{listingCount === 1 ? "" : "s"} · {tradeCount} sale
            {tradeCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </div>
  );
}
