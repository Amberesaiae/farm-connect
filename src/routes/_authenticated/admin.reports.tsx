import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/layout/AppShell";
import { StaffGate } from "@/components/layout/StaffGate";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listReports, resolveReport, type ReportRow } from "@/server/reports.functions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
  component: ReportsQueue,
});

function ReportsQueue() {
  const [status, setStatus] = useState<"open" | "resolved" | "dismissed" | "all">("open");
  const list = useServerFn(listReports);
  const resolve = useServerFn(resolveReport);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["admin-reports", status],
    queryFn: () => list({ data: { status, limit: 100 } }),
  });

  const onAction = async (r: ReportRow, action: "resolve" | "dismiss") => {
    try {
      await resolve({ data: { report_id: r.id, action } });
      toast.success(action === "resolve" ? "Report resolved" : "Report dismissed");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <StaffGate>
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Community-flagged content.</p>
          <div className="mt-5"><AdminNav /></div>

          <Tabs value={status} onValueChange={(v) => setStatus(v as never)} className="mt-5">
            <TabsList className="rounded-xl border-[1.5px] border-border bg-card p-1">
              <TabsTrigger value="open" className="rounded-lg">Open</TabsTrigger>
              <TabsTrigger value="resolved" className="rounded-lg">Resolved</TabsTrigger>
              <TabsTrigger value="dismissed" className="rounded-lg">Dismissed</TabsTrigger>
              <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-4 space-y-2">
            {q.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : q.data?.reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports.</p>
            ) : (
              q.data?.reports.map((r) => (
                <div key={r.id} className="rounded-2xl border-[1.5px] border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-extrabold tracking-tight">
                        {r.target_kind} · {r.target_label ?? r.target_id.slice(0, 8)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Reported by {r.reporter_name ?? r.reporter_id.slice(0, 8)} ·{" "}
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </p>
                      <p className="mt-2 text-sm"><strong>Reason:</strong> {r.reason}</p>
                      {r.details && <p className="mt-1 text-sm text-muted-foreground">{r.details}</p>}
                    </div>
                    {r.status === "open" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onAction(r, "dismiss")}>
                          Dismiss
                        </Button>
                        <Button size="sm" onClick={() => onAction(r, "resolve")}>
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </AppShell>
    </StaffGate>
  );
}