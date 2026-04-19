import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BatchStatusPill } from "@/components/hatchery/BatchStatusPill";
import { BatchProgressBar } from "@/components/hatchery/BatchProgressBar";
import { BatchForm, EMPTY_BATCH, type BatchFormValue } from "@/components/hatchery/BatchForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { closeBatch } from "@/server/hatchery-batches.functions";
import { toast } from "sonner";
import { formatGhs } from "@/lib/format";
import { Calendar, MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BatchStatus } from "@/lib/hatchery-status";

export const Route = createFileRoute("/_authenticated/dashboard/hatchery/batches")({
  head: () => ({ meta: [{ title: "Batches — farmlink" }] }),
  component: BatchesPage,
});

interface BatchRow {
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
  notes: string | null;
  allows_pickup: boolean;
  allows_delivery: boolean;
}

function BatchesPage() {
  const { user } = useAuth();
  const [hatcheryId, setHatcheryId] = useState<string | null>(null);
  const [defaultRegion, setDefaultRegion] = useState<string | null>(null);
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BatchFormValue | null>(null);
  const close = useServerFn(closeBatch);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: h } = await supabase
      .from("hatcheries")
      .select("id,region")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!h) {
      setLoading(false);
      return;
    }
    setHatcheryId(h.id);
    setDefaultRegion(h.region);
    const { data: b } = await supabase
      .from("hatchery_batches")
      .select(
        "id,batch_type,breed,hatch_date,pickup_start_date,pickup_end_date,total_quantity,reserved_quantity,price_per_unit,unit_label,region,status,min_order_qty,notes,allows_pickup,allows_delivery",
      )
      .eq("hatchery_id", h.id)
      .order("pickup_start_date", { ascending: true });
    setRows((b ?? []) as unknown as BatchRow[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, [user?.id]);

  const startEdit = (r: BatchRow) => {
    setEditing({
      id: r.id,
      batch_type: r.batch_type,
      breed: r.breed ?? "",
      hatch_date: r.hatch_date ?? "",
      pickup_start_date: r.pickup_start_date,
      pickup_end_date: r.pickup_end_date,
      total_quantity: r.total_quantity,
      min_order_qty: r.min_order_qty,
      price_per_unit: r.price_per_unit,
      unit_label: r.unit_label,
      region: r.region,
      allows_pickup: r.allows_pickup,
      allows_delivery: r.allows_delivery,
      notes: r.notes ?? "",
      status: r.status,
    });
    setOpen(true);
  };

  const startCreate = () => {
    setEditing({ ...EMPTY_BATCH, region: defaultRegion ?? "" });
    setOpen(true);
  };

  const act = async (id: string, action: "close" | "cancel" | "reopen") => {
    try {
      await close({ data: { batch_id: id, action } });
      toast.success(`Batch ${action}d`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  if (!hatcheryId) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground">
          Set up a hatchery first.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-5 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-[24px] font-extrabold tracking-tight">Batches</h1>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Each batch represents one hatch cycle that buyers can reserve from.
            </p>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button onClick={startCreate} className="rounded-xl">
                <Plus className="h-4 w-4" /> New batch
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>{editing?.id ? "Edit batch" : "New batch"}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                {editing ? (
                  <BatchForm
                    hatcheryId={hatcheryId}
                    defaultRegion={defaultRegion}
                    initial={editing}
                    onDone={() => {
                      setOpen(false);
                      setEditing(null);
                      void load();
                    }}
                  />
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {rows.length === 0 ? (
          <div className="mt-6 rounded-2xl border-[1.5px] border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No batches yet. Create your first hatch cycle to start accepting reservations.
            </p>
            <Button onClick={startCreate} className="mt-4 rounded-xl">
              <Plus className="h-4 w-4" /> Create first batch
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {rows.map((r) => (
              <article key={r.id} className="rounded-2xl border-[1.5px] border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display truncate text-[15.5px] font-extrabold tracking-tight">
                      {r.batch_type}
                      {r.breed ? <span className="text-muted-foreground"> · {r.breed}</span> : null}
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(r.pickup_start_date).toLocaleDateString()} –{" "}
                      {new Date(r.pickup_end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <BatchStatusPill status={r.status} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => startEdit(r)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/dashboard/hatchery/batches/$batchId"
                            params={{ batchId: r.id }}
                          >
                            View reservations
                          </Link>
                        </DropdownMenuItem>
                        {r.status === "open" && (
                          <DropdownMenuItem onClick={() => act(r.id, "close")}>
                            Close batch
                          </DropdownMenuItem>
                        )}
                        {(r.status === "closed" || r.status === "cancelled") && (
                          <DropdownMenuItem onClick={() => act(r.id, "reopen")}>
                            Reopen batch
                          </DropdownMenuItem>
                        )}
                        {r.status !== "cancelled" && (
                          <DropdownMenuItem
                            onClick={() => act(r.id, "cancel")}
                            className="text-destructive focus:text-destructive"
                          >
                            Cancel batch
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[18px] font-bold leading-none">
                      {formatGhs(r.price_per_unit)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      per {r.unit_label} · min {r.min_order_qty.toLocaleString()}
                    </p>
                  </div>
                </div>
                <BatchProgressBar
                  reserved={r.reserved_quantity}
                  total={r.total_quantity}
                  className="mt-3"
                />
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
