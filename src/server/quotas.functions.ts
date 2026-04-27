import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appErrorResponse } from "@/integrations/supabase/errors";

/**
 * Active-listing cap, current count, and trust flags for the caller.
 * Powers the dashboard quota tile and "X of Y listings used" hints.
 */
export interface ListingCaps {
  cap: number | null; // null = unlimited
  active: number;
  unlimited: boolean;
  phone_verified: boolean;
  id_verified: boolean;
}

export const getMyListingCaps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ListingCaps> => {
    const { data, error } = await context.supabase.rpc("vendor_listing_caps");
    if (error) throw appErrorResponse({ code: "INTERNAL", message: error.message });
    const r = (data ?? {}) as Record<string, unknown>;
    return {
      cap: typeof r.cap === "number" ? r.cap : null,
      active: Number(r.active ?? 0),
      unlimited: !!r.unlimited,
      phone_verified: !!r.phone_verified,
      id_verified: !!r.id_verified,
    };
  });

/**
 * Returns whether the caller is allowed to post in `_pillar`. The UI uses this
 * to pick the right CTA (verify phone, verify ID, complete licence, or post).
 */
export type PillarPostCheck =
  | { ok: true }
  | {
      ok: false;
      code:
        | "UNAUTHENTICATED"
        | "PHONE_VERIFICATION_REQUIRED"
        | "ID_VERIFICATION_REQUIRED"
        | "BUSINESS_LICENCE_REQUIRED";
    };

const pillarInput = z.object({ pillar: z.string().min(1).max(60) });

export const checkCanPostPillar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pillarInput.parse(d))
  .handler(async ({ data, context }): Promise<PillarPostCheck> => {
    const { data: res, error } = await context.supabase.rpc("user_can_post_pillar", {
      _user_id: context.userId,
      _pillar: data.pillar,
    });
    if (error) throw appErrorResponse({ code: "INTERNAL", message: error.message });
    const r = (res ?? {}) as { ok?: boolean; code?: PillarPostCheck extends { code: infer C } ? C : never };
    if (r.ok) return { ok: true };
    return { ok: false, code: (r.code as never) ?? "PHONE_VERIFICATION_REQUIRED" };
  });