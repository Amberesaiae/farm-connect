
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- TRUST GATES
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS id_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS id_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS business_licensed boolean NOT NULL DEFAULT false;

UPDATE public.profiles
SET id_verified = true, id_verified_at = COALESCE(id_verified_at, now())
WHERE badge_tier IN ('verified','trusted','top_seller') AND id_verified = false;

CREATE OR REPLACE FUNCTION public.tg_sync_id_verified()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE public.profiles
    SET id_verified = true, id_verified_at = COALESCE(id_verified_at, now())
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS sync_id_verified ON public.verification_submissions;
CREATE TRIGGER sync_id_verified AFTER UPDATE ON public.verification_submissions
FOR EACH ROW EXECUTE FUNCTION public.tg_sync_id_verified();

CREATE OR REPLACE FUNCTION public.tg_sync_business_licensed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status::text = 'approved' AND (OLD.status::text IS DISTINCT FROM NEW.status::text) THEN
    UPDATE public.profiles SET business_licensed = true WHERE id = NEW.owner_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS sync_business_licensed_hatcheries ON public.hatcheries;
CREATE TRIGGER sync_business_licensed_hatcheries AFTER UPDATE ON public.hatcheries
FOR EACH ROW EXECUTE FUNCTION public.tg_sync_business_licensed();
DROP TRIGGER IF EXISTS sync_business_licensed_stores ON public.agro_vendor_stores;
CREATE TRIGGER sync_business_licensed_stores AFTER UPDATE ON public.agro_vendor_stores
FOR EACH ROW EXECUTE FUNCTION public.tg_sync_business_licensed();

-- ROLE HELPERS
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles))
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin'::app_role, 'moderator'::app_role)
  )
$$;

CREATE OR REPLACE FUNCTION public.current_role_set()
RETURNS app_role[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(array_agg(role), ARRAY[]::app_role[])
  FROM public.user_roles WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.current_trust()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'phone_verified', COALESCE(p.phone_verified, false),
    'id_verified', COALESCE(p.id_verified, false),
    'business_licensed', COALESCE(p.business_licensed, false)
  )
  FROM public.profiles p WHERE p.id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.owns_listing(_user_id uuid, _listing_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.listings WHERE id = _listing_id AND seller_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.owns_service_profile(_user_id uuid, _profile_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.service_profiles WHERE id = _profile_id AND owner_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.owns_store(_user_id uuid, _store_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.agro_vendor_stores WHERE id = _store_id AND owner_id = _user_id)
$$;

-- HANDLE_NEW_USER + BACKFILL ROLES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'buyer'::app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT owner_id, 'hatchery_owner'::app_role
FROM public.hatcheries WHERE owner_id IS NOT NULL AND status = 'approved'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT owner_id, 'agro_vendor'::app_role
FROM public.agro_vendor_stores WHERE owner_id IS NOT NULL AND status = 'approved'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT owner_id, 'service_provider'::app_role
FROM public.service_profiles WHERE owner_id IS NOT NULL AND is_active = true
ON CONFLICT (user_id, role) DO NOTHING;

-- ANTI-ABUSE TABLES
CREATE TABLE IF NOT EXISTS public.rate_limits (
  scope text NOT NULL, key text NOT NULL, window_start timestamptz NOT NULL,
  count int NOT NULL DEFAULT 0, PRIMARY KEY (scope, key, window_start)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.listing_view_throttle (
  listing_id uuid NOT NULL, ip_hash bytea NOT NULL, hour_bucket timestamptz NOT NULL,
  PRIMARY KEY (listing_id, ip_hash, hour_bucket)
);
ALTER TABLE public.listing_view_throttle ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.phone_otps (
  user_id uuid NOT NULL, phone_e164 text NOT NULL, code_hash text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(), attempts int NOT NULL DEFAULT 0,
  consumed_at timestamptz, PRIMARY KEY (user_id, sent_at)
);
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_kind text NOT NULL CHECK (target_kind IN ('listing','hatchery','agro_store','service_profile','profile')),
  target_id uuid NOT NULL,
  reason text NOT NULL, details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','actioned','dismissed')),
  resolved_by uuid, resolved_at timestamptz, resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports authed insert" ON public.reports;
CREATE POLICY "reports authed insert" ON public.reports FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports staff or reporter read" ON public.reports;
CREATE POLICY "reports staff or reporter read" ON public.reports FOR SELECT
USING (public.is_staff(auth.uid()) OR auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports staff update" ON public.reports;
CREATE POLICY "reports staff update" ON public.reports FOR UPDATE
USING (public.is_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports (target_kind, target_id);

-- ANTI-ABUSE RPCs
CREATE OR REPLACE FUNCTION public.record_listing_view(_listing_id uuid, _ip_hash bytea DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_hour timestamptz := date_trunc('hour', now());
  v_inserted_count int := 0;
BEGIN
  IF _ip_hash IS NOT NULL THEN
    INSERT INTO public.listing_view_throttle (listing_id, ip_hash, hour_bucket)
    VALUES (_listing_id, _ip_hash, v_hour) ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
    IF v_inserted_count = 0 THEN
      RETURN jsonb_build_object('ok', true, 'counted', false);
    END IF;
  END IF;

  INSERT INTO public.listing_events (listing_id, event_type, actor_id)
  VALUES (_listing_id, 'view', auth.uid());

  UPDATE public.listings SET view_count = view_count + 1 WHERE id = _listing_id;

  RETURN jsonb_build_object('ok', true, 'counted', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.reveal_contact(_listing_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_phone_verified boolean;
  v_seller_id uuid;
  v_seller_phone text;
  v_today timestamptz := date_trunc('day', now());
  v_count int;
  v_cap int := 30;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHENTICATED');
  END IF;

  SELECT phone_verified INTO v_phone_verified FROM public.profiles WHERE id = v_uid;
  IF NOT COALESCE(v_phone_verified, false) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'PHONE_VERIFICATION_REQUIRED');
  END IF;

  SELECT seller_id INTO v_seller_id FROM public.listings WHERE id = _listing_id;
  IF v_seller_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_FOUND');
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.listing_events
  WHERE actor_id = v_uid AND event_type = 'contact_whatsapp' AND created_at >= v_today;

  IF v_count >= v_cap THEN
    RETURN jsonb_build_object('ok', false, 'code', 'RATE_LIMITED', 'retryAfterSec', 86400);
  END IF;

  SELECT whatsapp_e164 INTO v_seller_phone FROM public.profiles WHERE id = v_seller_id;

  INSERT INTO public.listing_events (listing_id, event_type, actor_id)
  VALUES (_listing_id, 'contact_whatsapp', v_uid);

  UPDATE public.listings SET contact_count = contact_count + 1 WHERE id = _listing_id;

  RETURN jsonb_build_object('ok', true, 'whatsapp_e164', v_seller_phone);
END;
$$;

CREATE OR REPLACE FUNCTION public.report_content(_kind text, _id uuid, _reason text, _details text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHENTICATED'); END IF;
  IF _kind NOT IN ('listing','hatchery','agro_store','service_profile','profile') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'VALIDATION');
  END IF;
  INSERT INTO public.reports (reporter_id, target_kind, target_id, reason, details)
  VALUES (v_uid, _kind, _id, _reason, _details) RETURNING id INTO v_id;
  RETURN jsonb_build_object('ok', true, 'id', v_id);
END;
$$;

-- LISTING QUOTAS
CREATE OR REPLACE FUNCTION public.assert_listing_quota()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_phone boolean; v_id boolean; v_active int; v_cap int;
BEGIN
  IF public.is_staff(NEW.seller_id) THEN RETURN NEW; END IF;

  SELECT phone_verified, id_verified INTO v_phone, v_id
  FROM public.profiles WHERE id = NEW.seller_id;

  IF NOT COALESCE(v_phone, false) THEN
    RAISE EXCEPTION 'PHONE_VERIFICATION_REQUIRED: posting requires a verified phone number'
      USING ERRCODE = 'check_violation';
  END IF;

  IF public.has_any_role(NEW.seller_id, ARRAY['agro_vendor','hatchery_owner','service_provider']::app_role[]) THEN
    RETURN NEW;
  END IF;

  v_cap := CASE WHEN COALESCE(v_id, false) THEN 100 ELSE 30 END;

  SELECT COUNT(*) INTO v_active FROM public.listings
  WHERE seller_id = NEW.seller_id AND status = 'active';

  IF v_active >= v_cap THEN
    RAISE EXCEPTION 'LISTING_QUOTA_EXCEEDED: active listings cap % reached', v_cap
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_listing_quota ON public.listings;
CREATE TRIGGER enforce_listing_quota BEFORE INSERT ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.assert_listing_quota();

-- PUBLIC PROFILES VIEW
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, display_name, avatar_url, region, district,
       badge_tier, listing_count, trade_count, id_verified, created_at
FROM public.profiles WHERE status = 'active';
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- AUDIT (guard inside the function; no WHEN clauses with TG_OP)
CREATE OR REPLACE FUNCTION public.tg_admin_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row_id text; v_before jsonb; v_after jsonb; v_action text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_before := to_jsonb(OLD);
    v_after := NULL;
    v_row_id := COALESCE((v_before->>'id'), 'unknown');
    v_action := 'delete';
  ELSIF TG_OP = 'UPDATE' THEN
    v_before := to_jsonb(OLD);
    v_after := to_jsonb(NEW);
    v_row_id := COALESCE((v_after->>'id'), 'unknown');
    v_action := 'update';
  ELSE
    v_after := to_jsonb(NEW);
    v_row_id := COALESCE((v_after->>'id'), 'unknown');
    v_action := 'insert';
  END IF;

  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.admin_audit_logs (actor_id, action, target_type, target_id, metadata)
    VALUES (auth.uid(), TG_TABLE_NAME || '.' || v_action, TG_TABLE_NAME, v_row_id,
            jsonb_build_object('before', v_before, 'after', v_after));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Status-change-only audit triggers, using WHEN clauses on row columns only
DROP TRIGGER IF EXISTS audit_listings_update ON public.listings;
CREATE TRIGGER audit_listings_update AFTER UPDATE ON public.listings
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS audit_listings_delete ON public.listings;
CREATE TRIGGER audit_listings_delete AFTER DELETE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS audit_hatcheries_update ON public.hatcheries;
CREATE TRIGGER audit_hatcheries_update AFTER UPDATE ON public.hatcheries
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS audit_hatcheries_delete ON public.hatcheries;
CREATE TRIGGER audit_hatcheries_delete AFTER DELETE ON public.hatcheries
FOR EACH ROW EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS audit_agro_stores_update ON public.agro_vendor_stores;
CREATE TRIGGER audit_agro_stores_update AFTER UPDATE ON public.agro_vendor_stores
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS audit_agro_stores_delete ON public.agro_vendor_stores;
CREATE TRIGGER audit_agro_stores_delete AFTER DELETE ON public.agro_vendor_stores
FOR EACH ROW EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS audit_service_profiles_update ON public.service_profiles;
CREATE TRIGGER audit_service_profiles_update AFTER UPDATE ON public.service_profiles
FOR EACH ROW WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS audit_service_profiles_delete ON public.service_profiles;
CREATE TRIGGER audit_service_profiles_delete AFTER DELETE ON public.service_profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS audit_verifications ON public.verification_submissions;
CREATE TRIGGER audit_verifications AFTER UPDATE ON public.verification_submissions
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tg_admin_audit();

DROP TRIGGER IF EXISTS audit_profiles_status ON public.profiles;
CREATE TRIGGER audit_profiles_status AFTER UPDATE ON public.profiles
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.badge_tier IS DISTINCT FROM NEW.badge_tier)
EXECUTE FUNCTION public.tg_admin_audit();

-- Keep admin direct-insert path on audit log
DROP POLICY IF EXISTS "audit logs admin insert" ON public.admin_audit_logs;
CREATE POLICY "audit logs admin insert" ON public.admin_audit_logs FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = actor_id);

-- RLS REVISIONS
DROP POLICY IF EXISTS "events insert view anon" ON public.listing_events;

DROP POLICY IF EXISTS "listings owner update" ON public.listings;
CREATE POLICY "listings owner or staff update" ON public.listings FOR UPDATE
USING (auth.uid() = seller_id OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "listings owner delete" ON public.listings;
CREATE POLICY "listings owner or admin delete" ON public.listings FOR DELETE
USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "hatcheries owner insert" ON public.hatcheries;
CREATE POLICY "hatcheries owner insert id verified" ON public.hatcheries FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND id_verified = true)
);

DROP POLICY IF EXISTS "agro stores owner insert" ON public.agro_vendor_stores;
CREATE POLICY "agro stores owner insert id verified" ON public.agro_vendor_stores FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND id_verified = true)
);

DROP POLICY IF EXISTS "service profiles owner insert" ON public.service_profiles;
CREATE POLICY "service profiles owner insert id verified" ON public.service_profiles FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND id_verified = true)
);

CREATE OR REPLACE FUNCTION public.tg_guard_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status::text = 'approved'
     AND COALESCE(OLD.status::text, '') <> 'approved'
     AND NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'FORBIDDEN: only moderators or admins may approve'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_hatchery_approval ON public.hatcheries;
CREATE TRIGGER guard_hatchery_approval BEFORE UPDATE ON public.hatcheries
FOR EACH ROW EXECUTE FUNCTION public.tg_guard_approval();

DROP TRIGGER IF EXISTS guard_store_approval ON public.agro_vendor_stores;
CREATE TRIGGER guard_store_approval BEFORE UPDATE ON public.agro_vendor_stores
FOR EACH ROW EXECUTE FUNCTION public.tg_guard_approval();

CREATE UNIQUE INDEX IF NOT EXISTS uniq_saved_user_listing
ON public.saved_listings (user_id, listing_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_open_verification
ON public.verification_submissions (user_id) WHERE status = 'pending';

-- PHONE OTP RPCs
CREATE OR REPLACE FUNCTION public.send_phone_otp(_phone_e164 text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_recent int; v_code text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHENTICATED'); END IF;
  IF _phone_e164 !~ '^\+[1-9][0-9]{6,14}$' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'VALIDATION');
  END IF;

  SELECT COUNT(*) INTO v_recent FROM public.phone_otps
  WHERE user_id = v_uid AND sent_at > now() - interval '1 hour';
  IF v_recent >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'RATE_LIMITED', 'retryAfterSec', 3600);
  END IF;

  v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');

  INSERT INTO public.phone_otps (user_id, phone_e164, code_hash)
  VALUES (v_uid, _phone_e164, encode(digest(v_code, 'sha256'), 'hex'));

  RETURN jsonb_build_object('ok', true, 'sent_at', now(), 'debug_code', v_code);
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_phone_otp(_phone_e164 text, _code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_row record; v_hash text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHENTICATED'); END IF;

  v_hash := encode(digest(_code, 'sha256'), 'hex');

  SELECT * INTO v_row FROM public.phone_otps
  WHERE user_id = v_uid AND phone_e164 = _phone_e164 AND consumed_at IS NULL
    AND sent_at > now() - interval '15 minutes'
  ORDER BY sent_at DESC LIMIT 1;

  IF v_row IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'OTP_EXPIRED'); END IF;
  IF v_row.attempts >= 5 THEN RETURN jsonb_build_object('ok', false, 'code', 'RATE_LIMITED'); END IF;

  IF v_row.code_hash <> v_hash THEN
    UPDATE public.phone_otps SET attempts = attempts + 1
    WHERE user_id = v_uid AND sent_at = v_row.sent_at;
    RETURN jsonb_build_object('ok', false, 'code', 'OTP_INVALID');
  END IF;

  UPDATE public.phone_otps SET consumed_at = now()
  WHERE user_id = v_uid AND sent_at = v_row.sent_at;

  UPDATE public.profiles
  SET phone_verified = true, phone_verified_at = now(),
      whatsapp_e164 = COALESCE(whatsapp_e164, _phone_e164)
  WHERE id = v_uid;

  RETURN jsonb_build_object('ok', true);
END;
$$;
