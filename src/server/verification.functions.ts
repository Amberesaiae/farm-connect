import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const submitInput = z.object({
  ghana_card_path: z.string().min(3).max(500),
  selfie_path: z.string().min(3).max(500),
});

export const submitVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => submitInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("verification_submissions").insert({
      user_id: userId,
      ghana_card_path: data.ghana_card_path,
      selfie_path: data.selfie_path,
    });
    if (error) {
      console.error("submitVerification error:", error.message);
      throw new Error(error.message);
    }
    return { ok: true };
  });

const reviewInput = z.object({
  submission_id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().max(500).optional(),
});

export const reviewVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => reviewInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Confirm caller is admin
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");

    const { data: sub, error: e1 } = await supabaseAdmin
      .from("verification_submissions")
      .update({
        status: data.decision,
        rejection_reason: data.decision === "rejected" ? data.reason ?? null : null,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.submission_id)
      .select("user_id")
      .single();
    if (e1) throw new Error(e1.message);

    if (data.decision === "approved") {
      await supabaseAdmin
        .from("profiles")
        .update({ badge_tier: "verified" })
        .eq("id", sub.user_id)
        .eq("badge_tier", "none");
    }

    await supabaseAdmin.from("notifications").insert({
      user_id: sub.user_id,
      type: data.decision === "approved" ? "verification_approved" : "verification_rejected",
      title:
        data.decision === "approved"
          ? "Verification approved"
          : "Verification needs attention",
      body:
        data.decision === "approved"
          ? "Your account is now verified — your listings will show a Verified badge."
          : data.reason ?? "Please re-submit your documents.",
      link: "/dashboard/verification",
    });

    return { ok: true };
  });
