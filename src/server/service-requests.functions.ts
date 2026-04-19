import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Buyer submits a quote request
const createInput = z.object({
  service_profile_id: z.string().uuid(),
  service_type: z.string().min(1).max(60),
  region: z.string().min(1).max(60),
  district: z.string().max(60).optional().nullable(),
  preferred_date: z.string().optional().nullable(),
  preferred_window: z.string().max(40).optional().nullable(),
  budget_min_ghs: z.number().nonnegative().optional().nullable(),
  budget_max_ghs: z.number().nonnegative().optional().nullable(),
  notes: z.string().max(1500).optional().nullable(),
  buyer_contact: z.string().max(50).optional().nullable(),
  idempotency_key: z.string().min(8).max(80),
});

export const createServiceRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile, error: pErr } = await supabaseAdmin
      .from("service_profiles")
      .select("owner_id, business_name, is_active")
      .eq("id", data.service_profile_id)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!profile || !profile.is_active) throw new Error("Provider is not accepting requests");

    const { data: row, error } = await supabase
      .from("service_requests")
      .insert({
        service_profile_id: data.service_profile_id,
        provider_user_id: profile.owner_id,
        buyer_id: userId,
        service_type: data.service_type,
        region: data.region,
        district: data.district ?? null,
        preferred_date: data.preferred_date ?? null,
        preferred_window: data.preferred_window ?? null,
        budget_min_ghs: data.budget_min_ghs ?? null,
        budget_max_ghs: data.budget_max_ghs ?? null,
        notes: data.notes ?? null,
        buyer_contact: data.buyer_contact ?? null,
        idempotency_key: data.idempotency_key,
        status: "submitted",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: profile.owner_id,
      type: "service_request_received",
      title: `New quote request — ${profile.business_name}`,
      body: data.notes?.slice(0, 140) ?? null,
      link: "/dashboard/provider",
    });

    return { id: row.id };
  });

// Provider responds
export const respondServiceRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        request_id: z.string().uuid(),
        response: z.string().min(1).max(2000),
        responded_price_ghs: z.number().nonnegative().optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("service_requests")
      .update({
        status: "responded",
        provider_response: data.response,
        responded_price_ghs: data.responded_price_ghs ?? null,
        responded_at: new Date().toISOString(),
      })
      .eq("id", data.request_id)
      .select("buyer_id")
      .single();
    if (error) throw new Error(error.message);
    if (row?.buyer_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: row.buyer_id,
        type: "service_request_responded",
        title: "You have a quote response",
        body: data.response.slice(0, 140),
        link: "/dashboard/quotes",
      });
    }
    return { ok: true };
  });

// Provider declines
export const declineServiceRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ request_id: z.string().uuid(), reason: z.string().max(500).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("service_requests")
      .update({
        status: "declined",
        provider_response: data.reason ?? null,
        responded_at: new Date().toISOString(),
      })
      .eq("id", data.request_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Provider marks viewed (when opening from inbox)
export const markRequestViewed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ request_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await supabase
      .from("service_requests")
      .update({ status: "viewed" })
      .eq("id", data.request_id)
      .eq("status", "submitted");
    return { ok: true };
  });
