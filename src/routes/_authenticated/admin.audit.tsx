import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/layout/AppShell";
import { StaffGate } from "@/components/layout/StaffGate";
import { AdminNav } from "@/components/layout/AdminNav";
import { listAuditLog } from "@/server/reports.functions";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit log — Admin" }] }),
  component: AuditLog,
});

function AuditLog() {
  const fn = useServerFn(listAuditLog);
  const q = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => fn({ data: { limit: 200 } }),
  });

  return (
    <StaffGate>
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight">Audit log</h1>
          <p className="mt-1 text-sm text-muted-foreground">Privileged actions, newest first.</p>
          <div className="mt-5"><AdminNav /></div>

          <div className="mt-4 overflow-hidden rounded-2xl border-[1.5px] border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Actor</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {q.isLoading ? (
                  <tr><td colSpan={5} className="px-3 py-4 text-muted-foreground">Loading…</td></tr>
                ) : q.data?.rows.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-4 text-muted-foreground">Nothing logged yet.</td></tr>
                ) : (
                  q.data?.rows.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-3 py-2">{r.actor_name ?? r.actor_id.slice(0, 8)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.action}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {r.target_type}/{r.target_id.slice(0, 8)}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{r.reason ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AppShell>
    </StaffGate>
  );
}