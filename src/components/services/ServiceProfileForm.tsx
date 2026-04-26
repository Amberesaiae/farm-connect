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
import { useTaxonomy } from "@/lib/taxonomy-context";
import { useServerFn } from "@tanstack/react-start";
import { upsertServiceProfile } from "@/server/service-profiles.functions";
import { toast } from "sonner";

export interface ServiceProfileFormValue {
  id?: string;
  business_name: string;
  category: string;
  blurb: string;
  coverage_regions: string[];
  pricing_model: string;
  base_rate_ghs: string;
  whatsapp_e164: string;
  email: string;
  is_active: boolean;
}

const EMPTY: ServiceProfileFormValue = {
  business_name: "",
  category: "vet",
  blurb: "",
  coverage_regions: [],
  pricing_model: "from",
  base_rate_ghs: "",
  whatsapp_e164: "",
  email: "",
  is_active: true,
};

export function ServiceProfileForm({
  initial,
  onDone,
}: {
  initial?: ServiceProfileFormValue;
  onDone: () => void;
}) {
  const { taxonomy } = useTaxonomy();
  const serviceCategories = taxonomy.categoriesFor("services");
  const [v, setV] = useState<ServiceProfileFormValue>(initial ?? EMPTY);
  const [busy, setBusy] = useState(false);
  const upsert = useServerFn(upsertServiceProfile);

  const update = <K extends keyof ServiceProfileFormValue>(
    k: K,
    val: ServiceProfileFormValue[K],
  ) => setV((p) => ({ ...p, [k]: val }));

  const toggleRegion = (r: string) => {
    const has = v.coverage_regions.includes(r);
    update(
      "coverage_regions",
      has ? v.coverage_regions.filter((x) => x !== r) : [...v.coverage_regions, r],
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (v.business_name.trim().length < 2) return toast.error("Business name is required");
    setBusy(true);
    try {
      await upsert({
        data: {
          id: v.id,
          business_name: v.business_name.trim(),
          category: v.category,
          blurb: v.blurb.trim() || null,
          coverage_regions: v.coverage_regions,
          coverage_districts: [],
          pricing_model: v.pricing_model || null,
          base_rate_ghs: v.base_rate_ghs ? Number(v.base_rate_ghs) : null,
          whatsapp_e164: v.whatsapp_e164.trim() || null,
          email: v.email.trim() || null,
          cover_path: null,
          is_active: v.is_active,
        },
      });
      toast.success(v.id ? "Profile updated" : "Service profile created");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="bn">Business name *</Label>
        <Input
          id="bn"
          value={v.business_name}
          onChange={(e) => update("business_name", e.target.value)}
          maxLength={120}
          required
        />
      </div>
      <div>
        <Label>Category *</Label>
        <Select value={v.category} onValueChange={(val) => update("category", val)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {serviceCategories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="bb">About your service</Label>
        <Textarea
          id="bb"
          rows={4}
          maxLength={800}
          value={v.blurb}
          onChange={(e) => update("blurb", e.target.value)}
          placeholder="What you offer, years of experience, certifications, response time…"
        />
      </div>
      <div>
        <Label className="mb-2 block">Coverage regions</Label>
        <div className="flex flex-wrap gap-1.5">
          {GHANA_REGIONS.map((r) => {
            const on = v.coverage_regions.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => toggleRegion(r)}
                className={`rounded-full border-[1.5px] px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="rate">Base rate (GH₵)</Label>
          <Input
            id="rate"
            type="number"
            min={0}
            value={v.base_rate_ghs}
            onChange={(e) => update("base_rate_ghs", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pm">Pricing model</Label>
          <Select value={v.pricing_model} onValueChange={(val) => update("pricing_model", val)}>
            <SelectTrigger id="pm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="from">from</SelectItem>
              <SelectItem value="per visit">per visit</SelectItem>
              <SelectItem value="per km">per km</SelectItem>
              <SelectItem value="per kg">per kg</SelectItem>
              <SelectItem value="per head">per head</SelectItem>
              <SelectItem value="per hour">per hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="wa">WhatsApp</Label>
          <Input
            id="wa"
            value={v.whatsapp_e164}
            onChange={(e) => update("whatsapp_e164", e.target.value)}
            placeholder="+233..."
          />
        </div>
        <div>
          <Label htmlFor="em">Email</Label>
          <Input
            id="em"
            type="email"
            value={v.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" disabled={busy} className="w-full rounded-xl">
        {busy ? "Saving…" : v.id ? "Update profile" : "Create service profile"}
      </Button>
    </form>
  );
}
