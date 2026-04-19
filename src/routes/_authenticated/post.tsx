import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
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
import {
  GHANA_REGIONS,
  PRICE_UNITS,
  LISTING_PHOTOS_BUCKET,
} from "@/lib/constants";
import { TOP_CATEGORIES, type TopCategory } from "@/lib/categories";
import {
  CategoryFieldsSwitcher,
  type CategoryFieldsValue,
} from "@/components/post/CategoryFieldsSwitcher";
import { useServerFn } from "@tanstack/react-start";
import { createListing } from "@/server/listings.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/post")({
  head: () => ({
    meta: [
      { title: "Post a listing — farmlink" },
      { name: "description", content: "List livestock, feed, agromed or equipment for sale on farmlink." },
    ],
  }),
  component: PostWizard,
});

const STEP_LABELS = ["Category & details", "Pricing & location", "Photos & description"];

const step1Base = z.object({
  top_category: z.enum([
    "livestock",
    "agrofeed_supplements",
    "agromed_veterinary",
    "agro_equipment_tools",
  ]),
  title: z.string().trim().min(3, "Title is too short").max(120),
  subcategory_slug: z.string().min(1, "Pick a subcategory"),
  quantity: z.coerce.number().int().min(1).max(10000),
});
const step2 = z.object({
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

  const [topCategory, setTopCategory] = useState<TopCategory>("livestock");
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState<number | string>(1);
  const [catFields, setCatFields] = useState<CategoryFieldsValue>({});
  const [pricing, setPricing] = useState({
    price_ghs: "" as string | number,
    price_unit: "per_head" as "per_head" | "per_kg" | "per_lb" | "lot",
    region: "",
    district: "",
  });
  const [description, setDescription] = useState("");

  const updateCat = (patch: Partial<CategoryFieldsValue>) =>
    setCatFields((p) => ({ ...p, ...patch }));

  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const previews = photos.map((f) => URL.createObjectURL(f));
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  // When top_category changes, reset subcategory + clear category-specific fields
  const onTopCategoryChange = (v: TopCategory) => {
    setTopCategory(v);
    setCatFields({});
    // sensible default price unit per pillar
    setPricing((p) => ({
      ...p,
      price_unit:
        v === "livestock" ? "per_head" : v === "agrofeed_supplements" ? "per_kg" : "lot",
    }));
  };

  const next = () => {
    if (step === 1) {
      const r = step1Base.safeParse({
        top_category: topCategory,
        title,
        subcategory_slug: catFields.subcategory_slug,
        quantity,
      });
      if (!r.success) return toast.error(r.error.issues[0].message);
      // category-specific guard rails (mirrored on the server)
      if (topCategory === "agromed_veterinary" && !catFields.expires_on) {
        return toast.error("Expiry date is required for veterinary medicines.");
      }
      if (topCategory === "agro_equipment_tools" && !catFields.condition) {
        return toast.error("Condition is required for equipment listings.");
      }
    } else if (step === 2) {
      const r = step2.safeParse(pricing);
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
  const removePhoto = (i: number) => setPhotos((p) => p.filter((_, idx) => idx !== i));

  const submit = async () => {
    const r3 = step3.safeParse({ description });
    if (!r3.success) return toast.error(r3.error.issues[0].message);
    if (!user) return toast.error("You must be signed in");
    if (photos.length === 0) return toast.error("Please add at least one photo");

    setBusy(true);
    try {
      // metadata holds category-specific extras the listings table doesn't have first-class columns for
      const metadata: Record<string, unknown> = {};
      if (catFields.brand) metadata.brand = catFields.brand;
      if (catFields.pack_size) metadata.pack_size = catFields.pack_size;
      if (catFields.active_ingredient) metadata.active_ingredient = catFields.active_ingredient;
      if (catFields.dosage) metadata.dosage = catFields.dosage;
      if (catFields.model) metadata.model = catFields.model;

      const created = await create({
        data: {
          title: title.trim(),
          top_category: topCategory,
          category: catFields.subcategory_slug ?? topCategory,
          subcategory_slug: catFields.subcategory_slug ?? null,
          breed: catFields.breed || null,
          age_months:
            catFields.age_months === undefined || catFields.age_months === ""
              ? null
              : Number(catFields.age_months),
          sex: catFields.sex || null,
          quantity: Number(quantity) || 1,
          weight_kg:
            catFields.weight_kg === undefined || catFields.weight_kg === ""
              ? null
              : Number(catFields.weight_kg),
          price_ghs: Number(pricing.price_ghs),
          price_unit: pricing.price_unit,
          region: pricing.region,
          district: pricing.district || null,
          description: description || null,
          condition: catFields.condition || null,
          stock_quantity: null,
          min_order_qty: 1,
          expires_on: catFields.expires_on || null,
          metadata,
        },
      });

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

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-2xl border-[1.5px] border-border bg-card p-5">
      <h2 className="font-display text-[15px] font-extrabold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 pb-32 pt-5 md:pb-12 md:pt-8">
        <h1 className="font-display text-[28px] font-extrabold tracking-tight">
          Post a listing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          It only takes a minute. Your listing stays live for 60 days.
        </p>

        <div className="mt-6">
          <Stepper step={step} steps={STEP_LABELS} />
        </div>

        <div className="mt-6 space-y-4">
          {step === 1 && (
            <Section title="What are you selling?">
              <div>
                <Label>Marketplace pillar *</Label>
                <Select value={topCategory} onValueChange={(v) => onTopCategoryChange(v as TopCategory)}>
                  <SelectTrigger className="mt-1.5 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOP_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Listing title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    topCategory === "livestock"
                      ? "2 healthy Sanga bulls, 18 months"
                      : topCategory === "agrofeed_supplements"
                        ? "Layer mash 50kg — premium brand"
                        : topCategory === "agromed_veterinary"
                          ? "Newcastle vaccine, 1000-dose vial"
                          : "Used 1056-egg incubator, working"
                  }
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="qty">Quantity / units available *</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <CategoryFieldsSwitcher
                topCategory={topCategory}
                value={catFields}
                onChange={updateCat}
              />
            </Section>
          )}

          {step === 2 && (
            <>
              <Section title="Pricing">
                <div>
                  <Label htmlFor="price">Price (GH₵) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={pricing.price_ghs}
                    onChange={(e) => setPricing((p) => ({ ...p, price_ghs: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label>Price unit *</Label>
                  <Select
                    value={pricing.price_unit}
                    onValueChange={(v) =>
                      setPricing((p) => ({ ...p, price_unit: v as typeof p.price_unit }))
                    }
                  >
                    <SelectTrigger className="mt-1.5 w-full rounded-xl">
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
              </Section>

              <Section title="Location">
                <div>
                  <Label>Region *</Label>
                  <Select
                    value={pricing.region}
                    onValueChange={(v) => setPricing((p) => ({ ...p, region: v }))}
                  >
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
                <div>
                  <Label htmlFor="district">District / town</Label>
                  <Input
                    id="district"
                    value={pricing.district}
                    onChange={(e) => setPricing((p) => ({ ...p, district: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                    placeholder="Tamale, Kumasi…"
                  />
                </div>
              </Section>
            </>
          )}

          {step === 3 && (
            <>
              <Section title="Photos">
                <p className="-mt-2 text-xs text-muted-foreground">
                  Add up to 8 photos. The first is your cover.
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {previews.map((src, i) => (
                    <div
                      key={src}
                      className="relative aspect-square overflow-hidden rounded-xl bg-surface"
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-card/90 shadow-sm"
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
                      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-[11px] font-medium">
                        {photos.length === 0 ? "Add cover" : "Add photo"}
                      </span>
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
              </Section>

              <Section title="Description">
                <Textarea
                  id="desc"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    topCategory === "livestock"
                      ? "Health status, feeding, vaccination, willingness to deliver…"
                      : topCategory === "agrofeed_supplements"
                        ? "Composition, nutrient profile, packaging, storage…"
                        : topCategory === "agromed_veterinary"
                          ? "Indication, withdrawal period, storage, batch number…"
                          : "Year, hours used, condition notes, included accessories…"
                  }
                  className="rounded-xl"
                />
              </Section>
            </>
          )}
        </div>
      </div>

      <div
        className="fixed inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 66px)" }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 1 || busy}
            className="rounded-xl"
          >
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={next} className="flex-1 rounded-xl font-semibold sm:flex-none sm:px-8">
              Continue
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={busy}
              className="flex-1 rounded-xl font-semibold sm:flex-none sm:px-8"
            >
              {busy ? "Posting…" : "Post listing"}
            </Button>
          )}
        </div>
      </div>
      <style>{`@media (min-width: 768px) { .fixed.inset-x-0.z-30 { bottom: 0 !important; } }`}</style>
    </AppShell>
  );
}
