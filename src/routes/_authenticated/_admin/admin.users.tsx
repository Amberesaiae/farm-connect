import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { setUserStatus } from "@/server/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/_admin/admin/users")({
  head: () => ({ meta: [{ title: "Users — Farmlink admin" }] }),
  component: UsersMod,
});

interface Row {
  id: string;
  display_name: string;
  status: string;
  badge_tier: string;
  listing_count: number;
  trade_count: number;
}

function UsersMod() {
  const [rows, setRows] = useState<Row[]>([]);
  const setStatus = useServerFn(setUserStatus);

  const load = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id,display_name,status,badge_tier,listing_count,trade_count")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => {
    void load();
  }, []);

  const act = async (user_id: string, action: "suspend" | "unsuspend") => {
    await setStatus({ data: { user_id, action } });
    toast.success(`${action} done`);
    void load();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <div className="mt-6 space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.listing_count} listings · {r.trade_count} sales · badge {r.badge_tier}
                </p>
              </div>
              <Badge variant={r.status === "suspended" ? "destructive" : "outline"}>{r.status}</Badge>
              {r.status === "active" ? (
                <Button size="sm" variant="destructive" onClick={() => act(r.id, "suspend")}>Suspend</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => act(r.id, "unsuspend")}>Unsuspend</Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
