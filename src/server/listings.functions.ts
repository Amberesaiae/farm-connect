import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ---------- Log a contact-tap (anyone can call; user may be anon) ----------
const logContactInput = z.object({ listingId: z.string().uuid() });

export const logContactTap = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => logContactInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("listing_events").insert({
      listing_id: data.listingId,
      event_type: "contact_whatsapp",
    });
    if (error) {
      console.error("logContactTap insert error:", error.message);
      return { ok: false };
    }
    // bump contact_count
    const { data: row } = await supabaseAdmin
      .from("listings")
      .select("contact_count")
      .eq("id", data.listingId)
      .maybeSingle();
    await supabaseAdmin
      .from("listings")
      .update({ contact_count: (row?.contact_count ?? 0) + 1 })
      .eq("id", data.listingId);
    return { ok: true };
  });

// ---------- Log a view (anonymous-safe) ----------
export const logView = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => logContactInput.parse(d))
  .handler(async ({ data }) => {
    await supabaseAdmin.from("listing_events").insert({
      listing_id: data.listingId,
      event_type: "view",
    });
    const { data: row } = await supabaseAdmin
      .from("listings")
      .select("view_count")
      .eq("id", data.listingId)
      .maybeSingle();
    await supabaseAdmin
      .from("listings")
      .update({ view_count: (row?.view_count ?? 0) + 1 })
      .eq("id", data.listingId);
    return { ok: true };
  });

// ---------- Create listing (auth) ----------
const createListingInput = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.string().min(1).max(40),
  breed: z.string().max(60).optional().nullable(),
  age_months: z.number().int().min(0).max(600).optional().nullable(),
  sex: z.enum(["male", "female", "mixed"]).optional().nullable(),
  quantity: z.number().int().min(1).max(10000).default(1),
  weight_kg: z.number().positive().max(5000).optional().nullable(),
  price_ghs: z.number().positive().max(10_000_000),
  price_unit: z.enum(["per_head", "per_kg", "per_lb", "lot"]),
  region: z.string().min(1).max(60),
  district: z.string().max(60).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export const createListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createListingInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("listings")
      .insert({ ...data, seller_id: userId })
      .select("id")
      .single();
    if (error) {
      console.error("createListing error:", error.message);
      throw new Error(error.message);
    }
    return { id: row.id };
  });

// ---------- Update listing (auth, owner via RLS) ----------
const updateListingInput = createListingInput.partial().extend({
  id: z.string().uuid(),
  status: z.enum(["draft", "active", "expired", "sold", "hidden"]).optional(),
});

export const updateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateListingInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...patch } = data;
    const { error } = await supabase
      .from("listings")
      .update(patch)
      .eq("id", id)
      .eq("seller_id", userId);
    if (error) {
      console.error("updateListing error:", error.message);
      throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Mark sold + bump trade_count, recompute badge ----------
export const markSold = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error: e1 } = await supabase
      .from("listings")
      .update({ status: "sold" })
      .eq("id", data.id)
      .eq("seller_id", userId);
    if (e1) throw new Error(e1.message);

    // Recompute badge: trade_count++, then tier rules
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("trade_count, badge_tier")
      .eq("id", userId)
      .single();
    const newCount = (prof?.trade_count ?? 0) + 1;
    let tier: "none" | "verified" | "trusted" | "top_seller" =
      (prof?.badge_tier as never) ?? "none";
    if (tier !== "none") {
      if (newCount >= 25) tier = "top_seller";
      else if (newCount >= 5) tier = "trusted";
    }
    await supabaseAdmin
      .from("profiles")
      .update({ trade_count: newCount, badge_tier: tier })
      .eq("id", userId);
    return { ok: true, trade_count: newCount, badge_tier: tier };
  });

// ---------- Relist (extend expiry) ----------
export const relistListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const newExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("listings")
      .update({ status: "active", expires_at: newExpiry })
      .eq("id", data.id)
      .eq("seller_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
