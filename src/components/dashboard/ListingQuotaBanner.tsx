import { Link } from "@tanstack/react-router";
import { Gauge, ShieldCheck, Infinity as InfinityIcon } from "lucide-react";
import { useListingCaps } from "@/hooks/useListingCaps";

/**
 * Compact tile showing how many of the seller's active-listing slots are used.
 * Verified vendors see "Unlimited"; phone-only sellers see "x / 30" with a
 * nudge to verify ID and lift the cap to 100.
 */
export function ListingQuotaBanner() {
  const { caps, loading } = useListingCaps();
  if (loading || !caps) return null;

  if (caps.unlimited) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-emerald-300/60 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-100">
        <InfinityIcon className="h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-extrabold tracking-tight">
            Unlimited listings
          </p>
          <p className="text-xs opacity-80">
            {caps.active} active. Vendor accounts have no posting cap.
          </p>
        </div>
      </div>
    );
  }

  const cap = caps.cap ?? 0;
  const pct = cap > 0 ? Math.min(100, Math.round((caps.active / cap) * 100)) : 0;
  const danger = cap > 0 && caps.active >= cap;
  const near = cap > 0 && caps.active >= cap - 2 && !danger;

  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Gauge className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-extrabold tracking-tight">
            {caps.active} of {cap} active listings used
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {danger
              ? "You've hit your cap. Mark old listings as sold or verify your ID to lift the cap."
              : near
                ? "You're close to your limit. Verify your ID to lift the cap to 100."
                : caps.id_verified
                  ? "ID-verified accounts can post up to 100 active listings."
                  : "Phone-verified accounts can post up to 30 active listings."}
          </p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={
            danger
              ? "h-full bg-destructive"
              : near
                ? "h-full bg-amber-500"
                : "h-full bg-primary"
          }
          style={{ width: `${pct}%` }}
        />
      </div>
      {!caps.id_verified && (
        <Link
          to="/dashboard/verification"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Verify your ID to unlock 100 listings
        </Link>
      )}
    </div>
  );
}