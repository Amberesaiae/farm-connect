import { redirect } from "@tanstack/react-router";
import { getMySession } from "@/server/session.functions";

/**
 * Use inside a `beforeLoad` to block non-staff users from rendering admin
 * pages. Throws a redirect (which TanStack Router honours) — this prevents
 * the protected component from mounting, so there is no UI flash.
 *
 * - Unauthenticated → /login
 * - Authenticated, not staff → /listings
 */
export async function requireStaffBeforeLoad() {
  try {
    const s = await getMySession();
    const roles = s?.roles ?? [];
    const isStaff = roles.some((r) => r === "admin" || r === "moderator");
    if (!isStaff) {
      throw redirect({ to: "/listings" });
    }
    return { session: s };
  } catch (e) {
    // Re-throw redirects so they aren't swallowed
    if (e && typeof e === "object" && "to" in (e as Record<string, unknown>)) {
      throw e;
    }
    const status = (e as { status?: number } | null)?.status;
    const msg = (e as Error | null)?.message ?? "";
    if (status === 401 || /Unauthorized/i.test(msg)) {
      throw redirect({
        to: "/login",
        search: { redirect: "/admin" } as never,
      });
    }
    throw e;
  }
}

/**
 * Admin-only variant. Use on routes that even moderators must not see
 * (taxonomy, user role management).
 */
export async function requireAdminBeforeLoad() {
  const ctx = await requireStaffBeforeLoad();
  if (!ctx.session?.roles.includes("admin")) {
    throw redirect({ to: "/admin" });
  }
  return ctx;
}