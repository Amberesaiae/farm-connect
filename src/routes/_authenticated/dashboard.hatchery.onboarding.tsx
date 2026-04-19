import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Stepper } from "@/components/wizard/Stepper";
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
import { HATCHERY_CATEGORIES, PERMIT_AUTHORITIES } from "@/lib/categories";
import { PermitUploadField } from "@/components/hatchery/PermitUploadField";
import { useServerFn } from "@tanstack/react-start";
import { submitHatcheryApplication } from "@/server/hatcheries.functions";
import { toast } from "sonner";
import { Egg, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/hatchery/onboarding")({
  head: () => ({ meta: [{ title: "Hatchery onboarding — farmlink" }] }),
  component: OnboardingWizard,
});

const STEPS = ["Business", "Location & capacity", "Permit", "Review"];

interface FormState {
  name: string;
  category: "poultry" | "fish" | "breeding" | "";
  blurb: string;
  region: string;
  district: string;
  address: string;
  capacity: string;
  whatsapp: string;
  permit_number: string;
  permit_authority: string;
  permit_doc_path: string | null;
}

const EMPTY: FormState = {
  name: "",
  category: "",
  blurb: "",
  region: "",
  district: "",
  address: "",
  capacity: "",
  whatsapp: "",
  permit_number: "",
  permit_authority: "",
  permit_doc_path: null,
};

function OnboardingWizard() {
  const navigate = useNavigate();
  const submit = useServerFn(submitHatcheryApplication);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [v, setV] = useState<FormState>(EMPTY);

  const update = <K extends keyof FormState>(k: K, val: FormState[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const next = () => {
    if (step === 1) {
      if (v.name.trim().length < 2) return toast.error("Business name is required");
      if (!v.category) return toast.error("Pick a hatchery category");
    } else if (step === 2) {
      if (!v.region) return toast.error("Region is required");
    }
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const finish = async () => {
    setBusy(true);
    try {
      await submit({
        data: {
          name: v.name.trim(),
          category: v.category as "poultry" | "fish" | "breeding",
          region: v.region,
          district: v.district.trim() || null,
          address: v.address.trim() || null,
          blurb: v.blurb.trim() || null,
          capacity_per_cycle: v.capacity ? Number(v.capacity) : null,
          whatsapp_e164: v.whatsapp.trim() || null,
          permit_number: v.permit_number.trim() || null,
          permit_authority: (v.permit_authority || null) as
            | "vsd"
            | "fisheries_commission"
            | "epa"
            | "district_assembly"
            | "other"
            | null,
          permit_doc_path: v.permit_doc_path,
          cover_path: null,
        },
      });
      toast.success("Application submitted — admin will review shortly.");
      navigate({ to: "/dashboard/hatchery" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 pb-32 pt-5 md:pb-12 md:pt-8">
        <div className="flex items-center gap-2 text-primary">
          <Egg className="h-5 w-5" strokeWidth={1.7} />
          <span className="text-[12px] font-bold uppercase tracking-wider">Hatchery onboarding</span>
        </div>
        <h1 className="font-display mt-2 text-[28px] font-extrabold tracking-tight">
          List your hatchery on Farmlink
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          A Farmlink admin reviews each application within 1–2 business days. You can prepare batches as soon as you submit.
        </p>

        <div className="mt-6">
          <Stepper step={step} steps={STEPS} />
        </div>

        <div className="mt-6 space-y-4">
          {step === 1 && (
            <section className="rounded-2xl border-[1.5px] border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-extrabold tracking-tight">Business basics</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="name">Hatchery / business name *</Label>
                  <Input
                    id="name"
                    value={v.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Greenhill Poultry Hatchery"
                    className="mt-1.5 rounded-xl"
                    maxLength={120}
                  />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={v.category || undefined}
                    onValueChange={(val) => update("category", val as FormState["category"])}
                  >
                    <SelectTrigger className="mt-1.5 w-full rounded-xl">
                      <SelectValue placeholder="Pick what you produce" />
                    </SelectTrigger>
                    <SelectContent>
                      {HATCHERY_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="blurb">About your hatchery</Label>
                  <Textarea
                    id="blurb"
                    rows={4}
                    maxLength={800}
                    value={v.blurb}
                    onChange={(e) => update("blurb", e.target.value)}
                    placeholder="Years of operation, breeds you specialise in, vaccination programme…"
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp (fallback)</Label>
                  <Input
                    id="whatsapp"
                    value={v.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    placeholder="+233..."
                    className="mt-1.5 rounded-xl"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Buyers reserve through Farmlink. WhatsApp is only used if a reservation needs urgent follow-up.
                  </p>
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-2xl border-[1.5px] border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-extrabold tracking-tight">Location & capacity</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Region *</Label>
                  <Select value={v.region} onValueChange={(val) => update("region", val)}>
                    <SelectTrigger className="mt-1.5 w-full rounded-xl">
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="district">District / town</Label>
                    <Input
                      id="district"
                      value={v.district}
                      onChange={(e) => update("district", e.target.value)}
                      className="mt-1.5 rounded-xl"
                      maxLength={60}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity per cycle</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min={0}
                      value={v.capacity}
                      onChange={(e) => update("capacity", e.target.value)}
                      placeholder="e.g. 5000"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Pickup address</Label>
                  <Textarea
                    id="address"
                    rows={2}
                    maxLength={200}
                    value={v.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="GPS code or landmark for buyer pickups"
                    className="mt-1.5 rounded-xl"
                  />
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="rounded-2xl border-[1.5px] border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.7} />
                <div>
                  <h2 className="font-display text-[15px] font-extrabold tracking-tight">Permit & compliance</h2>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    Optional for now — Farmlink will manually review whatever you provide. Hatcheries with a permit on file get a verified badge.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Permit authority</Label>
                    <Select
                      value={v.permit_authority || undefined}
                      onValueChange={(val) => update("permit_authority", val)}
                    >
                      <SelectTrigger className="mt-1.5 w-full rounded-xl">
                        <SelectValue placeholder="Select authority" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERMIT_AUTHORITIES.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pn">Permit number</Label>
                    <Input
                      id="pn"
                      value={v.permit_number}
                      onChange={(e) => update("permit_number", e.target.value)}
                      className="mt-1.5 rounded-xl"
                      maxLength={80}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block">Permit document</Label>
                  <PermitUploadField
                    value={v.permit_doc_path}
                    onChange={(p) => update("permit_doc_path", p)}
                  />
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="rounded-2xl border-[1.5px] border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-extrabold tracking-tight">Review & submit</h2>
              <dl className="mt-4 space-y-3 text-[13.5px]">
                <Row label="Name" value={v.name} />
                <Row label="Category" value={v.category} />
                <Row label="Region" value={v.region + (v.district ? ` · ${v.district}` : "")} />
                <Row label="Capacity" value={v.capacity ? `${Number(v.capacity).toLocaleString()} per cycle` : "—"} />
                <Row label="Permit" value={v.permit_number || (v.permit_doc_path ? "Document uploaded" : "Not provided")} />
              </dl>
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-[12px] text-amber-900">
                MVP note: Permit review is currently manual. Automated registry checks against VSD, Fisheries Commission and EPA records are on the roadmap — see <code>docs/hatchery-compliance.md</code>.
              </p>
            </section>
          )}
        </div>

        <div
          className="fixed inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 66px)" }}
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <Button variant="ghost" onClick={back} disabled={step === 1 || busy} className="rounded-xl">
              Back
            </Button>
            {step < 4 ? (
              <Button onClick={next} className="flex-1 rounded-xl font-semibold sm:flex-none sm:px-8">
                Continue
              </Button>
            ) : (
              <Button onClick={finish} disabled={busy} className="flex-1 rounded-xl font-semibold sm:flex-none sm:px-8">
                {busy ? "Submitting…" : "Submit application"}
              </Button>
            )}
          </div>
        </div>
        <style>{`@media (min-width: 768px) { .fixed.inset-x-0.z-30 { bottom: 0 !important; } }`}</style>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
      <dt className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-foreground">{value || "—"}</dd>
    </div>
  );
}
