import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ReservationForm } from "@/components/hatchery/ReservationForm";
import { BatchProgressBar } from "@/components/hatchery/BatchProgressBar";
import { BatchStatusPill } from "@/components/hatchery/BatchStatusPill";
import { Calendar, MapPin, Truck, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatGhs } from "@/lib/format";
import type { BatchStatus } from "@/lib/hatchery-status";

export const Route = createFileRoute("/hatcheries/$slug/batches/$batchId")({
  loader: async ({ params }) => {
    const { data: hatchery } = await supabase
      .from("hatcheries")
      .select("id, slug, name, region, district, whatsapp_e164, status")
      .eq("slug", params.slug)
      .maybeSingle();
    if (!hatchery || hatchery.status !== "approved") throw notFound();

    const { data: batch } = await supabase
      .from("hatchery_batches")
      .select(
        "id, hatchery_id, batch_type, breed, hatch_date, pickup_start_date, pickup_end_date, total_quantity, reserved_quantity, min_order_qty, price_per_unit, unit_label, region, allows_pickup, allows_delivery, notes, status",
      )
      .eq("id", params.batchId)
      .eq("hatchery_id", hatchery.id)
      .maybeSingle();
    if (!batch) throw notFound();
    return { hatchery, batch };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.batch.batch_type ?? "Batch"} — ${loaderData?.hatchery.name ?? "Hatchery"} · farmlink`,
      },
    ],
  }),
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="font-display text-2xl font-extrabold">Batch not found</h1>
        <Link to="/hatcheries" className="mt-4 inline-block font-semibold text-primary">
          ← Back to hatcheries
        </Link>
      </div>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="font-display text-2xl font-extrabold">Could not load batch</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </AppShell>
  ),
  component: BatchDetailPage,
});

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Batch {
  id: string;
  batch_type: string;
  breed: string | null;
  hatch_date: string | null;
  pickup_start_date: string;
  pickup_end_date: string;
  total_quantity: number;
  reserved_quantity: number;
  min_order_qty: number;
  price_per_unit: number | string;
  unit_label: string;
  region: string;
  allows_pickup: boolean;
  allows_delivery: boolean;
  notes: string | null;
  status: BatchStatus;
}

function BatchDetailPage() {
  const { hatchery, batch } = Route.useLoaderData() as {
    hatchery: { slug: string; name: string };
    batch: Batch;
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <Link
          to="/hatcheries/$slug"
          params={{ slug: hatchery.slug }}
          className="inline-block text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
        >
          ← {hatchery.name}
        </Link>

        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border-[1.5px] border-border bg-card p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-tight md:text-[34px]">
                  {batch.batch_type}
                </h1>
                {batch.breed ? (
                  <p className="mt-1 text-[14px] text-muted-foreground">{batch.breed}</p>
                ) : null}
              </div>
              <BatchStatusPill status={batch.status} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat icon={<Package className="h-4 w-4" />} label="Price">
                {formatGhs(batch.price_per_unit)}
                <span className="text-[10px] font-normal text-muted-foreground">
                  {" "}
                  / {batch.unit_label}
                </span>
              </Stat>
              <Stat icon={<Package className="h-4 w-4" />} label="Min order">
                {batch.min_order_qty.toLocaleString()}
              </Stat>
              <Stat icon={<Calendar className="h-4 w-4" />} label="Hatched">
                {fmtDate(batch.hatch_date)}
              </Stat>
              <Stat icon={<MapPin className="h-4 w-4" />} label="Region">
                {batch.region}
              </Stat>
            </div>

            <div className="mt-5 rounded-xl bg-surface p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Ready window
              </p>
              <p className="font-mono mt-1 text-[15px] font-semibold text-foreground">
                {fmtDate(batch.pickup_start_date)} – {fmtDate(batch.pickup_end_date)}
              </p>
              <BatchProgressBar
                reserved={batch.reserved_quantity}
                total={batch.total_quantity}
                className="mt-3"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-[12px]">
              {batch.allows_pickup && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary">
                  <Package className="h-3 w-3" /> Pickup at hatchery
                </span>
              )}
              {batch.allows_delivery && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary">
                  <Truck className="h-3 w-3" /> Delivery available
                </span>
              )}
            </div>

            {batch.notes ? (
              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Notes from the hatchery
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground/80">
                  {batch.notes}
                </p>
              </div>
            ) : null}
          </div>

          <div>
            {batch.status === "open" ? (
              <ReservationForm batch={batch} />
            ) : (
              <div className="rounded-2xl border-[1.5px] border-border bg-card p-5 text-center">
                <BatchStatusPill status={batch.status} />
                <p className="mt-3 text-[13px] text-muted-foreground">
                  This batch is no longer accepting reservations.
                </p>
                <Link
                  to="/hatcheries/$slug"
                  params={{ slug: hatchery.slug }}
                  className="mt-3 inline-block text-[12.5px] font-semibold text-primary hover:underline"
                >
                  See other batches →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border-[1.5px] border-border bg-card p-3">
      <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </p>
      <p className="font-mono mt-1 text-[15px] font-bold text-foreground">{children}</p>
    </div>
  );
}
