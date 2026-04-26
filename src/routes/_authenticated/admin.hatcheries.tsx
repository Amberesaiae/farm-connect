import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AdminGate } from "@/components/layout/AdminGate";
import { AdminNav } from "@/components/layout/AdminNav";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { ActionConfirmDialog } from "@/components/admin/ActionConfirmDialog";
import { Button } from "@/components/ui/button";
import { HatcheryStatusPill } from "@/components/hatchery/HatcheryStatusPill";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import {
  reviewHatcheryApplication,
  getPermitSignedUrl,
} from "@/server/hatcheries.functions";
import { toast } from "sonner";
import { formatRelative } from "@/lib/format";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { ExternalLink, MapPin } from "lucide-react";
import type { HatcheryStatus } from "@/lib/hatchery-status";

export const Route = createFileRoute("/_authenticated/admin/hatcheries")({
  head: () => ({ meta: [{ title: "Hatchery review queue — farmlink admin" }] }),
  component: AdminHatcheries,
});

interface Row {
  id: string;
  slug: string;
  name: string;
  status: HatcheryStatus;
  category: "poultry" | "fish" | "breeding";
  region: string;
  district: string | null;
  blurb: string | null;
  capacity_per_cycle: number | null;
  permit_number: string | null;
  permit_authority: string | null;
  permit_doc_path: string | null;
  created_at: string;
  rejection_reason: string | null;
}

function AdminHatcheries() {
  const { taxonomy } = useTaxonomy();
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"pending_review" | "approved" | "rejected" | "suspended">(
    "pending_review",
  );
  const [loading, setLoading] = useState(true);
  const review = useServerFn(reviewHatcheryApplication);
  const getUrl = useServerFn(getPermitSignedUrl);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("hatcheries")
      .select(
        "id,slug,name,status,category,region,district,blurb,capacity_per_cycle,permit_number,permit_authority,permit_doc_path,created_at,rejection_reason",
      )
      .eq("status", filter)
      .order("created_at", { ascending: false })
      .limit(60);
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, [filter]);

  const openPermit = async (id: string) => {
    try {
      const { url } = await getUrl({ data: { hatchery_id: id } });
      if (!url) return toast.error("No permit document on file");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const act = async (
    id: string,
    action: "approve" | "reject" | "suspend" | "reinstate",
    reason: string,
  ) => {
    try {
      await review({ data: { hatchery_id: id, action, reason: reason || null } });
      toast.success(`${action} done`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <AdminGate>
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight">
            Hatchery review queue
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Verify permits and approve hatcheries before they become discoverable to buyers.
          </p>

          <div className="mt-5">
            <AdminNav />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(["pending_review", "approved", "suspended", "rejected"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : rows.length === 0 ? (
                <p className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                  Nothing in this view.
                </p>
              ) : (
                rows.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-2xl border-[1.5px] border-border bg-card p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="font-display text-[18px] font-extrabold tracking-tight">
                          {r.name}
                        </h2>
                        <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {r.district ? `${r.district}, ` : ""}
                          {r.region} · {taxonomy.labelFor("hatcheries", r.category)}
                        </p>
                      </div>
                      <HatcheryStatusPill status={r.status} />
                    </div>

                    {r.blurb ? (
                      <p className="mt-3 text-[13px] text-foreground/80">{r.blurb}</p>
                    ) : null}

                    <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                      <div>
                        <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Capacity / cycle
                        </dt>
                        <dd className="font-mono">
                          {r.capacity_per_cycle?.toLocaleString() ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Permit
                        </dt>
                        <dd>
                          {r.permit_number || r.permit_authority || "Not provided"}
                        </dd>
                      </div>
                    </dl>

                    {r.rejection_reason ? (
                      <p className="mt-3 rounded-lg bg-red-50 p-2 text-[12px] text-red-900">
                        Last reason: {r.rejection_reason}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {r.permit_doc_path ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => void openPermit(r.id)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View permit
                        </Button>
                      ) : null}

                      {r.status === "pending_review" && (
                        <>
                          <ActionConfirmDialog
                            trigger={<Button size="sm" className="rounded-lg">Approve</Button>}
                            title={`Approve ${r.name}?`}
                            description="The hatchery will be visible to buyers and able to publish batches."
                            confirmLabel="Approve"
                            reasonRequired={false}
                            onConfirm={(reason) => act(r.id, "approve", reason)}
                          />
                          <ActionConfirmDialog
                            trigger={
                              <Button size="sm" variant="destructive" className="rounded-lg">
                                Reject
                              </Button>
                            }
                            title={`Reject ${r.name}?`}
                            description="The owner will be notified with your reason."
                            confirmLabel="Reject"
                            destructive
                            onConfirm={(reason) => act(r.id, "reject", reason)}
                          />
                        </>
                      )}

                      {r.status === "approved" && (
                        <ActionConfirmDialog
                          trigger={
                            <Button size="sm" variant="destructive" className="rounded-lg">
                              Suspend
                            </Button>
                          }
                          title={`Suspend ${r.name}?`}
                          description="Hatchery will be hidden from buyers immediately."
                          confirmLabel="Suspend"
                          destructive
                          onConfirm={(reason) => act(r.id, "suspend", reason)}
                        />
                      )}

                      {(r.status === "suspended" || r.status === "rejected") && (
                        <ActionConfirmDialog
                          trigger={<Button size="sm" className="rounded-lg">Reinstate</Button>}
                          title={`Reinstate ${r.name}?`}
                          description="Hatchery will become approved and discoverable."
                          confirmLabel="Reinstate"
                          reasonRequired={false}
                          onConfirm={(reason) => act(r.id, "reinstate", reason)}
                        />
                      )}
                    </div>

                    <p className="mt-3 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                      Submitted {formatRelative(r.created_at)}
                    </p>
                  </article>
                ))
              )}
            </div>

            <aside className="self-start">
              <AdminAuditLog targetType="hatchery" />
            </aside>
          </div>
        </div>
      </AppShell>
    </AdminGate>
  );
}
