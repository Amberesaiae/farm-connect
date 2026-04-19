import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AdminGate } from "@/components/layout/AdminGate";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import {
  listPendingAgroStores,
  moderateAgroStore,
  getAgroStoreLicenceUrl,
} from "@/server/agro-stores.functions";
import { ActionConfirmDialog } from "@/components/admin/ActionConfirmDialog";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { toast } from "sonner";
import {
  AGRO_PILLAR_LABEL,
  AGRO_STORE_STATUS_LABEL,
  AGRO_STORE_STATUS_TONE,
  type AgroPillar,
  type AgroStoreStatus,
} from "@/lib/agro-store-status";

export const Route = createFileRoute("/_authenticated/admin/stores")({
  head: () => ({ meta: [{ title: "Admin · Shops — farmlink" }] }),
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl p-6 text-center">
          <h1 className="font-display text-xl font-extrabold">Admin error</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <Button className="mt-4" onClick={() => router.invalidate()}>Retry</Button>
        </div>
      </AppShell>
    );
  },
  component: AdminStoresPage,
});

interface Row {
  id: string;
  business_name: string;
  pillar: AgroPillar;
  region: string;
  district: string | null;
  status: AgroStoreStatus;
  vsd_licence_number: string | null;
  business_reg_number: string | null;
  licence_doc_path: string | null;
  created_at: string;
}

function AdminStoresPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 md:py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[24px] font-extrabold tracking-tight">Shops review</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">Approve, reject and suspend agro vendor shops.</p>
          </div>
        </div>
        <AdminNav />
        <AdminGate><Inner /></AdminGate>
      </div>
    </AppShell>
  );
}

function Inner() {
  const list = useServerFn(listPendingAgroStores);
  const moderate = useServerFn(moderateAgroStore);
  const signed = useServerFn(getAgroStoreLicenceUrl);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const r = await list();
    setRows(r.stores as Row[]);
    setLoading(false);
  };
  useEffect(() => { void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function viewLicence(id: string) {
    try {
      const r = await signed({ data: { store_id: id } });
      if (r.url) window.open(r.url, "_blank", "noreferrer");
      else toast.info("No licence document on file.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  async function runAction(
    storeId: string,
    action: "approve" | "reject" | "suspend" | "reinstate",
    reason: string,
  ) {
    try {
      await moderate({ data: { store_id: storeId, action, reason: reason || null } });
      toast.success(`Shop ${action}d`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  const filterToneFor = (s: AgroStoreStatus) => AGRO_STORE_STATUS_TONE[s];

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">No shop applications yet.</div>
      ) : (
        rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display truncate text-[15px] font-extrabold tracking-tight">{r.business_name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${filterToneFor(r.status)}`}>{AGRO_STORE_STATUS_LABEL[r.status]}</span>
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">{AGRO_PILLAR_LABEL[r.pillar]} · {r.district ? `${r.district}, ` : ""}{r.region}</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                  <div><dt className="text-muted-foreground">Business reg</dt><dd>{r.business_reg_number || "—"}</dd></div>
                  <div><dt className="text-muted-foreground">VSD licence</dt><dd>{r.vsd_licence_number || "—"}</dd></div>
                </dl>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.licence_doc_path && (
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => viewLicence(r.id)}>View licence</Button>
                )}
                {r.status === "pending_review" && (
                  <>
                    <ActionConfirmDialog
                      trigger={<Button size="sm" className="rounded-xl">Approve</Button>}
                      title={`Approve ${r.business_name}`}
                      description="Owner will be notified and listings auto-link to the shop."
                      confirmLabel="Approve shop"
                      reasonRequired={false}
                      onConfirm={(reason) => runAction(r.id, "approve", reason)}
                    />
                    <ActionConfirmDialog
                      trigger={<Button size="sm" variant="destructive" className="rounded-xl">Reject</Button>}
                      title={`Reject ${r.business_name}`}
                      description="Owner will be notified with the reason."
                      confirmLabel="Reject shop"
                      destructive
                      onConfirm={(reason) => runAction(r.id, "reject", reason)}
                    />
                  </>
                )}
                {r.status === "approved" && (
                  <ActionConfirmDialog
                    trigger={<Button size="sm" variant="destructive" className="rounded-xl">Suspend</Button>}
                    title={`Suspend ${r.business_name}`}
                    description="Shop will be hidden from public discovery."
                    confirmLabel="Suspend shop"
                    destructive
                    onConfirm={(reason) => runAction(r.id, "suspend", reason)}
                  />
                )}
                {r.status === "suspended" && (
                  <ActionConfirmDialog
                    trigger={<Button size="sm" className="rounded-xl">Reinstate</Button>}
                    title={`Reinstate ${r.business_name}`}
                    description="Shop will appear in the public directory again."
                    confirmLabel="Reinstate shop"
                    reasonRequired={false}
                    onConfirm={(reason) => runAction(r.id, "reinstate", reason)}
                  />
                )}
              </div>
            </div>
          </div>
        ))
      )}

      <AdminAuditLog targetType="agro_store" />
    </div>
  );
}

