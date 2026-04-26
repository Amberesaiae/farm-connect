import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appErrorResponse } from "@/integrations/supabase/errors";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Phone must be E.164 (e.g. +233244000000)");

/**
 * Send a one-time code to the caller's phone. Wraps `send_phone_otp`
 * (cooldown + hashed-code storage live in SQL).
 */
export const sendPhoneOtp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ phone: phoneSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const phone = data.phone.startsWith("+") ? data.phone : `+${data.phone}`;
    const { data: res, error } = await supabase.rpc("send_phone_otp", {
      _phone_e164: phone,
    });
    if (error) {
      const msg = error.message || "";
      if (msg.includes("COOLDOWN")) {
        throw appErrorResponse({
          code: "RATE_LIMITED",
          message: "Please wait before requesting another code",
          retryAfterSec: 60,
        });
      }
      throw appErrorResponse({ code: "INTERNAL", message: msg });
    }
    const r = res as { ok?: boolean; reason?: string; cooldown_sec?: number } | null;
    if (!r?.ok) {
      throw appErrorResponse({
        code: "RATE_LIMITED",
        message: "Please wait before requesting another code",
        retryAfterSec: r?.cooldown_sec ?? 60,
      });
    }
    return { ok: true };
  });

/**
 * Verify the OTP. On success the SQL function flips `phone_verified=true`
 * and stamps `phone_verified_at`.
 */
export const verifyPhoneOtp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ phone: phoneSchema, code: z.string().regex(/^\d{4,8}$/) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const phone = data.phone.startsWith("+") ? data.phone : `+${data.phone}`;
    const { data: res, error } = await supabase.rpc("verify_phone_otp", {
      _phone_e164: phone,
      _code: data.code,
    });
    if (error) {
      throw appErrorResponse({ code: "VALIDATION", message: error.message });
    }
    const r = res as { ok?: boolean; reason?: string } | null;
    if (!r?.ok) {
      throw appErrorResponse({
        code: "VALIDATION",
        message:
          r?.reason === "expired"
            ? "Code expired — request a new one"
            : r?.reason === "too_many_attempts"
              ? "Too many attempts — request a new code"
              : "Incorrect code",
      });
    }
    return { ok: true };
  });