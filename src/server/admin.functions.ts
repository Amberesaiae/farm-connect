import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAnyRole, requireRole } from "@/integrations/supabase/role-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const moderateInput = z.object({
  listing_id: z.string().uuid(),
  action: z.enum(["hide", "restore", "delete"]),
});

export const moderateListing = createServerFn({ method: "POST" })
  .middleware([requireAnyRole(["admin", "moderator"])])
  .inputValidator((d: unknown) => moderateInput.parse(d))
  .handler(async ({ data }) => {
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
  .middleware([requireRole("admin")])
  .inputValidator((d: unknown) => userActionInput.parse(d))
  .handler(async ({ data }) => {
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
