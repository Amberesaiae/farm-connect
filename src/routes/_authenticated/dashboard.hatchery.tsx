import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { HatcheryStatusPill } from "@/components/hatchery/HatcheryStatusPill";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Egg, Inbox, ListChecks, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { HATCHERY_CATEGORY_LABEL } from "@/lib/categories";
import type { HatcheryStatus } from "@/lib/hatchery-status";

export const Route = createFileRoute("/_authenticated/dashboard/hatchery")({
  head: () => ({ meta: [{ title: "My hatchery — farmlink" }] }),
  component: HatcheryDashboard,
});

interface HatcheryRow {
  id: string;
  slug: string;
  name: string;
  status: HatcheryStatus;
  category: "poultry" | "fish" | "breeding";
  region: string;
  district: string | null;
  rejection_reason: string | null;
  capacity_per_cycle: number | null;
}

function HatcheryDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [hatchery, setHatchery] = useState<HatcheryRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ openBatches: 0, pendingReservations: 0, confirmedThisCycle: 0 });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;
      setLoading(true);
      const { data: h } = await supabase
        .from("hatcheries")
        .select("id, slug, name, status, category, region, district, rejection_reason, capacity_per_cycle")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setHatchery((h as HatcheryRow | null) ?? null);

      if (h) {
        const { data: batches } = await supabase
          .from("hatchery_batches")
          .select("id,status")
          .eq("hatchery_id", h.id);
        const batchIds = (batches ?? []).map((b) => b.id);
        const openBatches = (batches ?? []).filter((b) => b.status === "open").length;

        let pending = 0;
        let confirmed = 0;
        if (batchIds.length) {
          const { data: rsv } = await supabase
            .from("batch_reservations")
            .select("status")
            .in("batch_id", batchIds);
          pending = (rsv ?? []).filter((r) => r.status === "pending").length;
          confirmed = (rsv ?? []).filter((r) => r.status === "confirmed").length;
        }
        if (!cancelled) setCounts({ openBatches, pendingReservations: pending, confirmedThisCycle: confirmed });
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Render child routes if any
  const isOverview = location.pathname === "/dashboard/hatchery";

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground">
          Loading hatchery dashboard…
        </div>
      </AppShell>
    );
  }

  if (!hatchery) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
          <div className="rounded-3xl border-[1.5px] border-dashed border-border bg-card p-8 text-center">
            <Egg className="mx-auto h-10 w-10 text-primary" strokeWidth={1.6} />
            <h1 className="font-display mt-4 text-[24px] font-extrabold tracking-tight">
              Set up your hatchery
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-muted-foreground">
              List your operation on Farmlink so buyers can reserve day-old chicks, fingerlings, and breeding stock directly from your batches.
            </p>
            <Button asChild className="mt-5 rounded-xl">
              <Link to="/dashboard/hatchery/onboarding">Start hatchery onboarding</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const tabs = [
    { to: "/dashboard/hatchery", label: "Overview", exact: true },
    { to: "/dashboard/hatchery/batches", label: "Batches" },
    { to: "/dashboard/hatchery/bookings", label: "Bookings" },
  ] as const;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-5 md:py-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[28px] font-extrabold tracking-tight">{hatchery.name}</h1>
              <HatcheryStatusPill status={hatchery.status} />
            </div>
            <p className="mt-1 inline-flex items-center gap-1 text-[12.5px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {hatchery.district ? `${hatchery.district}, ` : ""}
              {hatchery.region} · {HATCHERY_CATEGORY_LABEL[hatchery.category]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hatchery.status === "approved" ? (
              <Button asChild className="rounded-xl">
                <Link to="/hatcheries/$slug" params={{ slug: hatchery.slug }}>
                  View public profile
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        {hatchery.status === "pending_review" ? (
          <div className="mt-4 rounded-2xl border-[1.5px] border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900">
            <strong>Application under review.</strong> A Farmlink admin is checking your permit details. You can prepare batches now — they'll go live the moment your hatchery is approved.
          </div>
        ) : null}
        {hatchery.status === "rejected" ? (
          <div className="mt-4 rounded-2xl border-[1.5px] border-red-200 bg-red-50 p-4 text-[13px] text-red-900">
            <strong>Application needs changes.</strong>
            {hatchery.rejection_reason ? <span> {hatchery.rejection_reason}</span> : null}
            {" "}Update your details and resubmit from the Overview.
          </div>
        ) : null}

        <nav className="mt-6 flex flex-wrap gap-1.5 rounded-2xl border-[1.5px] border-border bg-card p-1.5">
          {tabs.map((t) => {
            const active = t.exact
              ? location.pathname === t.to
              : location.pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        {isOverview ? (
          <>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <KpiTile label="Open batches" value={counts.openBatches} Icon={Egg} />
              <KpiTile label="Pending reservations" value={counts.pendingReservations} Icon={Inbox} />
              <KpiTile label="Confirmed" value={counts.confirmedThisCycle} Icon={ListChecks} />
            </div>

            <section className="mt-6 rounded-2xl border-[1.5px] border-border bg-card p-5">
              <h2 className="font-display text-[16px] font-extrabold tracking-tight">Quick actions</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild className="rounded-xl">
                  <Link to="/dashboard/hatchery/batches">
                    <Plus className="h-4 w-4" /> New batch
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/dashboard/hatchery/bookings">View bookings</Link>
                </Button>
              </div>
            </section>
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </AppShell>
  );
}
