import { cn } from "@/lib/utils";

export type TrustTier = "none" | "sprout" | "grower" | "trusted" | "verified_pro";

const TIERS: { key: TrustTier; name: string; ring: string; bg: string; unlocks: string[] }[] = [
  {
    key: "sprout",
    name: "Sprout",
    ring: "ring-[color:var(--accent-2)]/50",
    bg: "bg-[color:var(--accent-2)]/10 text-[color:var(--accent-2)]",
    unlocks: ["Post your first 3 listings", "Show on map"],
  },
  {
    key: "grower",
    name: "Grower",
    ring: "ring-primary/50",
    bg: "bg-primary-soft text-primary",
    unlocks: ["Verified phone badge", "Post up to 10 listings", "WhatsApp tap-to-chat"],
  },
  {
    key: "trusted",
    name: "Trusted",
    ring: "ring-[color:var(--info)]/60",
    bg: "bg-info-soft text-[color:var(--info)]",
    unlocks: ["Trusted badge on cards", "Featured in 'Fresh' rail", "Priority in search"],
  },
  {
    key: "verified_pro",
    name: "Verified Pro",
    ring: "ring-amber-400",
    bg: "bg-amber-100 text-amber-700",
    unlocks: ["Pro badge + storefront", "Unlimited listings", "Bulk upload + analytics"],
  },
];

const ALIAS: Record<string, TrustTier> = {
  none: "none", sprout: "sprout", grower: "grower", trusted: "trusted", verified_pro: "verified_pro",
  bronze: "sprout", silver: "grower", gold: "trusted", platinum: "verified_pro",
};

export function TrustLadder({ current }: { current: string | null | undefined }) {
  const currentTier = ALIAS[current ?? "none"] ?? "none";
  const currentIdx = TIERS.findIndex((t) => t.key === currentTier);
  return (
    <section className="rounded-3xl border-[1.5px] border-border bg-card p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Your trust ladder
        </p>
        <h2 className="font-display mt-1 text-[20px] font-extrabold tracking-tight md:text-[22px]">
          Climb to unlock more reach
        </h2>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((t, i) => {
          const isCurrent = i === currentIdx;
          const isAchieved = i <= currentIdx;
          const isNext = i === currentIdx + 1;
          return (
            <li
              key={t.key}
              className={cn(
                "fl-lift relative flex flex-col gap-3 rounded-2xl border-[1.5px] p-4 transition-colors",
                isCurrent
                  ? "border-primary bg-primary-soft/40"
                  : isAchieved
                    ? "border-border bg-card"
                    : isNext
                      ? "border-dashed border-primary/60 bg-card"
                      : "border-border bg-card opacity-80",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl text-[12px] font-extrabold ring-2",
                    t.bg,
                    t.ring,
                  )}
                  aria-hidden
                >
                  {i + 1}
                </span>
                {isCurrent ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary-foreground">
                    You
                  </span>
                ) : isNext ? (
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary">
                    Next
                  </span>
                ) : null}
              </div>
              <div>
                <p className="font-display text-[15px] font-extrabold tracking-tight">{t.name}</p>
                <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-muted-foreground">
                  {t.unlocks.map((u) => (
                    <li key={u}>· {u}</li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
