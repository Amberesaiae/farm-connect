/**
 * Role + trust-gate + ownership middleware composed on top of
 * `requireSupabaseAuth`. Throws typed `AppError` Responses (see ./errors.ts)
 * so the client can branch on `code` and prompt the right action.
 */
import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "./auth-middleware";
import { appErrorResponse } from "./errors";
import type { Database } from "./types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type TrustGate = "phone_verified" | "id_verified" | "business_licensed";

/** Require the caller to hold a specific role. */
export function requireRole(role: AppRole) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next, context }) => {
      const { data, error } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: role,
      });
      if (error || !data) {
        throw appErrorResponse({
          code: "FORBIDDEN",
          message: `Requires '${role}' role`,
        });
      }
      return next();
    });
}

/** Require the caller to hold any of the given roles. */
export function requireAnyRole(roles: AppRole[]) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next, context }) => {
      const { data, error } = await context.supabase.rpc("has_any_role", {
        _user_id: context.userId,
        _roles: roles,
      });
      if (error || !data) {
        throw appErrorResponse({
          code: "FORBIDDEN",
          message: `Requires one of: ${roles.join(", ")}`,
        });
      }
      return next();
    });
}

/** Require the caller to satisfy a trust gate (phone/id/business licence). */
export function requireGate(gate: TrustGate) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next, context }) => {
      const { data, error } = await context.supabase
        .from("profiles")
        .select("phone_verified, id_verified, business_licensed")
        .eq("id", context.userId)
        .maybeSingle();
      if (error) {
        throw appErrorResponse({ code: "INTERNAL", message: error.message });
      }
      const ok = !!data?.[gate];
      if (!ok) {
        const map = {
          phone_verified: {
            code: "PHONE_VERIFICATION_REQUIRED" as const,
            requires: "phone_verify" as const,
            message: "Verify your phone number to continue",
          },
          id_verified: {
            code: "ID_VERIFICATION_REQUIRED" as const,
            requires: "id_verify" as const,
            message: "Verify your Ghana Card to continue",
          },
          business_licensed: {
            code: "BUSINESS_LICENCE_REQUIRED" as const,
            requires: "business_licence" as const,
            message: "A business licence is required",
          },
        };
        throw appErrorResponse(map[gate]);
      }
      return next();
    });
}

type OwnershipKind = "listing" | "batch" | "store" | "service_profile";

/**
 * Require the caller to own a given record. Calls the SECURITY DEFINER
 * `owns_*` SQL helpers so policy logic stays in one place.
 */
export function requireOwnership(kind: OwnershipKind, getId: (data: any) => string) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next, context, data }) => {
      const id = getId(data);
      const fnByKind: Record<OwnershipKind, "owns_listing" | "owns_batch" | "owns_store" | "owns_service_profile"> = {
        listing: "owns_listing",
        batch: "owns_batch",
        store: "owns_store",
        service_profile: "owns_service_profile",
      };
      const argByKind: Record<OwnershipKind, string> = {
        listing: "_listing_id",
        batch: "_batch_id",
        store: "_store_id",
        service_profile: "_profile_id",
      };
      const { data: ok, error } = await context.supabase.rpc(fnByKind[kind], {
        _user_id: context.userId,
        [argByKind[kind]]: id,
      } as never);
      if (error || !ok) {
        throw appErrorResponse({
          code: "FORBIDDEN",
          message: "You don't have permission for this resource",
        });
      }
      return next();
    });
}