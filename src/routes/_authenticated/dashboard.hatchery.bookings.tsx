import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ReservationRow, type ReservationRowData } from "@/components/hatchery/ReservationRow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { ReservationStatus } from "@/lib/reservation-status";

export const Route = createFileRoute("/_authenticated/dashboard/hatchery/bookings")({
  head: () => ({ meta: [{ title: "Bookings — farmlink" }] }),
  component: BookingsInbox,
});

interface Row extends ReservationRowData {
  buyer_id: string;
  batch_id: string;
  batch_type: string | null;
}

function BookingsInbox() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"all" | ReservationStatus>("pending");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: hs } = await supabase
      .from("hatcheries")
      .select("id")
      .eq("owner_id", user.id);
    const hatcheryIds = (hs ?? []).map((h) => h.id);
    if (!hatcheryIds.length) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data: batches } = await supabase
      .from("hatchery_batches")
      .select("id,batch_type")
      .in("hatchery_id", hatcheryIds);
    const batchIds = (batches ?? []).map((b) => b.id);
    const batchTypes = Object.fromEntries((batches ?? []).map((b) => [b.id, b.batch_type]));
    if (!batchIds.length) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data: rsv } = await supabase
      .from("batch_reservations")
      .select(
        "id,batch_id,status,requested_qty,confirmed_qty,pickup_date,fulfilment,buyer_contact,buyer_note,delivery_address,created_at,buyer_id",
      )
      .in("batch_id", batchIds)
      .order("created_at", { ascending: false });

    const buyerIds = Array.from(new Set((rsv ?? []).map((r) => r.buyer_id))).filter(Boolean);
    let names: Record<string, string> = {};
    if (buyerIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,display_name")
        .in("id", buyerIds);
      names = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name]));
    }

    setRows(
      ((rsv ?? []) as unknown as Row[]).map((r) => ({
        ...r,
        batch_type: batchTypes[r.batch_id] ?? null,
        buyer_display_name: names[r.buyer_id] ?? "Buyer",
      })),
    );
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, [user?.id]);

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-5 md:py-8">
        <h1 className="font-display text-[24px] font-extrabold tracking-tight">Bookings</h1>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          All reservations across your hatchery's batches, newest first.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["pending", "confirmed", "waitlisted", "fulfilled", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border-[1.5px] px-3 py-1 text-[11.5px] font-semibold transition-colors ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {f === "all"
                ? `All (${rows.length})`
                : `${f} (${counts[f] ?? 0})`}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Nothing here yet.
            </p>
          ) : (
            filtered.map((r) => (
              <div key={r.id}>
                {r.batch_type ? (
                  <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Link
                      to="/dashboard/hatchery/batches/$batchId"
                      params={{ batchId: r.batch_id }}
                      className="hover:text-foreground hover:underline"
                    >
                      {r.batch_type}
                    </Link>
                  </p>
                ) : null}
                <ReservationRow row={r} onChanged={() => void load()} />
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
