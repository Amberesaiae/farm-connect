import { useState, type FormEvent } from "react";
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
import { GHANA_REGIONS } from "@/lib/constants";
import { useServerFn } from "@tanstack/react-start";
import { createServiceRequest } from "@/server/service-requests.functions";
import { newIdempotencyKey } from "@/lib/idempotency";
import { toast } from "sonner";

interface Props {
  serviceProfileId: string;
  defaultServiceType?: string;
  onDone: () => void;
}

export function QuoteRequestForm({ serviceProfileId, defaultServiceType, onDone }: Props) {
  const create = useServerFn(createServiceRequest);
  const [busy, setBusy] = useState(false);
  const [v, setV] = useState({
    service_type: defaultServiceType ?? "",
    region: "",
    district: "",
    preferred_date: "",
    preferred_window: "",
    budget_min: "",
    budget_max: "",
    notes: "",
    contact: "",
  });

  const update = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!v.service_type.trim()) return toast.error("Tell the provider what you need");
    if (!v.region) return toast.error("Region is required");
    if (!v.notes.trim()) return toast.error("Add a short note about the job");
    setBusy(true);
    try {
      await create({
        data: {
          service_profile_id: serviceProfileId,
          service_type: v.service_type.trim(),
          region: v.region,
          district: v.district.trim() || null,
          preferred_date: v.preferred_date || null,
          preferred_window: v.preferred_window || null,
          budget_min_ghs: v.budget_min ? Number(v.budget_min) : null,
          budget_max_ghs: v.budget_max ? Number(v.budget_max) : null,
          notes: v.notes.trim(),
          buyer_contact: v.contact.trim() || null,
          idempotency_key: newIdempotencyKey(),
        },
      });
      toast.success("Quote request sent");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="stype">What service do you need? *</Label>
        <Input
          id="stype"
          value={v.service_type}
          onChange={(e) => update("service_type", e.target.value)}
          placeholder="e.g. Vaccination of 200 layers"
          maxLength={60}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Region *</Label>
          <Select value={v.region} onValueChange={(val) => update("region", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose region" />
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
        <div>
          <Label htmlFor="dist">District / town</Label>
          <Input
            id="dist"
            value={v.district}
            onChange={(e) => update("district", e.target.value)}
            maxLength={60}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="pdate">Preferred date</Label>
          <Input
            id="pdate"
            type="date"
            value={v.preferred_date}
            onChange={(e) => update("preferred_date", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pwin">Preferred window</Label>
          <Select
            value={v.preferred_window || undefined}
            onValueChange={(val) => update("preferred_window", val)}
          >
            <SelectTrigger id="pwin">
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="bmin">Budget min (GH₵)</Label>
          <Input
            id="bmin"
            type="number"
            min={0}
            value={v.budget_min}
            onChange={(e) => update("budget_min", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bmax">Budget max (GH₵)</Label>
          <Input
            id="bmax"
            type="number"
            min={0}
            value={v.budget_max}
            onChange={(e) => update("budget_max", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="nts">Job details *</Label>
        <Textarea
          id="nts"
          rows={4}
          maxLength={1500}
          value={v.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="What animals, what symptoms / supplies / volume, access notes…"
          required
        />
      </div>
      <div>
        <Label htmlFor="cnt">Phone for fast response</Label>
        <Input
          id="cnt"
          value={v.contact}
          onChange={(e) => update("contact", e.target.value)}
          placeholder="+233..."
          maxLength={50}
        />
      </div>
      <Button type="submit" disabled={busy} className="w-full rounded-xl">
        {busy ? "Sending…" : "Send quote request"}
      </Button>
    </form>
  );
}
