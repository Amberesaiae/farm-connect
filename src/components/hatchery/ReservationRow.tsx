import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReservationStatusPill } from "./ReservationStatusPill";
import { useServerFn } from "@tanstack/react-start";
import {
  cancelReservation,
  confirmReservation,
  fulfillReservation,
  waitlistReservation,
} from "@/server/reservations.functions";
import { toast } from "sonner";
import { formatRelative } from "@/lib/format";
import type { ReservationStatus } from "@/lib/reservation-status";

export interface ReservationRowData {
  id: string;
  status: ReservationStatus;
  requested_qty: number;
  confirmed_qty: number | null;
  pickup_date: string | null;
  fulfilment: "pickup" | "delivery";
  buyer_contact: string | null;
  buyer_note: string | null;
  delivery_address: string | null;
  created_at: string;
  buyer_display_name?: string | null;
}

export function ReservationRow({
  row,
  onChanged,
}: {
  row: ReservationRowData;
  onChanged: () => void;
}) {
  const confirm = useServerFn(confirmReservation);
  const cancel = useServerFn(cancelReservation);
  const waitlist = useServerFn(waitlistReservation);
  const fulfill = useServerFn(fulfillReservation);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmedQty, setConfirmedQty] = useState<number | string>(row.requested_qty);
  const [busy, setBusy] = useState(false);

  const doConfirm = async () => {
    setBusy(true);
    try {
      await confirm({
        data: { reservation_id: row.id, confirmed_qty: Number(confirmedQty) },
      });
      toast.success("Reservation confirmed");
      setConfirmOpen(false);
      onChanged();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast.error(msg);
      // surface inventory hint if oversold
    } finally {
      setBusy(false);
    }
  };

  const doCancel = async () => {
    setBusy(true);
    try {
      await cancel({ data: { reservation_id: row.id, by_hatchery: true } });
      toast.success("Reservation cancelled");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const doWaitlist = async () => {
    setBusy(true);
    try {
      await waitlist({ data: { reservation_id: row.id } });
      toast.success("Moved to waitlist");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const doFulfill = async () => {
    setBusy(true);
    try {
      await fulfill({ data: { reservation_id: row.id } });
      toast.success("Marked fulfilled");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const showConfirm = row.status === "pending" || row.status === "waitlisted";
  const showWaitlist = row.status === "pending";
  const showFulfill = row.status === "confirmed";
  const showCancel =
    row.status === "pending" || row.status === "confirmed" || row.status === "waitlisted";

  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold text-foreground">
            {row.buyer_display_name ?? "Buyer"} ·{" "}
            <span className="font-mono">{row.requested_qty.toLocaleString()}</span> requested
            {row.confirmed_qty ? (
              <span className="text-muted-foreground">
                {" "}
                · <span className="font-mono">{row.confirmed_qty.toLocaleString()}</span> confirmed
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {row.fulfilment === "pickup" ? "Pickup" : "Delivery"}
            {row.pickup_date ? ` · ${new Date(row.pickup_date).toLocaleDateString()}` : ""} ·{" "}
            {formatRelative(row.created_at)}
          </p>
        </div>
        <ReservationStatusPill status={row.status} />
      </div>

      {row.delivery_address ? (
        <p className="mt-2 text-[12px] text-muted-foreground">📍 {row.delivery_address}</p>
      ) : null}
      {row.buyer_contact ? (
        <p className="mt-1 text-[12px] text-muted-foreground">📞 {row.buyer_contact}</p>
      ) : null}
      {row.buyer_note ? (
        <p className="mt-2 rounded-lg bg-surface p-2 text-[12px] text-foreground/80">
          {row.buyer_note}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {showConfirm && (
          <Button
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
            className="rounded-lg"
          >
            Confirm
          </Button>
        )}
        {showWaitlist && (
          <Button
            size="sm"
            variant="outline"
            onClick={doWaitlist}
            disabled={busy}
            className="rounded-lg"
          >
            Waitlist
          </Button>
        )}
        {showFulfill && (
          <Button
            size="sm"
            variant="outline"
            onClick={doFulfill}
            disabled={busy}
            className="rounded-lg"
          >
            Mark fulfilled
          </Button>
        )}
        {showCancel && (
          <Button
            size="sm"
            variant="ghost"
            onClick={doCancel}
            disabled={busy}
            className="rounded-lg text-destructive hover:text-destructive"
          >
            Cancel
          </Button>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm reservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cqty">Confirmed quantity</Label>
            <Input
              id="cqty"
              type="number"
              min={1}
              value={confirmedQty}
              onChange={(e) => setConfirmedQty(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Buyer requested {row.requested_qty.toLocaleString()}. Adjust if you can only supply
              part of the order.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={doConfirm} disabled={busy}>
              {busy ? "Confirming…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
