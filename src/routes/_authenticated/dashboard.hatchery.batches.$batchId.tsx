import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { BatchStatusPill } from "@/components/hatchery/BatchStatusPill";
import { BatchProgressBar } from "@/components/hatchery/BatchProgressBar";
import {
  ReservationRow,
  type ReservationRowData,
} from "@/components/hatchery/ReservationRow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ChevronLeft } from "lucide-react";
import { formatGhs } from "@/lib/format";
import type { BatchStatus } from "@/lib/hatchery-status";
import type { ReservationStatus } from "@/lib/reservation-status";

export const Route = createFileRoute("/_authenticated/dashboard/hatchery/batches/$batchId")({
  head: () => ({ meta: [{ title: "Batch reservations — farmlink" }] }),
  component: BatchDetail,
});

interface Batch {
  id: string;
  batch_type: string;
  breed: string | null;
  pickup_start_date: string;
  pickup_end_date: string;
  total_quantity: number;
  reserved_quantity: number;
  price_per_unit: number | string;
  unit_label: string;
  status: BatchStatus;
  notes: string | null;
}

function BatchDetail() {
  const { batchId } = Route.useParams();
  const { user } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [reservations, setReservations] = useState<ReservationRowData[]>([]);
  const [filter, setFilter] = useState<"all" | ReservationStatus>("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: b } = await supabase
      .from("hatchery_batches")
      .select(
        "id,batch_type,breed,pickup_start_date,pickup_end_date,total_quantity,reserved_quantity,price_per_unit,unit_label,status,notes",
      )
      .eq("id", batchId)
      .maybeSingle();
    setBatch((b as unknown as Batch | null) ?? null);

    const { data: r } = await supabase
      .from("batch_reservations")
      .select(
        "id,status,requested_qty,confirmed_qty,pickup_date,fulfilment,buyer_contact,buyer_note,delivery_address,created_at,buyer_id",
      )
      .eq("batch_id", batchId)
      .order("created_at", { ascending: false });

    const buyerIds = Array.from(new Set((r ?? []).map((row) => row.buyer_id))).filter(Boolean);
    let names: Record<string, string> = {};
    if (buyerIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,display_name")
        .in("id", buyerIds);
      names = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name]));
    }
    setReservations(
      ((r ?? []) as unknown as (ReservationRowData & { buyer_id: string })[]).map((row) => ({
        ...row,
        buyer_display_name: names[row.buyer_id] ?? "Buyer",
      })),
    );
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, [batchId, user?.id]);

  const filtered =
    filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  const counts = reservations.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-5 md:py-8">
        <Link
          to="/dashboard/hatchery/batches"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to batches
        </Link>

        {loading || !batch ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="mt-3 rounded-2xl border-[1.5px] border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-[22px] font-extrabold tracking-tight">
                    {batch.batch_type}
                    {batch.breed ? <span className="text-muted-foreground"> · {batch.breed}</span> : null}
                  </h1>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Ready {new Date(batch.pickup_start_date).toLocaleDateString()} –{" "}
                    {new Date(batch.pickup_end_date).toLocaleDateString()} ·{" "}
                    {formatGhs(batch.price_per_unit)} / {batch.unit_label}
                  </p>
                </div>
                <BatchStatusPill status={batch.status} />
              </div>
              <BatchProgressBar
                reserved={batch.reserved_quantity}
                total={batch.total_quantity}
                className="mt-4"
              />
              {batch.notes ? (
                <p className="mt-4 rounded-xl bg-surface p-3 text-[12.5px] text-foreground/80">
                  {batch.notes}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {(["all", "pending", "confirmed", "waitlisted", "fulfilled", "cancelled_by_buyer", "cancelled_by_hatchery"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-full border-[1.5px] px-3 py-1 text-[11.5px] font-semibold transition-colors ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                >
                  {f === "all"
                    ? `All (${reservations.length})`
                    : `${f.replace(/_/g, " ")} (${counts[f] ?? 0})`}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {filtered.length === 0 ? (
                <p className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                  No reservations in this view yet.
                </p>
              ) : (
                filtered.map((r) => (
                  <ReservationRow key={r.id} row={r} onChanged={() => void load()} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
