import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAnyRole, requireGate } from "@/integrations/supabase/role-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

const submitInput = z.object({
  business_name: z.string().trim().min(2).max(120),
  pillar: z.enum([
    "agrofeed_supplements",
    "agromed_veterinary",
    "agro_equipment_tools",
  ]),
  blurb: z.string().max(800).optional().nullable(),
  region: z.string().min(1).max(60),
  district: z.string().max(60).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  whatsapp_e164: z.string().max(20).optional().nullable(),
  phone_e164: z.string().max(20).optional().nullable(),
  email: z.string().email().max(120).optional().nullable(),
  delivers: z.boolean().default(false),
  delivery_regions: z.array(z.string().max(60)).max(20).default([]),
  min_order_ghs: z.number().nonnegative().optional().nullable(),
  business_reg_number: z.string().max(80).optional().nullable(),
  vsd_licence_number: z.string().max(80).optional().nullable(),
  licence_doc_path: z.string().max(300).optional().nullable(),
  cover_path: z.string().max(300).optional().nullable(),
  logo_path: z.string().max(300).optional().nullable(),
});

export const submitAgroStoreApplication = createServerFn({ method: "POST" })
  .middleware([requireGate("id_verified")])
  .inputValidator((d: unknown) => submitInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let slug = slugify(data.business_name);
    if (!slug) slug = `store-${Date.now()}`;

    // cross-table existence check (best-effort UI hint; trigger enforces)
    const [hatch, svc, agro] = await Promise.all([
      supabaseAdmin.from("hatcheries").select("id").eq("slug", slug).maybeSingle(),
      supabaseAdmin.from("service_profiles").select("id").eq("slug", slug).maybeSingle(),
      supabaseAdmin.from("agro_vendor_stores").select("id").eq("slug", slug).maybeSingle(),
    ]);
    if (hatch.data || svc.data || agro.data) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const { data: row, error } = await supabase
      .from("agro_vendor_stores")
      .insert({
        owner_id: userId,
        slug,
        business_name: data.business_name,
        pillar: data.pillar,
        blurb: data.blurb ?? null,
        region: data.region,
        district: data.district ?? null,
        address: data.address ?? null,
        whatsapp_e164: data.whatsapp_e164 ?? null,
        phone_e164: data.phone_e164 ?? null,
        email: data.email ?? null,
        delivers: data.delivers,
        delivery_regions: data.delivery_regions,
        min_order_ghs: data.min_order_ghs ?? null,
        business_reg_number: data.business_reg_number ?? null,
        vsd_licence_number: data.vsd_licence_number ?? null,
        licence_doc_path: data.licence_doc_path ?? null,
        cover_path: data.cover_path ?? null,
        logo_path: data.logo_path ?? null,
        status: "pending_review",
      })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);

    // Add 'seller' role
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("roles")
      .eq("id", userId)
      .maybeSingle();
    const roles = new Set<string>(prof?.roles ?? ["buyer"]);
    roles.add("seller");
    await supabaseAdmin.from("profiles").update({ roles: Array.from(roles) }).eq("id", userId);

    return { id: row.id, slug: row.slug };
  });

const updateInput = submitInput.partial().extend({ id: z.string().uuid() });

export const updateAgroStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...patch } = data;
    const { error } = await supabase
      .from("agro_vendor_stores")
      .update(patch as never)
      .eq("id", id)
      .eq("owner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const moderateInput = z.object({
  store_id: z.string().uuid(),
  action: z.enum(["approve", "reject", "suspend", "reinstate"]),
  reason: z.string().max(500).optional().nullable(),
});

export const moderateAgroStore = createServerFn({ method: "POST" })
  .middleware([requireAnyRole(["admin", "moderator"])])
  .inputValidator((d: unknown) => moderateInput.parse(d))
  .handler(async ({ data, context }) => {
    let status: "approved" | "rejected" | "suspended";
    if (data.action === "approve" || data.action === "reinstate") status = "approved";
    else if (data.action === "reject") status = "rejected";
    else status = "suspended";

    const patch = {
      status,
      rejection_reason: data.reason ?? null,
      ...(status === "approved"
        ? { approved_at: new Date().toISOString(), approved_by: context.userId }
        : {}),
    } as never;

    const { data: store, error } = await supabaseAdmin
      .from("agro_vendor_stores")
      .update(patch)
      .eq("id", data.store_id)
      .select("owner_id, business_name")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("admin_audit_logs").insert({
      actor_id: context.userId,
      action: `agro_store.${data.action}`,
      target_type: "agro_store",
      target_id: data.store_id,
      reason: data.reason ?? null,
      metadata: { name: store.business_name },
    });

    if (store.owner_id) {
      const ntype =
        status === "approved"
          ? "agro_store_approved"
          : status === "rejected"
            ? "agro_store_rejected"
            : "agro_store_suspended";
      await supabaseAdmin.from("notifications").insert({
        user_id: store.owner_id,
        type: ntype,
        title:
          status === "approved"
            ? `${store.business_name} is approved`
            : status === "rejected"
              ? `${store.business_name} needs changes`
              : `${store.business_name} was suspended`,
        body: data.reason ?? null,
        link: "/dashboard/store",
      });
    }
    return { ok: true };
  });

export const getAgroStoreLicenceUrl = createServerFn({ method: "POST" })
  .middleware([requireAnyRole(["admin", "moderator"])])
  .inputValidator((d: unknown) => z.object({ store_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("agro_vendor_stores")
      .select("licence_doc_path")
      .eq("id", data.store_id)
      .maybeSingle();
    if (!row?.licence_doc_path) return { url: null };
    const { data: signed } = await supabaseAdmin.storage
      .from("vendor-licences")
      .createSignedUrl(row.licence_doc_path, 300);
    return { url: signed?.signedUrl ?? null };
  });

export const listMyAgroStores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("agro_vendor_stores")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    return { stores: data ?? [] };
  });

export const listPendingAgroStores = createServerFn({ method: "GET" })
  .middleware([requireAnyRole(["admin", "moderator"])])
  .handler(async () => {
    const { data } = await supabaseAdmin
      .from("agro_vendor_stores")
      .select("*")
      .in("status", ["pending_review", "approved", "suspended", "rejected"])
      .order("created_at", { ascending: false })
      .limit(100);
    return { stores: data ?? [] };
  });
