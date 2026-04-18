import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { WizardProgress } from "@/components/wizard/WizardProgress";
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
import { GHANA_REGIONS, LIVESTOCK_CATEGORIES, PRICE_UNITS, SEX_OPTIONS, LISTING_PHOTOS_BUCKET } from "@/lib/constants";
import { useServerFn } from "@tanstack/react-start";
import { createListing } from "@/server/listings.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { listingPhotoUrl } from "@/lib/photo-url";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/post")({
  head: () => ({
    meta: [
      { title: "Post a listing — Farmlink" },
      { name: "description", content: "List your livestock for sale on Farmlink." },
    ],
  }),
  component: PostWizard,
});

const step1 = z.object({
  category: z.string().min(1, "Pick a category"),
  title: z.string().trim().min(3, "Title is too short").max(120),
  breed: z.string().max(60).optional(),
  age_months: z.coerce.number().int().min(0).max(600).optional(),
  sex: z.enum(["male", "female", "mixed"]).optional(),
  quantity: z.coerce.number().int().min(1).max(10000),
});
const step2 = z.object({
  weight_kg: z.coerce.number().positive().max(5000).optional(),
  price_ghs: z.coerce.number().positive().max(10_000_000),
  price_unit: z.enum(["per_head", "per_kg", "per_lb", "lot"]),
  region: z.string().min(1, "Region is required"),
  district: z.string().max(60).optional(),
});
const step3 = z.object({
  description: z.string().max(2000).optional(),
});

function PostWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const create = useServerFn(createListing);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  const [data, setData] = useState({
    category: "",
    title: "",
    breed: "",
    age_months: "" as string | number,
    sex: "" as "" | "male" | "female" | "mixed",
    quantity: 1 as number | string,
    weight_kg: "" as string | number,
    price_ghs: "" as string | number,
    price_unit: "per_head" as "per_head" | "per_kg" | "per_lb" | "lot",
    region: "",
    district: "",
    description: "",
  });

  // Photos held locally until listing is created (then uploaded under listingId/)
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const previews = photos.map((f) => URL.createObjectURL(f));
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const update = (k: keyof typeof data, v: string | number) =>
    setData((d) => ({ ...d, [k]: v }));

  const next = () => {
    if (step === 1) {
      const r = step1.safeParse(data);
      if (!r.success) return toast.error(r.error.issues[0].message);
    } else if (step === 2) {
      const r = step2.safeParse(data);
      if (!r.success) return toast.error(r.error.issues[0].message);
    }
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos((p) => [...p, ...files].slice(0, 8));
    if (fileRef.current) fileRef.current.value = "";
  };
  const removePhoto = (i: number) =>
    setPhotos((p) => p.filter((_, idx) => idx !== i));

  const submit = async () => {
    const r3 = step3.safeParse(data);
    if (!r3.success) return toast.error(r3.error.issues[0].message);
    if (!user) return toast.error("You must be signed in");
    if (photos.length === 0) return toast.error("Please add at least one photo");

    setBusy(true);
    try {
      const created = await create({
        data: {
          title: data.title.trim(),
          category: data.category,
          breed: data.breed || null,
          age_months: data.age_months === "" ? null : Number(data.age_months),
          sex: data.sex || null,
          quantity: Number(data.quantity) || 1,
          weight_kg: data.weight_kg === "" ? null : Number(data.weight_kg),
          price_ghs: Number(data.price_ghs),
          price_unit: data.price_unit,
          region: data.region,
          district: data.district || null,
          description: data.description || null,
        },
      });

      // Upload photos under {listingId}/...
      for (let i = 0; i < photos.length; i++) {
        const f = photos[i];
        const ext = f.name.split(".").pop() || "jpg";
        const path = `${created.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(LISTING_PHOTOS_BUCKET)
          .upload(path, f, { upsert: false, contentType: f.type });
        if (upErr) {
          console.error(upErr);
          toast.error(`Photo ${i + 1} failed: ${upErr.message}`);
          continue;
        }
        await supabase.from("listing_photos").insert({
          listing_id: created.id,
          storage_path: path,
          display_order: i,
          is_cover: i === 0,
        });
      }

      toast.success("Listing posted!");
      navigate({ to: "/listings/$id", params: { id: created.id } });
    } catch (err) {
      const m = err instanceof Error ? err.message : "Failed to create listing";
      toast.error(m);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Post a listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          It only takes a minute. Your listing is live for 60 days.
        </p>

        <div className="mt-5">
          <WizardProgress step={step} total={3} />
        </div>

        <div className="mt-6 space-y-4 rounded-2xl border border-border bg-background p-5">
          {step === 1 && (
            <>
              <div>
                <Label>Category *</Label>
                <Select value={data.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIVESTOCK_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="2 healthy Sanga bulls, 18 months"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={data.breed}
                    onChange={(e) => update("breed", e.target.value)}
                    placeholder="Sanga, Boer, Sokoto…"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age (months)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={data.age_months}
                    onChange={(e) => update("age_months", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sex</Label>
                  <Select
                    value={data.sex || "unset"}
                    onValueChange={(v) => update("sex", v === "unset" ? "" : v)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unset">—</SelectItem>
                      {SEX_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="qty">Quantity *</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    value={data.quantity}
                    onChange={(e) => update("quantity", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={data.weight_kg}
                    onChange={(e) => update("weight_kg", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (GH₵) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={data.price_ghs}
                    onChange={(e) => update("price_ghs", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Price unit *</Label>
                <Select
                  value={data.price_unit}
                  onValueChange={(v) =>
                    update("price_unit", v as typeof data.price_unit)
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_UNITS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Region *</Label>
                <Select value={data.region} onValueChange={(v) => update("region", v)}>
                  <SelectTrigger className="mt-1 w-full">
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
                <Label htmlFor="district">District / town</Label>
                <Input
                  id="district"
                  value={data.district}
                  onChange={(e) => update("district", e.target.value)}
                  className="mt-1"
                  placeholder="Tamale, Kumasi…"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <Label>Photos * <span className="text-xs text-muted-foreground font-normal">(first photo becomes the cover)</span></Label>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {previews.map((src, i) => (
                    <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-surface">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90"
                        aria-label="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 8 && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:bg-surface"
                    >
                      <ImagePlus className="h-6 w-6" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={onPick}
                />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  rows={5}
                  value={data.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Health status, feeding, vaccination, willingness to deliver…"
                  className="mt-1"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={back} disabled={step === 1 || busy}>
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={next}>Continue</Button>
            ) : (
              <Button onClick={submit} disabled={busy}>
                {busy ? "Posting…" : "Post listing"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
