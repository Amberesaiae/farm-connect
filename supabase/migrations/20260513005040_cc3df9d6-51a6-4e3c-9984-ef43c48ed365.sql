
-- Revoke broad column read on whatsapp_e164 for anon + authenticated.
-- RLS is row-level only; column-level privacy needs GRANT/REVOKE.
REVOKE SELECT (whatsapp_e164) ON public.profiles FROM anon;
REVOKE SELECT (whatsapp_e164) ON public.profiles FROM authenticated;

-- Re-grant the safe (non-contact) columns explicitly to keep existing reads working.
GRANT SELECT (
  id, display_name, avatar_url, region, district, badge_tier, trade_count,
  listing_count, status, phone_verified, id_verified, business_licensed,
  phone_verified_at, id_verified_at, suspended_at, suspension_reason,
  roles, active_role, created_at, updated_at
) ON public.profiles TO anon, authenticated;

-- Allow updating only the columns a user should be able to change.
GRANT UPDATE (
  display_name, avatar_url, region, district, whatsapp_e164, active_role
) ON public.profiles TO authenticated;

-- Helper so the owner can still fetch their own whatsapp without column SELECT.
CREATE OR REPLACE FUNCTION public.get_my_whatsapp()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT whatsapp_e164 FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_whatsapp() TO authenticated;
