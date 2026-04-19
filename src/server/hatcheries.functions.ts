import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

// ---------- Submit hatchery onboarding ----------
const submitInput = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.enum(["poultry", "fish", "breeding"]),
  region: z.string().min(1).max(60),
  district: z.string().max(60).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  blurb: z.string().max(800).optional().nullable(),
  capacity_per_cycle: z.number().int().min(0).max(10_000_000).optional().nullable(),
  whatsapp_e164: z.string().max(20).optional().nullable(),
  permit_number: z.string().max(80).optional().nullable(),
  permit_authority: z
    .enum(["vsd", "fisheries_commission", "epa", "district_assembly", "other"])
    .optional()
    .nullable(),
  permit_doc_path: z.string().max(300).optional().nullable(),
  cover_path: z.string().max(300).optional().nullable(),
});

export const submitHatcheryApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => submitInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Build a unique slug
    let slug = slugify(data.name);
    if (!slug) slug = `hatchery-${Date.now()}`;
    const { data: existing } = await supabaseAdmin
      .from("hatcheries")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const { data: row, error } = await supabase
      .from("hatcheries")
      .insert({
        owner_id: userId,
        slug,
        name: data.name,
        category: data.category,
        region: data.region,
        district: data.district ?? null,
        address: data.address ?? null,
        blurb: data.blurb ?? null,
        capacity_per_cycle: data.capacity_per_cycle ?? null,
        whatsapp_e164: data.whatsapp_e164 ?? null,
        permit_number: data.permit_number ?? null,
        permit_authority: data.permit_authority ?? null,
        permit_doc_path: data.permit_doc_path ?? null,
        cover_path: data.cover_path ?? null,
        status: "pending_review",
      })
      .select("id, slug")
      .single();

    if (error) {
      console.error("submitHatcheryApplication:", error.message);
      throw new Error(error.message);
    }

    // Add 'hatchery' to user's roles array
    await supabaseAdmin.rpc("noop").catch(() => undefined); // safe no-op
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("roles")
      .eq("id", userId)
      .maybeSingle();
    const roles = new Set<string>(prof?.roles ?? ["buyer"]);
    roles.add("hatchery");
    await supabaseAdmin.from("profiles").update({ roles: Array.from(roles) }).eq("id", userId);

    return { id: row.id, slug: row.slug };
  });

// ---------- Update an own hatchery ----------
const updateInput = submitInput.partial().extend({ id: z.string().uuid() });

export const updateHatchery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...patch } = data;
    const { error } = await supabase
      .from("hatcheries")
      .update(patch)
      .eq("id", id)
      .eq("owner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Admin: review application (approve/reject) ----------
const reviewInput = z.object({
  hatchery_id: z.string().uuid(),
  action: z.enum(["approve", "reject", "suspend", "reinstate"]),
  reason: z.string().max(500).optional().nullable(),
});

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const reviewHatcheryApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => reviewInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    let status: "approved" | "rejected" | "suspended";
    if (data.action === "approve" || data.action === "reinstate") status = "approved";
    else if (data.action === "reject") status = "rejected";
    else status = "suspended";

    const patch: Record<string, unknown> = { status, rejection_reason: data.reason ?? null };
    if (status === "approved")
      Object.assign(patch, { approved_at: new Date().toISOString(), approved_by: context.userId });

    const { data: hatchery, error } = await supabaseAdmin
      .from("hatcheries")
      .update(patch)
      .eq("id", data.hatchery_id)
      .select("owner_id, name")
      .single();
    if (error) throw new Error(error.message);

    // Audit log
    await supabaseAdmin.from("admin_audit_logs").insert({
      actor_id: context.userId,
      action: `hatchery.${data.action}`,
      target_type: "hatchery",
      target_id: data.hatchery_id,
      reason: data.reason ?? null,
      metadata: { name: hatchery.name },
    });

    // Notify owner
    if (hatchery.owner_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: hatchery.owner_id,
        type: status === "approved" ? "hatchery_approved" : "hatchery_rejected",
        title:
          status === "approved"
            ? `${hatchery.name} is approved`
            : `${hatchery.name} needs changes`,
        body: data.reason ?? null,
        link: "/dashboard/hatchery",
      });
    }

    return { ok: true };
  });

// ---------- Admin: signed permit URL ----------
export const getPermitSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ hatchery_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row } = await supabaseAdmin
      .from("hatcheries")
      .select("permit_doc_path")
      .eq("id", data.hatchery_id)
      .maybeSingle();
    if (!row?.permit_doc_path) return { url: null };
    const { data: signed } = await supabaseAdmin.storage
      .from("hatchery-permits")
      .createSignedUrl(row.permit_doc_path, 300);
    return { url: signed?.signedUrl ?? null };
  });
