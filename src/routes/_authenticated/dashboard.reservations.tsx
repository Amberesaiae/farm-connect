import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ReservationStatusPill } from "@/components/hatchery/ReservationStatusPill";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { cancelReservation } from "@/server/reservations.functions";
import { toast } from "sonner";
import { formatGhs, formatRelative } from "@/lib/format";
import { Calendar, Egg, MapPin } from "lucide-react";
import type { ReservationStatus } from "@/lib/reservation-status";

export const Route = createFileRoute("/_authenticated/dashboard/reservations")({
  head: () => ({ meta: [{ title: "My reservations — farmlink" }] }),
  component: BuyerReservations,
});

interface Row {
  id: string;
  status: ReservationStatus;
  requested_qty: number;
  confirmed_qty: number | null;
  pickup_date: string | null;
  fulfilment: "pickup" | "delivery";
  buyer_note: string | null;
  hatchery_note: string | null;
  created_at: string;
  batch: {
    id: string;
    batch_type: string;
    breed: string | null;
    price_per_unit: number | string;
    unit_label: string;
    pickup_start_date: string;
    pickup_end_date: string;
    region: string;
    hatcheries: {
      slug: string;
      name: string;
    } | null;
  } | null;
}

function BuyerReservations() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "history">("active");
  const cancel = useServerFn(cancelReservation);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("batch_reservations")
      .select(
        "id,status,requested_qty,confirmed_qty,pickup_date,fulfilment,buyer_note,hatchery_note,created_at,batch:hatchery_batches(id,batch_type,breed,price_per_unit,unit_label,pickup_start_date,pickup_end_date,region,hatcheries(slug,name))",
      )
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, [user?.id]);

  const isActive = (s: ReservationStatus) => s === "pending" || s === "confirmed" || s === "waitlisted";
  const filtered = rows.filter((r) =>
    filter === "active" ? isActive(r.status) : !isActive(r.status),
  );

  const doCancel = async (id: string) => {
    if (!confirm("Cancel this reservation?")) return;
    try {
      await cancel({ data: { reservation_id: id, by_hatchery: false } });
      toast.success("Reservation cancelled");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-5 md:py-8">
        <h1 className="font-display text-[28px] font-extrabold tracking-tight">My reservations</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Track every batch you've reserved from a hatchery.
        </p>

        <div className="mt-5 flex gap-2">
          {(["active", "history"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {f === "active" ? "Active" : "History"}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-10 text-center">
              <Egg className="mx-auto h-8 w-8 text-primary" strokeWidth={1.6} />
              <p className="mt-3 text-sm text-muted-foreground">
                {filter === "active"
                  ? "You haven't reserved any batches yet."
                  : "No past reservations."}
              </p>
              <Button asChild className="mt-4 rounded-xl">
                <Link to="/hatcheries">Browse hatcheries</Link>
              </Button>
            </div>
          ) : (
            filtered.map((r) => {
              const b = r.batch;
              return (
                <article
                  key={r.id}
                  className="rounded-2xl border-[1.5px] border-border bg-card p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      {b?.hatcheries ? (
                        <Link
                          to="/hatcheries/$slug"
                          params={{ slug: b.hatcheries.slug }}
                          className="text-[11.5px] font-semibold uppercase tracking-wider text-primary hover:underline"
                        >
                          {b.hatcheries.name}
                        </Link>
                      ) : null}
                      <h2 className="font-display mt-0.5 text-[16px] font-extrabold tracking-tight">
                        {b?.batch_type ?? "Batch"}
                        {b?.breed ? <span className="text-muted-foreground"> · {b.breed}</span> : null}
                      </h2>
                    </div>
                    <ReservationStatusPill status={r.status} />
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
                    <Field icon={<Calendar className="h-3 w-3" />} label="Ready">
                      {b
                        ? `${new Date(b.pickup_start_date).toLocaleDateString()} – ${new Date(b.pickup_end_date).toLocaleDateString()}`
                        : "—"}
                    </Field>
                    <Field icon={<MapPin className="h-3 w-3" />} label="Region">
                      {b?.region ?? "—"}
                    </Field>
                    <Field label="Quantity">
                      <span className="font-mono">
                        {r.confirmed_qty
                          ? `${r.confirmed_qty.toLocaleString()} confirmed`
                          : `${r.requested_qty.toLocaleString()} requested`}
                      </span>
                    </Field>
                    <Field label="Total">
                      <span className="font-mono font-semibold">
                        {b
                          ? formatGhs(
                              Number(b.price_per_unit) * (r.confirmed_qty ?? r.requested_qty),
                            )
                          : "—"}
                      </span>
                    </Field>
                  </dl>

                  {r.hatchery_note ? (
                    <p className="mt-3 rounded-lg bg-surface p-2 text-[12px] text-foreground/80">
                      <strong>Hatchery note:</strong> {r.hatchery_note}
                    </p>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground">
                      Reserved {formatRelative(r.created_at)}
                    </p>
                    <div className="flex gap-2">
                      {b?.hatcheries ? (
                        <Button asChild variant="outline" size="sm" className="rounded-lg">
                          <Link to="/hatcheries/$slug" params={{ slug: b.hatcheries.slug }}>
                            View hatchery
                          </Link>
                        </Button>
                      ) : null}
                      {(r.status === "pending" || r.status === "waitlisted") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => doCancel(r.id)}
                          className="rounded-lg text-destructive hover:text-destructive"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
