import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatRelative } from "@/lib/format";
import { ScrollText } from "lucide-react";

interface AuditEntry {
  id: number;
  created_at: string;
  action: string;
  target_type: string;
  target_id: string;
  reason: string | null;
}

interface Props {
  /**
   * Optional filter — only show audit entries for a specific target_type
   * (e.g. "hatchery", "listing", "user").
   */
  targetType?: string;
  limit?: number;
}

export function AdminAuditLog({ targetType, limit = 20 }: Props) {
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let q = supabase
        .from("admin_audit_logs")
        .select("id,created_at,action,target_type,target_id,reason")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (targetType) q = q.eq("target_type", targetType);
      const { data } = await q;
      if (!cancelled) {
        setRows((data ?? []) as AuditEntry[]);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [targetType, limit]);

  return (
    <section className="rounded-2xl border-[1.5px] border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-display text-[14px] font-extrabold tracking-tight">
          Recent admin actions
        </h2>
      </div>
      {loading ? (
        <p className="mt-3 text-[12px] text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-[12px] text-muted-foreground">No actions recorded yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border/60">
          {rows.map((r) => (
            <li key={r.id} className="py-2.5 text-[12.5px]">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {r.action}
                </span>
                <span className="text-[10.5px] text-muted-foreground">
                  {formatRelative(r.created_at)}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                {r.target_type} · {r.target_id.slice(0, 8)}…
              </p>
              {r.reason ? (
                <p className="mt-1 rounded-md bg-surface p-1.5 text-[11.5px] text-foreground/80">
                  {r.reason}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
