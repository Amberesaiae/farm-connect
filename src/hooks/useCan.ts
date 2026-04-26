import { useAuth } from "@/lib/auth-context";
import { useMySession } from "./useMySession";

export type Capability =
  | "listings.create"
  | "listings.contact_reveal"
  | "reservations.create"
  | "service_requests.create"
  | "hatchery.create"
  | "store.create"
  | "service_profile.create"
  | "moderate"
  | "admin";

export type CapabilityReason =
  | "ok"
  | "needs_login"
  | "needs_phone"
  | "needs_id"
  | "needs_licence"
  | "forbidden"
  | "loading";

export interface CapabilityResult {
  can: boolean;
  why: CapabilityReason;
}

/**
 * Per-action capability check that mirrors the server-side rights matrix.
 * Use this to gate buttons/CTAs and pick the right prompt:
 *   needs_login -> sign-in modal
 *   needs_phone -> phone-verify modal
 *   needs_id    -> ID-verify wizard
 */
export function useCan(cap: Capability): CapabilityResult {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { session, loading: sessLoading } = useMySession();

  if (authLoading || (isAuthenticated && sessLoading)) {
    return { can: false, why: "loading" };
  }
  if (!isAuthenticated || !session) {
    return { can: false, why: "needs_login" };
  }

  const isAdmin = session.roles.includes("admin");
  const isMod = isAdmin || session.roles.includes("moderator");
  const phone = session.trust.phone_verified;
  const id = session.trust.id_verified;

  // Staff bypass for most things
  if (isAdmin) return { can: true, why: "ok" };

  switch (cap) {
    case "admin":
      return { can: false, why: "forbidden" };
    case "moderate":
      return isMod ? { can: true, why: "ok" } : { can: false, why: "forbidden" };
    case "listings.create":
    case "listings.contact_reveal":
    case "reservations.create":
    case "service_requests.create":
      return phone ? { can: true, why: "ok" } : { can: false, why: "needs_phone" };
    case "hatchery.create":
    case "store.create":
    case "service_profile.create":
      if (!phone) return { can: false, why: "needs_phone" };
      return id ? { can: true, why: "ok" } : { can: false, why: "needs_id" };
    default:
      return { can: false, why: "forbidden" };
  }
}