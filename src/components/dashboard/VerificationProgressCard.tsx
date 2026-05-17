import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ShieldIcon, ArrowRightIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const ALIAS: Record<string, string> = {
  bronze: "sprout", silver: "grower", gold: "trusted", platinum: "verified_pro",
};
const STEP: Record<string, number> = { none: 0, sprout: 1, grower: 2, trusted: 3, verified_pro: 4 };
const LABEL: Record<string, string> = {
  none: "Get started", sprout: "Sprout", grower: "Grower", trusted: "Trusted", verified_pro: "Verified Pro",
};
const NEXT: Record<string, string> = {
  none: "Verify your phone to reach Sprout",
  sprout: "Submit your ID to reach Grower",
  grower: "Complete 3 trades to reach Trusted",
  trusted: "Open a storefront to reach Verified Pro",
  verified_pro: "You're at the top tier",
};

export function VerificationProgressCard() {
  const { user } = useAuth();
  const [tier, setTier] = useState<string>("none");

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("badge_tier")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const raw = (data?.badge_tier as string | undefined) ?? "none";
        setTier(ALIAS[raw] ?? raw);
      });
  }, [user?.id]);

  const step = STEP[tier] ?? 0;
  const pct = Math.round((step / 4) * 100);
  const isMax = tier === "verified_pro";

  return (
    <Link
      to="/dashboard/verification"
      className="fl-lift group flex items-center gap-4 rounded-2xl border-[1.5px] border-border bg-card p-4 hover:border-primary"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {isMax ? <CheckIcon size={22} strokeWidth={3} /> : <ShieldIcon size={22} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Trust tier
          </p>
          <p className="font-mono text-[11px] font-semibold text-muted-foreground">{pct}%</p>
        </div>
        <p className="font-display text-[15px] font-extrabold tracking-tight">
          {LABEL[tier] ?? "Get started"}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{NEXT[tier]}</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <span
            className={cn("block h-full rounded-full bg-primary transition-all")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <ArrowRightIcon
        size={16}
        className="hidden text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block"
      />
    </Link>
  );
}
