import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AdminGate } from "@/components/layout/AdminGate";
import { ShieldCheck, ListChecks, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Farmlink" }] }),
  component: AdminHome,
});

function AdminHome() {
  const cards = [
    { to: "/admin/verifications", title: "Verification queue", desc: "Approve or reject seller IDs.", Icon: ShieldCheck },
    { to: "/admin/listings", title: "Listing moderation", desc: "Hide, restore or delete listings.", Icon: ListChecks },
    { to: "/admin/users", title: "Users", desc: "Suspend or reinstate accounts.", Icon: Users },
  ] as const;
  return (
    <AdminGate>
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {cards.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="rounded-2xl border border-border p-5 hover:bg-surface transition-colors"
              >
                <c.Icon className="h-6 w-6 text-primary" />
                <p className="mt-3 font-semibold">{c.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </AppShell>
    </AdminGate>
  );
}
