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

const moderateInput = z.object({
  listing_id: z.string().uuid(),
  action: z.enum(["hide", "restore", "delete"]),
});

export const moderateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => moderateInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.action === "delete") {
      const { error } = await supabaseAdmin.from("listings").delete().eq("id", data.listing_id);
      if (error) throw new Error(error.message);
    } else {
      const status = data.action === "hide" ? "hidden" : "active";
      const { error } = await supabaseAdmin
        .from("listings")
        .update({ status })
        .eq("id", data.listing_id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

const userActionInput = z.object({
  user_id: z.string().uuid(),
  action: z.enum(["suspend", "unsuspend"]),
});

export const setUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userActionInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const status = data.action === "suspend" ? "suspended" : "active";
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status })
      .eq("id", data.user_id);
    if (error) throw new Error(error.message);
    // hide all listings if suspending
    if (data.action === "suspend") {
      await supabaseAdmin
        .from("listings")
        .update({ status: "hidden" })
        .eq("seller_id", data.user_id)
        .eq("status", "active");
    }
    return { ok: true };
  });
