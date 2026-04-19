import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AdminGate } from "@/components/layout/AdminGate";
import { AdminNav } from "@/components/layout/AdminNav";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { ActionConfirmDialog } from "@/components/admin/ActionConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { moderateListingWithAudit } from "@/server/admin-audit.functions";
import { toast } from "sonner";
import { formatGhs, formatRelative } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/listings")({
  head: () => ({ meta: [{ title: "Listing moderation — farmlink admin" }] }),
  component: ListingMod,
});

interface Row {
  id: string;
  title: string;
  status: string;
  price_ghs: number | string;
  region: string;
  top_category: string;
  created_at: string;
  profiles: { display_name: string } | null;
}

function ListingMod() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const moderate = useServerFn(moderateListingWithAudit);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("id,title,status,price_ghs,region,top_category,created_at,profiles!listings_seller_id_fkey(display_name)")
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const act = async (id: string, action: "hide" | "restore" | "delete", reason: string) => {
    try {
      await moderate({ data: { listing_id: id, action, reason: reason || null } });
      toast.success(`${action} done`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <AdminGate>
      <AppShell>
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight">
            Listing moderation
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Hide or remove listings that violate guidelines. Every action is logged with a reason.
          </p>
          <div className="mt-5">
            <AdminNav />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : rows.length === 0 ? (
                <p className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                  No listings yet.
                </p>
              ) : (
                rows.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border-[1.5px] border-border bg-card p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/listings/$id"
                        params={{ id: r.id }}
                        className="block truncate font-semibold hover:underline"
                      >
                        {r.title}
                      </Link>
                      <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                        {r.profiles?.display_name ?? "—"} · {r.top_category} · {r.region} ·{" "}
                        {formatGhs(r.price_ghs)} · {formatRelative(r.created_at)}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {r.status}
                    </Badge>
                    {r.status !== "hidden" ? (
                      <ActionConfirmDialog
                        trigger={
                          <Button size="sm" variant="outline" className="rounded-lg">
                            Hide
                          </Button>
                        }
                        title={`Hide "${r.title}"?`}
                        description="The listing will be hidden from buyers and the seller will be notified with your reason."
                        confirmLabel="Hide listing"
                        destructive
                        onConfirm={(reason) => act(r.id, "hide", reason)}
                      />
                    ) : (
                      <ActionConfirmDialog
                        trigger={
                          <Button size="sm" variant="outline" className="rounded-lg">
                            Restore
                          </Button>
                        }
                        title={`Restore "${r.title}"?`}
                        description="The listing will become visible to buyers again."
                        confirmLabel="Restore"
                        reasonRequired={false}
                        onConfirm={(reason) => act(r.id, "restore", reason)}
                      />
                    )}
                    <ActionConfirmDialog
                      trigger={
                        <Button size="sm" variant="destructive" className="rounded-lg">
                          Delete
                        </Button>
                      }
                      title={`Delete "${r.title}" permanently?`}
                      description="This cannot be undone. Photos and analytics for this listing will be removed."
                      confirmLabel="Delete"
                      destructive
                      onConfirm={(reason) => act(r.id, "delete", reason)}
                    />
                  </div>
                ))
              )}
            </div>

            <aside className="self-start">
              <AdminAuditLog targetType="listing" />
            </aside>
          </div>
        </div>
      </AppShell>
    </AdminGate>
  );
}
