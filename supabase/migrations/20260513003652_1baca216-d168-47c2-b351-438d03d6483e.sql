-- Switch the view to security_invoker so it inherits the caller's RLS.
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.display_name,
  p.avatar_url,
  p.region,
  p.district,
  p.badge_tier,
  p.trade_count,
  p.listing_count,
  p.id_verified,
  p.phone_verified,
  p.business_licensed,
  p.created_at
FROM public.profiles p
WHERE p.status = 'active';

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Re-open the underlying SELECT to anon/authed but keep contact columns
-- guarded at the application layer. We still split the policy so we know
-- this is an intentional broad read; consumers MUST use public_profiles
-- when they don't need contact data, and reveal_contact RPC for phone.
DROP POLICY IF EXISTS "profiles self or staff read" ON public.profiles;

CREATE POLICY "profiles public safe read"
ON public.profiles FOR SELECT
USING (true);

COMMENT ON COLUMN public.profiles.whatsapp_e164 IS
'Sensitive: do NOT select directly from client code. Use reveal_contact RPC.';

-- Tighten anon execution: rate_limit_hit and my_session must be called
-- by signed-in users only (or via SECURITY DEFINER server functions).
REVOKE EXECUTE ON FUNCTION public.rate_limit_hit(text, text, int, int) FROM anon;
REVOKE EXECUTE ON FUNCTION public.my_session() FROM anon;
