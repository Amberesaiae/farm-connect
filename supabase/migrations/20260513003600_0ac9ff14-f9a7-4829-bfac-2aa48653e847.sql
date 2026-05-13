-- ============================================================
-- Phase 6 — security, audit, rate-limit hardening
-- ============================================================

-- ---------- 1. Restrict profiles contact column ----------
DROP POLICY IF EXISTS "profiles read all" ON public.profiles;

CREATE POLICY "profiles self or staff read"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR public.is_staff(auth.uid())
);

-- Replace public_profiles view with a contact-free projection
DROP VIEW IF EXISTS public.public_profiles CASCADE;

CREATE VIEW public.public_profiles
WITH (security_invoker = false)
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

-- ---------- 2. Attach admin audit triggers ----------
DROP TRIGGER IF EXISTS tg_listings_admin_audit ON public.listings;
CREATE TRIGGER tg_listings_admin_audit
AFTER UPDATE OF status ON public.listings
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS tg_hatcheries_admin_audit ON public.hatcheries;
CREATE TRIGGER tg_hatcheries_admin_audit
AFTER UPDATE OF status ON public.hatcheries
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS tg_agro_stores_admin_audit ON public.agro_vendor_stores;
CREATE TRIGGER tg_agro_stores_admin_audit
AFTER UPDATE OF status ON public.agro_vendor_stores
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS tg_service_profiles_admin_audit ON public.service_profiles;
CREATE TRIGGER tg_service_profiles_admin_audit
AFTER UPDATE OF is_active ON public.service_profiles
FOR EACH ROW WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS tg_profiles_admin_audit ON public.profiles;
CREATE TRIGGER tg_profiles_admin_audit
AFTER UPDATE OF status ON public.profiles
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS tg_user_roles_admin_audit ON public.user_roles;
CREATE TRIGGER tg_user_roles_admin_audit
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS tg_verifications_admin_audit ON public.verification_submissions;
CREATE TRIGGER tg_verifications_admin_audit
AFTER UPDATE OF status ON public.verification_submissions
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS tg_reports_admin_audit ON public.reports;
CREATE TRIGGER tg_reports_admin_audit
AFTER UPDATE OF status ON public.reports
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tg_admin_audit();

-- ---------- 3. Rate-limit helper ----------
CREATE UNIQUE INDEX IF NOT EXISTS rate_limits_pk
  ON public.rate_limits (scope, key, window_start);

CREATE OR REPLACE FUNCTION public.rate_limit_hit(
  _scope text,
  _key text,
  _max int,
  _window_sec int
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz := date_bin(make_interval(secs => _window_sec), now(), 'epoch'::timestamptz);
  v_count int;
BEGIN
  INSERT INTO public.rate_limits (scope, key, window_start, count)
  VALUES (_scope, _key, v_window_start, 1)
  ON CONFLICT (scope, key, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_count;

  IF v_count > _max THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'RATE_LIMITED',
      'retryAfterSec', _window_sec,
      'count', v_count
    );
  END IF;

  RETURN jsonb_build_object('ok', true, 'count', v_count);
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_hit(text, text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(text, text, int, int) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.rate_limit_gc()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH d AS (
    DELETE FROM public.rate_limits WHERE window_start < now() - interval '7 days' RETURNING 1
  ) SELECT COUNT(*)::int FROM d;
$$;
REVOKE ALL ON FUNCTION public.rate_limit_gc() FROM PUBLIC;

-- ---------- 4. Single-roundtrip session helper ----------
CREATE OR REPLACE FUNCTION public.my_session()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    ELSE jsonb_build_object(
      'user_id', auth.uid(),
      'roles', COALESCE(
        (SELECT array_agg(role) FROM public.user_roles WHERE user_id = auth.uid()),
        ARRAY[]::app_role[]
      ),
      'trust', (
        SELECT jsonb_build_object(
          'phone_verified', COALESCE(phone_verified, false),
          'id_verified', COALESCE(id_verified, false),
          'business_licensed', COALESCE(business_licensed, false),
          'status', status
        ) FROM public.profiles WHERE id = auth.uid()
      )
    )
  END;
$$;
GRANT EXECUTE ON FUNCTION public.my_session() TO authenticated, anon;
