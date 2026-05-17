import { CheckIcon, ShieldIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const TIER_NAME: Record<string, string> = {
  sprout: "Sprout",
  grower: "Grower",
  trusted: "Trusted",
  verified_pro: "Verified Pro",
  bronze: "Grower",
  silver: "Trusted",
  gold: "Verified Pro",
  platinum: "Verified Pro",
};

export function TrustPanel({
  sellerBadge,
  tradeCount,
  hasPhoto,
  hasDescription,
}: {
  sellerBadge: string | null;
  tradeCount: number;
  hasPhoto: boolean;
  hasDescription: boolean;
}) {
  const verified = !!sellerBadge && sellerBadge !== "none";
  const tierLabel = sellerBadge ? (TIER_NAME[sellerBadge] ?? "Verified") : "Unverified";
  const items = [
    { ok: verified, label: `Seller tier: ${tierLabel}` },
    { ok: tradeCount > 0, label: tradeCount > 0 ? `${tradeCount} completed trade${tradeCount === 1 ? "" : "s"}` : "No completed trades yet" },
    { ok: hasPhoto, label: hasPhoto ? "Real photos uploaded" : "No photos uploaded" },
    { ok: hasDescription, label: hasDescription ? "Description provided" : "Description missing" },
  ];
  const score = items.filter((i) => i.ok).length;
  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <ShieldIcon size={18} />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Trust score
          </p>
          <p className="font-display text-[15px] font-extrabold tracking-tight">
            {score}/4 signals verified
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((it) => (
          <li key={it.label} className="flex items-start gap-2 text-[13px]">
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                it.ok ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <CheckIcon size={9} strokeWidth={3} />
            </span>
            <span className={cn(it.ok ? "text-foreground" : "text-muted-foreground")}>{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
