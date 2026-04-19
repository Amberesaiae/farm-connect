import { Link } from "@tanstack/react-router";
import { Calendar, MapPin } from "lucide-react";
import { BatchProgressBar } from "./BatchProgressBar";
import { BatchStatusPill } from "./BatchStatusPill";
import { formatGhs } from "@/lib/format";
import type { BatchStatus } from "@/lib/hatchery-status";

export interface BatchCardData {
  id: string;
  batch_type: string;
  breed: string | null;
  hatch_date: string | null;
  pickup_start_date: string;
  pickup_end_date: string;
  total_quantity: number;
  reserved_quantity: number;
  price_per_unit: number | string;
  unit_label: string;
  region: string;
  status: BatchStatus;
  min_order_qty: number;
}

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
  });
}

export function BatchCard({
  hatcherySlug,
  batch,
}: {
  hatcherySlug: string;
  batch: BatchCardData;
}) {
  const sold = batch.status === "full" || batch.status === "closed" || batch.status === "cancelled";
  return (
    <Link
      to="/hatcheries/$slug/batches/$batchId"
      params={{ slug: hatcherySlug, batchId: batch.id }}
      className="group block rounded-2xl border-[1.5px] border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-[15.5px] font-extrabold tracking-tight text-foreground">
          {batch.batch_type}
          {batch.breed ? <span className="text-muted-foreground"> · {batch.breed}</span> : null}
        </h3>
        <BatchStatusPill status={batch.status} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
        {batch.hatch_date ? (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Hatched {fmtDate(batch.hatch_date)}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Ready {fmtDate(batch.pickup_start_date)} – {fmtDate(batch.pickup_end_date)}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {batch.region}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[20px] font-bold leading-none text-foreground">
            {formatGhs(batch.price_per_unit)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            per {batch.unit_label} · min {batch.min_order_qty.toLocaleString()}
          </p>
        </div>
      </div>

      <BatchProgressBar
        reserved={batch.reserved_quantity}
        total={batch.total_quantity}
        className="mt-3"
      />

      <p className="mt-3 text-[12px] font-semibold text-primary group-hover:underline">
        {sold ? "View batch" : "Reserve →"}
      </p>
    </Link>
  );
}
