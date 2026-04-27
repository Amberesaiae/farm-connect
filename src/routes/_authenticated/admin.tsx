import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/layout/AppShell";
import { StaffGate } from "@/components/layout/StaffGate";
import { AdminNav } from "@/components/layout/AdminNav";
import {
  ShieldCheck,
  ListChecks,
  Users,
  Layers,
  Flag,
  ScrollText,
  AlertTriangle,
  Clock,
  EyeOff,
  UserX,
} from "lucide-react";
import { useMySession } from "@/hooks/useMySession";
import { getAbuseSnapshot } from "@/server/reports.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — farmlink" }] }),
  component: AdminHome,
});

function AdminHome() {
  const { session } = useMySession();
  const isAdmin = !!session?.roles.includes("admin");
  const cards = [
    { to: "/admin/verifications", title: "Verification queue", desc: "Approve or reject seller IDs.", Icon: ShieldCheck, adminOnly: false },
    { to: "/admin/listings", title: "Listing moderation", desc: "Hide, restore or delete listings.", Icon: ListChecks, adminOnly: false },
    { to: "/admin/reports", title: "Reports inbox", desc: "Triage user-submitted reports.", Icon: Flag, adminOnly: false },
    { to: "/admin/audit", title: "Audit log", desc: "Privileged actions, newest first.", Icon: ScrollText, adminOnly: false },
    { to: "/admin/users", title: "Users", desc: "Suspend or reinstate accounts.", Icon: Users, adminOnly: true },
    { to: "/admin/taxonomy", title: "Taxonomy", desc: "Manage categories, attributes & catalogs.", Icon: Layers, adminOnly: true },
  ].filter((c) => isAdmin || !c.adminOnly);
  return (
    <StaffGate>
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Operations dashboard for the farmlink team.
          </p>
          <div className="mt-5">
            <AdminNav />
          </div>
          <AbuseSnapshotPanel />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="rounded-2xl border-[1.5px] border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <c.Icon className="h-6 w-6 text-primary" strokeWidth={1.75} />
                <p className="font-display mt-3 text-[16px] font-extrabold tracking-tight">
                  {c.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </AppShell>
    </StaffGate>
  );
}

/**
 * Compact 6-tile dashboard of moderation hotspots: open reports, last-24h
 * volume, pending verifications/hatcheries/stores, hidden listings, suspended
 * users. Each tile links to the relevant queue.
 */
function AbuseSnapshotPanel() {
  const fn = useServerFn(getAbuseSnapshot);
  const q = useQuery({ queryKey: ["abuse-snapshot"], queryFn: () => fn(), staleTime: 30_000 });
  const s = q.data;

  const tiles = [
    { to: "/admin/reports", label: "Open reports", value: s?.open_reports, Icon: Flag, tone: "danger" as const },
    { to: "/admin/reports", label: "Reports · 24h", value: s?.reports_24h, Icon: Clock, tone: "default" as const },
    { to: "/admin/verifications", label: "Pending IDs", value: s?.pending_verifications, Icon: ShieldCheck, tone: "warn" as const },
    { to: "/admin/hatcheries", label: "Pending hatcheries", value: s?.pending_hatcheries, Icon: AlertTriangle, tone: "warn" as const },
    { to: "/admin/stores", label: "Pending shops", value: s?.pending_stores, Icon: AlertTriangle, tone: "warn" as const },
    { to: "/admin/listings", label: "Hidden listings", value: s?.hidden_listings, Icon: EyeOff, tone: "default" as const },
    { to: "/admin/users", label: "Suspended users", value: s?.suspended_users, Icon: UserX, tone: "default" as const },
  ];

  return (
    <div className="mt-5 rounded-2xl border-[1.5px] border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-extrabold tracking-tight">Abuse snapshot</p>
        {q.isLoading && <span className="text-xs text-muted-foreground">Loading…</span>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
        {tiles.map((t) => {
          const v = t.value;
          const hot = typeof v === "number" && v > 0;
          return (
            <Link
              key={t.label}
              to={t.to}
              className={
                "rounded-xl border-[1.5px] p-3 transition-colors " +
                (hot && t.tone === "danger"
                  ? "border-destructive/40 bg-destructive/5 hover:border-destructive/60"
                  : hot && t.tone === "warn"
                    ? "border-amber-400/50 bg-amber-50 hover:border-amber-500/60 dark:bg-amber-950/20"
                    : "border-border bg-surface hover:border-primary/40")
              }
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <t.Icon className="h-3.5 w-3.5" />
                {t.label}
              </div>
              <p className="font-display mt-1 text-[22px] font-extrabold tracking-tight">
                {typeof v === "number" ? v : "—"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
