-- 1) Performance index for the licence check
CREATE INDEX IF NOT EXISTS idx_agro_vendor_stores_owner_pillar_status
  ON public.agro_vendor_stores (owner_id, pillar, status, is_active);

-- 2) Per-pillar licence gate on listing insert
CREATE OR REPLACE FUNCTION public.assert_listing_licence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requires boolean;
  v_has_store boolean;
BEGIN
  -- Staff bypass
  IF public.is_staff(NEW.seller_id) THEN
    RETURN NEW;
  END IF;

  SELECT requires_licence INTO v_requires
  FROM public.market_pillars
  WHERE slug = NEW.top_category;

  IF NOT COALESCE(v_requires, false) THEN
    RETURN NEW;
  END IF;

  -- Pillar requires a licence: must have an approved+active store for this pillar
  SELECT EXISTS (
    SELECT 1 FROM public.agro_vendor_stores s
    WHERE s.owner_id = NEW.seller_id
      AND s.pillar   = NEW.top_category
      AND s.status   = 'approved'
      AND s.is_active = true
      AND COALESCE(s.licence_doc_path, '') <> ''
  ) INTO v_has_store;

  IF NOT v_has_store THEN
    RAISE EXCEPTION 'BUSINESS_LICENCE_REQUIRED: pillar % requires an approved licensed vendor store', NEW.top_category
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_listings_assert_licence ON public.listings;
CREATE TRIGGER tr_listings_assert_licence
BEFORE INSERT ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.assert_listing_licence();

-- 3) UI helper: can this user post in this pillar?
CREATE OR REPLACE FUNCTION public.user_can_post_pillar(_user_id uuid, _pillar text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone boolean; v_id boolean; v_requires boolean; v_has_store boolean;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHENTICATED');
  END IF;

  IF public.is_staff(_user_id) THEN
    RETURN jsonb_build_object('ok', true);
  END IF;

  SELECT phone_verified, id_verified INTO v_phone, v_id
  FROM public.profiles WHERE id = _user_id;

  IF NOT COALESCE(v_phone, false) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'PHONE_VERIFICATION_REQUIRED');
  END IF;

  SELECT requires_licence INTO v_requires
  FROM public.market_pillars WHERE slug = _pillar;

  IF COALESCE(v_requires, false) THEN
    SELECT EXISTS (
      SELECT 1 FROM public.agro_vendor_stores s
      WHERE s.owner_id = _user_id
        AND s.pillar   = _pillar
        AND s.status   = 'approved'
        AND s.is_active = true
        AND COALESCE(s.licence_doc_path, '') <> ''
    ) INTO v_has_store;
    IF NOT v_has_store THEN
      RETURN jsonb_build_object('ok', false, 'code', 'BUSINESS_LICENCE_REQUIRED');
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 4) UI helper: cap + active count for the caller
CREATE OR REPLACE FUNCTION public.vendor_listing_caps()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_phone boolean; v_id boolean;
  v_active int;
  v_cap int;
  v_unlimited boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('cap', 0, 'active', 0, 'unlimited', false, 'why', 'UNAUTHENTICATED');
  END IF;

  IF public.is_staff(v_uid)
     OR public.has_any_role(v_uid, ARRAY['agro_vendor','hatchery_owner','service_provider']::app_role[]) THEN
    v_unlimited := true;
  END IF;

  SELECT phone_verified, id_verified INTO v_phone, v_id
  FROM public.profiles WHERE id = v_uid;

  v_cap := CASE
    WHEN v_unlimited THEN NULL
    WHEN COALESCE(v_id, false) THEN 100
    WHEN COALESCE(v_phone, false) THEN 30
    ELSE 0
  END;

  SELECT COUNT(*) INTO v_active
  FROM public.listings WHERE seller_id = v_uid AND status = 'active';

  RETURN jsonb_build_object(
    'cap', v_cap,
    'active', v_active,
    'unlimited', v_unlimited,
    'phone_verified', COALESCE(v_phone, false),
    'id_verified', COALESCE(v_id, false)
  );
END;
$$;

-- 5) Make sure approving a vendor store auto-grants the agro_vendor role.
CREATE OR REPLACE FUNCTION public.tg_grant_vendor_role_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status::text = 'approved' AND (OLD.status::text IS DISTINCT FROM NEW.status::text)
     AND NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.owner_id, 'agro_vendor'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_agro_stores_grant_vendor_role ON public.agro_vendor_stores;
CREATE TRIGGER tr_agro_stores_grant_vendor_role
AFTER UPDATE OF status ON public.agro_vendor_stores
FOR EACH ROW EXECUTE FUNCTION public.tg_grant_vendor_role_on_approval();

-- Same for hatcheries / service_profiles
CREATE OR REPLACE FUNCTION public.tg_grant_hatchery_role_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status::text = 'approved' AND (OLD.status::text IS DISTINCT FROM NEW.status::text)
     AND NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.owner_id, 'hatchery_owner'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_hatcheries_grant_role ON public.hatcheries;
CREATE TRIGGER tr_hatcheries_grant_role
AFTER UPDATE OF status ON public.hatcheries
FOR EACH ROW EXECUTE FUNCTION public.tg_grant_hatchery_role_on_approval();

CREATE OR REPLACE FUNCTION public.tg_grant_provider_role_on_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active = true AND (TG_OP = 'INSERT' OR OLD.is_active IS DISTINCT FROM NEW.is_active)
     AND NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.owner_id, 'service_provider'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_service_profiles_grant_role ON public.service_profiles;
CREATE TRIGGER tr_service_profiles_grant_role
AFTER INSERT OR UPDATE OF is_active ON public.service_profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_grant_provider_role_on_active();