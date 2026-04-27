import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { GHANA_REGIONS, LISTING_PHOTOS_BUCKET } from "@/lib/constants";
import { useTaxonomy } from "@/lib/taxonomy-context";
import {
  AttributeForm,
  validateAttributes,
  type AttributesValue,
} from "@/components/post/AttributeForm";
import { useServerFn } from "@tanstack/react-start";
import { createListing } from "@/server/listings.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { useCan } from "@/hooks/useCan";
import { RequirePhoneVerifyModal } from "@/components/auth/RequirePhoneVerifyModal";
import { LicenceRequiredNudge } from "@/components/auth/LicenceRequiredNudge";
import { parseAppError } from "@/integrations/supabase/errors";

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
  pillar: z.string().min(1, "Pick a marketplace"),
  title: z.string().trim().min(3, "Title is too short").max(120),
  category_slug: z.string().min(1, "Pick a subcategory"),
  quantity: z.coerce.number().int().min(1).max(10000),
});
const step2 = z.object({
  price_ghs: z.coerce.number().positive().max(10_000_000),
  price_unit_slug: z.string().min(1, "Pick a price unit"),
  region: z.string().min(1, "Region is required"),
  district: z.string().max(60).optional(),
});
const step3 = z.object({
  description: z.string().max(2000).optional(),
});

/**
 * Map a price-unit slug to the legacy `price_unit` enum the listings table
 * still requires. Slugs outside the legacy set fall back to "lot".
 */
function legacyPriceUnit(slug: string): "per_head" | "per_kg" | "per_lb" | "lot" {
  if (slug === "per_head") return "per_head";
  if (slug === "per_kg") return "per_kg";
  if (slug === "per_lb") return "per_lb";
  return "lot";
}

function PostWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const create = useServerFn(createListing);
  const { taxonomy, loading: taxonomyLoading } = useTaxonomy();
  const topPillars = taxonomy.marketplacePillars;
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const { can, why } = useCan("listings.create");
  const [verifyOpen, setVerifyOpen] = useState(false);

  // Gentle prompt: when an authed user lands here without a verified phone,
  // open the OTP modal once. They can dismiss and still draft, but submit
  // will fail at the server gate until they verify.
  useEffect(() => {
    if (why === "needs_phone") setVerifyOpen(true);
  }, [why]);

  const [pillarSlug, setPillarSlug] = useState<string>("");
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState<number | string>(1);
  const [attributes, setAttributes] = useState<AttributesValue>({});
  const [pricing, setPricing] = useState({
    price_ghs: "" as string | number,
    price_unit_slug: "",
    region: "",
    district: "",
  });
  const [description, setDescription] = useState("");

  // Default the pillar to the first marketplace pillar once taxonomy loads.
  useEffect(() => {
    if (!pillarSlug && topPillars.length > 0) {
      setPillarSlug(topPillars[0].slug);
    }
  }, [pillarSlug, topPillars]);

  const pillar = taxonomy.getPillar(pillarSlug);
  const subcategories = taxonomy.categoriesFor(pillarSlug);
  const category = taxonomy.resolveCategory(pillarSlug, categorySlug);
  const categoryAttrs = taxonomy.attributesFor(category?.id ?? null);

  // Allowed price units for the active pillar.
  const priceUnits = useMemo(() => {
    if (!pillar) return taxonomy.units.filter((u) => u.kind === "price");
    const allowed = pillar.allowedUnits.length
      ? pillar.allowedUnits
      : taxonomy.units.filter((u) => u.kind === "price").map((u) => u.slug);
    return taxonomy.units.filter((u) => allowed.includes(u.slug));
  }, [pillar, taxonomy]);

  // Reset category + attrs when pillar changes; default the price unit.
  const onPillarChange = (slug: string) => {
    setPillarSlug(slug);
    setCategorySlug("");
    setAttributes({});
    const next = taxonomy.getPillar(slug);
    setPricing((p) => ({
      ...p,
      price_unit_slug: next?.defaultUnitSlug ?? "",
    }));
  };

  // Default the price unit on first load too.
  useEffect(() => {
    if (!pricing.price_unit_slug && pillar?.defaultUnitSlug) {
      setPricing((p) => ({ ...p, price_unit_slug: pillar.defaultUnitSlug ?? "" }));
    }
  }, [pillar, pricing.price_unit_slug]);

  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const previews = photos.map((f) => URL.createObjectURL(f));
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const next = () => {
    if (step === 1) {
      const r = step1Base.safeParse({
        pillar: pillarSlug,
        title,
        category_slug: categorySlug,
        quantity,
      });
      if (!r.success) return toast.error(r.error.issues[0].message);
      // Per-attribute requireds (server trigger is authoritative; this is UX).
      const attrError = validateAttributes(categoryAttrs, attributes);
      if (attrError) return toast.error(attrError);
      // Pillar-level guard rails (DB enforces these too).
      if (pillar?.requiresExpiry && !attributes.expires_on) {
        return toast.error("Expiry date is required for this category.");
      }
      if (pillar?.requiresCondition && !attributes.condition) {
        return toast.error("Condition is required for this category.");
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
    if (!category) return toast.error("Please pick a subcategory");
    if (!can) {
      // Open the relevant prompt instead of a confusing API error
      if (why === "needs_phone") setVerifyOpen(true);
      else toast.error("You don't have permission to post yet");
      return;
    }

    setBusy(true);
    try {
      // Coerce numeric attribute strings to numbers based on the data type.
      const coerced: AttributesValue = {};
      for (const a of categoryAttrs) {
        const v = attributes[a.definition.key];
        if (v === undefined || v === null || v === "") continue;
        if (a.definition.dataType === "integer") coerced[a.definition.key] = Number(v);
        else if (a.definition.dataType === "decimal") coerced[a.definition.key] = Number(v);
        else coerced[a.definition.key] = v;
      }

      // Pull a few well-known attributes back into first-class columns so
      // legacy filters (breed/age/sex/weight/condition/expires_on) keep working
      // until those columns are removed.
      const breedSlug = typeof coerced.breed === "string" ? coerced.breed : null;
      const breedLabel = breedSlug
        ? (taxonomy.breeds.find((b) => b.slug === breedSlug)?.labelEn ?? breedSlug)
        : (typeof coerced.breed_text === "string" ? coerced.breed_text : null);

      const created = await create({
        data: {
          title: title.trim(),
          top_category: pillarSlug,
          category: category.slug,
          category_id: category.id,
          subcategory_slug: category.slug,
          attributes: coerced,
          breed: breedLabel,
          age_months:
            typeof coerced.age_months === "number" ? coerced.age_months : null,
          sex: (coerced.sex as "male" | "female" | "mixed" | undefined) ?? null,
          quantity: Number(quantity) || 1,
          weight_kg:
            typeof coerced.weight_kg === "number" ? coerced.weight_kg : null,
          price_ghs: Number(pricing.price_ghs),
          price_unit: legacyPriceUnit(pricing.price_unit_slug),
          price_unit_slug: pricing.price_unit_slug,
          region: pricing.region,
          district: pricing.district || null,
          description: description || null,
          condition:
            (coerced.condition as "new" | "used" | undefined) ?? null,
          stock_quantity: null,
          min_order_qty: 1,
          expires_on:
            typeof coerced.expires_on === "string" ? coerced.expires_on : null,
          metadata: {},
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
      const e = await parseAppError(err);
      if (e.requires === "phone_verify") {
        setVerifyOpen(true);
      } else {
        toast.error(e.message);
      }
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
                <Label>Marketplace *</Label>
                <Select value={pillarSlug} onValueChange={onPillarChange}>
                  <SelectTrigger className="mt-1.5 w-full rounded-xl">
                    <SelectValue placeholder={taxonomyLoading ? "Loading…" : "Pick a marketplace"} />
                  </SelectTrigger>
                  <SelectContent>
                    {topPillars.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {pillarSlug ? <LicenceRequiredNudge pillar={pillarSlug} /> : null}
              <div>
                <Label>Subcategory *</Label>
                <Select
                  value={categorySlug || undefined}
                  onValueChange={(v) => {
                    setCategorySlug(v);
                    setAttributes({});
                  }}
                >
                  <SelectTrigger className="mt-1.5 w-full rounded-xl">
                    <SelectValue placeholder={subcategories.length ? "Pick a subcategory" : "—"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories
                      .filter((s) => s.acceptsListings !== false)
                      .map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {s.label}
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
                  placeholder={pillar?.description ?? "Short, descriptive title"}
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
              <AttributeForm
                categoryId={category?.id ?? null}
                value={attributes}
                onChange={setAttributes}
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
                    value={pricing.price_unit_slug || undefined}
                    onValueChange={(v) =>
                      setPricing((p) => ({ ...p, price_unit_slug: v }))
                    }
                  >
                    <SelectTrigger className="mt-1.5 w-full rounded-xl">
                      <SelectValue placeholder="Pick a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceUnits.map((u) => (
                        <SelectItem key={u.slug} value={u.slug}>
                          {u.labelEn}
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
                    pillar?.slug === "livestock"
                      ? "Health status, feeding, vaccination, willingness to deliver…"
                      : "Composition, packaging, storage, condition, batch…"
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
      <RequirePhoneVerifyModal open={verifyOpen} onOpenChange={setVerifyOpen} />
    </AppShell>
  );
}
