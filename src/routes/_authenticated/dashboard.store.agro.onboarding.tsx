import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Stepper } from "@/components/wizard/Stepper";
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
import { AGRO_PILLAR_OPTIONS, type AgroPillar } from "@/lib/agro-store-status";
import { LicenceUploadField } from "@/components/store/LicenceUploadField";
import { useServerFn } from "@tanstack/react-start";
import { submitAgroStoreApplication } from "@/server/agro-stores.functions";
import { toast } from "sonner";
import { Store, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/store/agro/onboarding")({
  head: () => ({ meta: [{ title: "Open a shop — farmlink" }] }),
  component: AgroOnboardingWizard,
});

const STEPS = ["Business", "Location & delivery", "Commerce", "Compliance"];

interface FormState {
  business_name: string;
  pillar: AgroPillar | "";
  blurb: string;
  region: string;
  district: string;
  address: string;
  whatsapp: string;
  phone: string;
  email: string;
  delivers: boolean;
  delivery_regions: string[];
  min_order_ghs: string;
  business_reg: string;
  vsd_licence: string;
  licence_doc_path: string | null;
}

const EMPTY: FormState = {
  business_name: "",
  pillar: "",
  blurb: "",
  region: "",
  district: "",
  address: "",
  whatsapp: "",
  phone: "",
  email: "",
  delivers: false,
  delivery_regions: [],
  min_order_ghs: "",
  business_reg: "",
  vsd_licence: "",
  licence_doc_path: null,
};

function AgroOnboardingWizard() {
  const navigate = useNavigate();
  const submit = useServerFn(submitAgroStoreApplication);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [v, setV] = useState<FormState>(EMPTY);
  const update = <K extends keyof FormState>(k: K, val: FormState[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const next = () => {
    if (step === 1) {
      if (v.business_name.trim().length < 2) return toast.error("Business name is required");
      if (!v.pillar) return toast.error("Pick what you sell");
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
          business_name: v.business_name.trim(),
          pillar: v.pillar as AgroPillar,
          blurb: v.blurb.trim() || null,
          region: v.region,
          district: v.district.trim() || null,
          address: v.address.trim() || null,
          whatsapp_e164: v.whatsapp.trim() || null,
          phone_e164: v.phone.trim() || null,
          email: v.email.trim() || null,
          delivers: v.delivers,
          delivery_regions: v.delivery_regions,
          min_order_ghs: v.min_order_ghs ? Number(v.min_order_ghs) : null,
          business_reg_number: v.business_reg.trim() || null,
          vsd_licence_number: v.vsd_licence.trim() || null,
          licence_doc_path: v.licence_doc_path,
          cover_path: null,
          logo_path: null,
        },
      });
      toast.success("Shop submitted — admin review within 1–2 days.");
      navigate({ to: "/dashboard/store" });
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
          <Store className="h-5 w-5" strokeWidth={1.7} />
          <span className="text-[12px] font-bold uppercase tracking-wider">Open a shop</span>
        </div>
        <h1 className="font-display mt-2 text-[28px] font-extrabold tracking-tight">
          Set up your storefront
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          For feed dealers, agromed pharmacies and equipment shops. Once approved your existing listings auto-link to the shop.
        </p>

        <div className="mt-6"><Stepper step={step} steps={STEPS} /></div>

        <div className="mt-6 space-y-4">
          {step === 1 && (
            <section className="rounded-2xl border-[1.5px] border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-extrabold tracking-tight">Business basics</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="bn">Business name *</Label>
                  <Input id="bn" value={v.business_name} onChange={(e) => update("business_name", e.target.value)} className="mt-1.5 rounded-xl" maxLength={120} />
                </div>
                <div>
                  <Label>What do you sell? *</Label>
                  <Select value={v.pillar || undefined} onValueChange={(val) => update("pillar", val as AgroPillar)}>
                    <SelectTrigger className="mt-1.5 w-full rounded-xl"><SelectValue placeholder="Pick a pillar" /></SelectTrigger>
                    <SelectContent>
                      {AGRO_PILLAR_OPTIONS.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="blurb">About your shop</Label>
                  <Textarea id="blurb" rows={4} maxLength={800} value={v.blurb} onChange={(e) => update("blurb", e.target.value)} className="mt-1.5 rounded-xl" placeholder="Brands you stock, years in business, specialties…" />
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-2xl border-[1.5px] border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-extrabold tracking-tight">Location & delivery</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Region *</Label>
                  <Select value={v.region} onValueChange={(val) => update("region", val)}>
                    <SelectTrigger className="mt-1.5 w-full rounded-xl"><SelectValue placeholder="Choose region" /></SelectTrigger>
                    <SelectContent>
                      {GHANA_REGIONS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="district">District / town</Label>
                    <Input id="district" value={v.district} onChange={(e) => update("district", e.target.value)} className="mt-1.5 rounded-xl" maxLength={60} />
                  </div>
                  <div>
                    <Label htmlFor="address">Shop address</Label>
                    <Input id="address" value={v.address} onChange={(e) => update("address", e.target.value)} className="mt-1.5 rounded-xl" maxLength={200} />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
                  <div>
                    <Label htmlFor="del">Offer delivery?</Label>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">Buyers in your delivery regions see a "Delivers" badge.</p>
                  </div>
                  <Switch id="del" checked={v.delivers} onCheckedChange={(c) => update("delivers", c)} />
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="rounded-2xl border-[1.5px] border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-extrabold tracking-tight">Commerce settings</h2>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="wa">WhatsApp</Label>
                    <Input id="wa" value={v.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+233..." className="mt-1.5 rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="ph">Phone</Label>
                    <Input id="ph" value={v.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+233..." className="mt-1.5 rounded-xl" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="em">Email</Label>
                    <Input id="em" type="email" value={v.email} onChange={(e) => update("email", e.target.value)} className="mt-1.5 rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="mo">Min. order (GHS)</Label>
                    <Input id="mo" type="number" min={0} value={v.min_order_ghs} onChange={(e) => update("min_order_ghs", e.target.value)} className="mt-1.5 rounded-xl" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="rounded-2xl border-[1.5px] border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.7} />
                <div>
                  <h2 className="font-display text-[15px] font-extrabold tracking-tight">Compliance</h2>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    Optional but strongly recommended. Agromed pharmacies should provide a VSD licence. Reviewed manually by Farmlink.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="br">Business registration #</Label>
                    <Input id="br" value={v.business_reg} onChange={(e) => update("business_reg", e.target.value)} className="mt-1.5 rounded-xl" maxLength={80} />
                  </div>
                  <div>
                    <Label htmlFor="vl">VSD licence #</Label>
                    <Input id="vl" value={v.vsd_licence} onChange={(e) => update("vsd_licence", e.target.value)} className="mt-1.5 rounded-xl" maxLength={80} />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block">Licence document</Label>
                  <LicenceUploadField value={v.licence_doc_path} onChange={(p) => update("licence_doc_path", p)} />
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="fixed inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur" style={{ bottom: "calc(env(safe-area-inset-bottom) + 66px)" }}>
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <Button variant="ghost" onClick={back} disabled={step === 1 || busy} className="rounded-xl">Back</Button>
            {step < 4 ? (
              <Button onClick={next} className="flex-1 rounded-xl font-semibold sm:flex-none sm:px-8">Continue</Button>
            ) : (
              <Button onClick={finish} disabled={busy} className="flex-1 rounded-xl font-semibold sm:flex-none sm:px-8">{busy ? "Submitting…" : "Submit shop"}</Button>
            )}
          </div>
        </div>
        <style>{`@media (min-width: 768px) { .fixed.inset-x-0.z-30 { bottom: 0 !important; } }`}</style>
      </div>
    </AppShell>
  );
}
