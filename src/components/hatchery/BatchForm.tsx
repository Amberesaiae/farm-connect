import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GHANA_REGIONS } from "@/lib/constants";
import { useServerFn } from "@tanstack/react-start";
import { upsertBatch } from "@/server/hatchery-batches.functions";
import { toast } from "sonner";

export interface BatchFormValue {
  id?: string;
  batch_type: string;
  breed: string;
  hatch_date: string;
  pickup_start_date: string;
  pickup_end_date: string;
  total_quantity: number | string;
  min_order_qty: number | string;
  price_per_unit: number | string;
  unit_label: string;
  region: string;
  allows_pickup: boolean;
  allows_delivery: boolean;
  notes: string;
  status: "draft" | "open" | "full" | "closed" | "cancelled";
}

export const EMPTY_BATCH: BatchFormValue = {
  batch_type: "",
  breed: "",
  hatch_date: "",
  pickup_start_date: "",
  pickup_end_date: "",
  total_quantity: "",
  min_order_qty: 1,
  price_per_unit: "",
  unit_label: "chick",
  region: "",
  allows_pickup: true,
  allows_delivery: false,
  notes: "",
  status: "open",
};

export function BatchForm({
  hatcheryId,
  defaultRegion,
  initial,
  onDone,
}: {
  hatcheryId: string;
  defaultRegion?: string | null;
  initial?: BatchFormValue;
  onDone: () => void;
}) {
  const [v, setV] = useState<BatchFormValue>(
    initial ?? { ...EMPTY_BATCH, region: defaultRegion ?? "" },
  );
  const [busy, setBusy] = useState(false);
  const upsert = useServerFn(upsertBatch);

  const update = <K extends keyof BatchFormValue>(k: K, val: BatchFormValue[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!v.batch_type.trim()) return toast.error("Batch type is required");
    if (!v.pickup_start_date || !v.pickup_end_date) return toast.error("Pick the ready window");
    if (Number(v.total_quantity) < 1) return toast.error("Total quantity must be ≥ 1");
    if (Number(v.price_per_unit) <= 0) return toast.error("Price must be > 0");
    if (!v.region) return toast.error("Region is required");
    setBusy(true);
    try {
      await upsert({
        data: {
          id: v.id,
          hatchery_id: hatcheryId,
          batch_type: v.batch_type.trim(),
          breed: v.breed.trim() || null,
          hatch_date: v.hatch_date || null,
          pickup_start_date: v.pickup_start_date,
          pickup_end_date: v.pickup_end_date,
          total_quantity: Number(v.total_quantity),
          min_order_qty: Number(v.min_order_qty) || 1,
          price_per_unit: Number(v.price_per_unit),
          unit_label: v.unit_label.trim() || "chick",
          region: v.region,
          allows_pickup: v.allows_pickup,
          allows_delivery: v.allows_delivery,
          notes: v.notes.trim() || null,
          status: v.status,
        },
      });
      toast.success(v.id ? "Batch updated" : "Batch created");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="batch_type">Batch type *</Label>
          <Input
            id="batch_type"
            value={v.batch_type}
            onChange={(e) => update("batch_type", e.target.value)}
            placeholder="e.g. Layer day-olds"
            required
          />
        </div>
        <div>
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            value={v.breed}
            onChange={(e) => update("breed", e.target.value)}
            placeholder="e.g. Lohmann Brown"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="hatch_date">Hatch date</Label>
          <Input
            id="hatch_date"
            type="date"
            value={v.hatch_date}
            onChange={(e) => update("hatch_date", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pickup_start_date">Ready from *</Label>
          <Input
            id="pickup_start_date"
            type="date"
            value={v.pickup_start_date}
            onChange={(e) => update("pickup_start_date", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="pickup_end_date">Ready until *</Label>
          <Input
            id="pickup_end_date"
            type="date"
            value={v.pickup_end_date}
            onChange={(e) => update("pickup_end_date", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <Label htmlFor="total_quantity">Total qty *</Label>
          <Input
            id="total_quantity"
            type="number"
            min={1}
            value={v.total_quantity}
            onChange={(e) => update("total_quantity", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="min_order_qty">Min order</Label>
          <Input
            id="min_order_qty"
            type="number"
            min={1}
            value={v.min_order_qty}
            onChange={(e) => update("min_order_qty", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="price_per_unit">Price (GH₵) *</Label>
          <Input
            id="price_per_unit"
            type="number"
            min={0}
            step="0.01"
            value={v.price_per_unit}
            onChange={(e) => update("price_per_unit", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="unit_label">Unit label</Label>
          <Input
            id="unit_label"
            value={v.unit_label}
            onChange={(e) => update("unit_label", e.target.value)}
            placeholder="chick"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="region">Region *</Label>
        <Select value={v.region} onValueChange={(val) => update("region", val)}>
          <SelectTrigger id="region">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {GHANA_REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center justify-between gap-3 rounded-xl border-[1.5px] border-border bg-card p-3 text-[13px] font-medium">
          Allows pickup
          <Switch
            checked={v.allows_pickup}
            onCheckedChange={(c) => update("allows_pickup", c)}
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-xl border-[1.5px] border-border bg-card p-3 text-[13px] font-medium">
          Offers delivery
          <Switch
            checked={v.allows_delivery}
            onCheckedChange={(c) => update("allows_delivery", c)}
          />
        </label>
      </div>

      <div>
        <Label htmlFor="notes">Notes for buyers</Label>
        <Textarea
          id="notes"
          rows={3}
          maxLength={1000}
          value={v.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Vaccination schedule, feeding, transport notes…"
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={v.status}
          onValueChange={(val) => update("status", val as BatchFormValue["status"])}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft (hidden)</SelectItem>
            <SelectItem value="open">Open for reservations</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={busy} className="w-full rounded-xl">
        {busy ? "Saving…" : v.id ? "Update batch" : "Create batch"}
      </Button>
    </form>
  );
}
