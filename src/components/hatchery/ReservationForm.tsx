import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerFn } from "@tanstack/react-start";
import { createReservation } from "@/server/reservations.functions";
import { newIdempotencyKey } from "@/lib/idempotency";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { formatGhs } from "@/lib/format";

export interface ReservationFormBatch {
  id: string;
  min_order_qty: number;
  total_quantity: number;
  reserved_quantity: number;
  price_per_unit: number | string;
  unit_label: string;
  pickup_start_date: string;
  pickup_end_date: string;
  allows_pickup: boolean;
  allows_delivery: boolean;
}

export function ReservationForm({ batch }: { batch: ReservationFormBatch }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const create = useServerFn(createReservation);
  const left = Math.max(0, batch.total_quantity - batch.reserved_quantity);

  const [qty, setQty] = useState<number | string>(batch.min_order_qty);
  const [pickupDate, setPickupDate] = useState<string>(batch.pickup_start_date);
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">(
    batch.allows_pickup ? "pickup" : "delivery",
  );
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const total = Number(qty || 0) * Number(batch.price_per_unit);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: window.location.pathname } as never });
      return;
    }
    const n = Number(qty);
    if (!n || n < batch.min_order_qty) return toast.error(`Minimum is ${batch.min_order_qty}`);
    if (n > left) return toast.error(`Only ${left} units left`);
    if (fulfilment === "delivery" && !address.trim()) return toast.error("Add a delivery address");
    setBusy(true);
    try {
      await create({
        data: {
          batch_id: batch.id,
          requested_qty: n,
          pickup_date: pickupDate || null,
          fulfilment,
          delivery_address: fulfilment === "delivery" ? address.trim() : null,
          buyer_contact: contact.trim() || null,
          buyer_note: note.trim() || null,
          idempotency_key: newIdempotencyKey(),
        },
      });
      toast.success("Reservation submitted — the hatchery will confirm shortly");
      navigate({ to: "/dashboard/reservations" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reserve");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border-[1.5px] border-border bg-card p-5"
    >
      <div>
        <h3 className="font-display text-[18px] font-extrabold tracking-tight">
          Reserve from this batch
        </h3>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          {left.toLocaleString()} {batch.unit_label}s left · min order{" "}
          {batch.min_order_qty.toLocaleString()}
        </p>
      </div>

      <div>
        <Label htmlFor="qty">Quantity *</Label>
        <Input
          id="qty"
          type="number"
          min={batch.min_order_qty}
          max={left}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          required
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Subtotal:{" "}
          <span className="font-mono font-semibold text-foreground">{formatGhs(total)}</span>
        </p>
      </div>

      <div>
        <Label htmlFor="fulfilment">Fulfilment</Label>
        <Select value={fulfilment} onValueChange={(v) => setFulfilment(v as "pickup" | "delivery")}>
          <SelectTrigger id="fulfilment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {batch.allows_pickup ? <SelectItem value="pickup">Pickup at hatchery</SelectItem> : null}
            {batch.allows_delivery ? <SelectItem value="delivery">Delivery</SelectItem> : null}
          </SelectContent>
        </Select>
      </div>

      {fulfilment === "delivery" ? (
        <div>
          <Label htmlFor="address">Delivery address *</Label>
          <Textarea
            id="address"
            rows={2}
            maxLength={300}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      ) : null}

      <div>
        <Label htmlFor="pickup_date">Preferred {fulfilment === "pickup" ? "pickup" : "delivery"} date</Label>
        <Input
          id="pickup_date"
          type="date"
          min={batch.pickup_start_date}
          max={batch.pickup_end_date}
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="contact">Phone (WhatsApp)</Label>
        <Input
          id="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="0240000000"
        />
      </div>

      <div>
        <Label htmlFor="note">Note for the hatchery</Label>
        <Textarea
          id="note"
          rows={2}
          maxLength={800}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything they should know"
        />
      </div>

      <Button type="submit" disabled={busy || left === 0} className="w-full rounded-xl">
        {left === 0 ? "Sold out" : busy ? "Submitting…" : "Submit reservation"}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        No payment now — the hatchery confirms availability first.
      </p>
    </form>
  );
}
