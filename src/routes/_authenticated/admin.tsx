import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StaffGate } from "@/components/layout/StaffGate";
import { AdminNav } from "@/components/layout/AdminNav";
import { ShieldCheck, ListChecks, Users, Layers } from "lucide-react";
import { useMySession } from "@/hooks/useMySession";

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
