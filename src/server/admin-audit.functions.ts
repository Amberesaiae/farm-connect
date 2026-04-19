import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

const moderateListingInput = z.object({
  listing_id: z.string().uuid(),
  action: z.enum(["hide", "restore", "delete"]),
  reason: z.string().max(500).optional().nullable(),
});

export const moderateListingWithAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => moderateListingInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    let changed: { seller_id: string | null } | null = null;
    if (data.action === "delete") {
      const { data: row } = await supabaseAdmin
        .from("listings")
        .select("seller_id")
        .eq("id", data.listing_id)
        .maybeSingle();
      changed = row;
      const { error } = await supabaseAdmin.from("listings").delete().eq("id", data.listing_id);
      if (error) throw new Error(error.message);
    } else {
      const status = data.action === "hide" ? "hidden" : "active";
      const { data: row, error } = await supabaseAdmin
        .from("listings")
        .update({ status })
        .eq("id", data.listing_id)
        .select("seller_id")
        .single();
      if (error) throw new Error(error.message);
      changed = row;
    }

    await supabaseAdmin.from("admin_audit_logs").insert({
      actor_id: context.userId,
      action: `listing.${data.action}`,
      target_type: "listing",
      target_id: data.listing_id,
      reason: data.reason ?? null,
    });

    if (data.action === "hide" && changed?.seller_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: changed.seller_id,
        type: "listing_hidden_by_admin",
        title: "A listing was hidden by Farmlink",
        body: data.reason ?? "Please review the listing for our community guidelines.",
        link: "/dashboard",
      });
    }
    return { ok: true };
  });

const userActionInput = z.object({
  user_id: z.string().uuid(),
  action: z.enum(["suspend", "unsuspend"]),
  reason: z.string().max(500).optional().nullable(),
});

export const setUserStatusWithAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userActionInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const status = data.action === "suspend" ? "suspended" : "active";
    const patch: Record<string, unknown> = { status };
    if (data.action === "suspend") {
      patch.suspension_reason = data.reason ?? null;
      patch.suspended_at = new Date().toISOString();
    } else {
      patch.suspension_reason = null;
      patch.suspended_at = null;
    }
    const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.user_id);
    if (error) throw new Error(error.message);

    if (data.action === "suspend") {
      await supabaseAdmin
        .from("listings")
        .update({ status: "hidden" })
        .eq("seller_id", data.user_id)
        .eq("status", "active");
      await supabaseAdmin
        .from("service_profiles")
        .update({ is_active: false })
        .eq("owner_id", data.user_id);
      await supabaseAdmin
        .from("hatcheries")
        .update({ status: "suspended" })
        .eq("owner_id", data.user_id)
        .eq("status", "approved");
    } else {
      await supabaseAdmin
        .from("service_profiles")
        .update({ is_active: true })
        .eq("owner_id", data.user_id);
    }

    await supabaseAdmin.from("admin_audit_logs").insert({
      actor_id: context.userId,
      action: `user.${data.action}`,
      target_type: "user",
      target_id: data.user_id,
      reason: data.reason ?? null,
    });
    return { ok: true };
  });
