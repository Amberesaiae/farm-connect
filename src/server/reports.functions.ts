import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appErrorResponse } from "@/integrations/supabase/errors";

/**
 * Visitor-facing content report. Wraps the SECURITY DEFINER `report_content`
 * RPC (which validates the kind enum and stamps reporter_id from auth.uid()).
 */
const reportInput = z.object({
  kind: z.enum(["listing", "hatchery", "agro_store", "service_profile", "profile"]),
  id: z.string().uuid(),
  reason: z.string().trim().min(2).max(120),
  details: z.string().trim().max(800).optional().nullable(),
});

export const submitReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => reportInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: res, error } = await supabase.rpc("report_content", {
      _kind: data.kind,
      _id: data.id,
      _reason: data.reason,
      _details: data.details ?? undefined,
    });
    if (error) throw appErrorResponse({ code: "INTERNAL", message: error.message });
    const r = res as { ok?: boolean; code?: string; id?: string } | null;
    if (!r?.ok) {
      throw appErrorResponse({
        code: r?.code === "UNAUTHENTICATED" ? "UNAUTHENTICATED" : "VALIDATION",
        message: "Could not submit report",
      });
    }
    return { id: r.id };
  });