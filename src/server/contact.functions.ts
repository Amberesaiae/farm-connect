import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appErrorResponse } from "@/integrations/supabase/errors";

/**
 * Reveal a seller's WhatsApp number for a listing. Wraps the
 * `reveal_contact` SECURITY DEFINER RPC, which enforces:
 *   - caller is authenticated
 *   - caller is phone-verified
 *   - per-day reveal cap
 * and logs a `contact_whatsapp` listing_event.
 */
const revealInput = z.object({ listingId: z.string().uuid() });

export const revealContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => revealInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: result, error } = await supabase.rpc("reveal_contact", {
      _listing_id: data.listingId,
    });
    if (error) {
      // Map common DB exceptions to typed AppError codes
      const msg = error.message || "";
      if (msg.includes("PHONE_VERIFICATION_REQUIRED")) {
        throw appErrorResponse({
          code: "PHONE_VERIFICATION_REQUIRED",
          requires: "phone_verify",
          message: "Verify your phone to contact sellers",
        });
      }
      if (msg.includes("RATE_LIMIT") || msg.includes("CAP_EXCEEDED")) {
        throw appErrorResponse({
          code: "RATE_LIMITED",
          message: "Daily contact-reveal limit reached",
          retryAfterSec: 86_400,
        });
      }
      throw appErrorResponse({ code: "INTERNAL", message: msg });
    }
    const r = result as { ok?: boolean; whatsapp_e164?: string | null; reason?: string } | null;
    if (!r?.ok || !r.whatsapp_e164) {
      if (r?.reason === "phone_verification_required") {
        throw appErrorResponse({
          code: "PHONE_VERIFICATION_REQUIRED",
          requires: "phone_verify",
          message: "Verify your phone to contact sellers",
        });
      }
      if (r?.reason === "rate_limited") {
        throw appErrorResponse({
          code: "RATE_LIMITED",
          message: "Daily contact-reveal limit reached",
          retryAfterSec: 86_400,
        });
      }
      throw appErrorResponse({
        code: "NOT_FOUND",
        message: "Seller has no WhatsApp number on file",
      });
    }
    return { whatsapp_e164: r.whatsapp_e164 };
  });

/**
 * Anonymous-safe view tracker. Calls the `record_listing_view` RPC which
 * throttles by listing + IP + hour bucket inside the database.
 */
export const recordView = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => revealInput.parse(d))
  .handler(async ({ data }) => {
    // Use the publishable client (anonymous) — RPC is SECURITY DEFINER
    // and accepts unauthenticated callers via the throttle table.
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.rpc("record_listing_view", { _listing_id: data.listingId });
    return { ok: true };
  });