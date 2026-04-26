import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface MySession {
  userId: string;
  roles: AppRole[];
  trust: {
    phone_verified: boolean;
    id_verified: boolean;
    business_licensed: boolean;
  };
  profile: {
    display_name: string;
    avatar_url: string | null;
    badge_tier: string;
    status: string;
    whatsapp_e164: string | null;
  } | null;
}

/**
 * One round-trip read of the caller's roles + trust flags + profile snapshot.
 * The client caches this in React Query so capability checks (`useCan`) and
 * the AdminGate stop hitting `from('user_roles')` directly.
 */
export const getMySession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MySession> => {
    const { supabase, userId } = context;

    const [rolesRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("profiles")
        .select(
          "display_name, avatar_url, badge_tier, status, whatsapp_e164, phone_verified, id_verified, business_licensed",
        )
        .eq("id", userId)
        .maybeSingle(),
    ]);

    const roles = ((rolesRes.data ?? []) as { role: AppRole }[]).map((r) => r.role);
    const p = profileRes.data;

    return {
      userId,
      roles,
      trust: {
        phone_verified: !!p?.phone_verified,
        id_verified: !!p?.id_verified,
        business_licensed: !!p?.business_licensed,
      },
      profile: p
        ? {
            display_name: p.display_name,
            avatar_url: p.avatar_url,
            badge_tier: p.badge_tier,
            status: p.status,
            whatsapp_e164: p.whatsapp_e164,
          }
        : null,
    };
  });