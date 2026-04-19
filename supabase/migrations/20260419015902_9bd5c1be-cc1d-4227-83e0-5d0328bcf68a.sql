-- =========================================================
-- Unified Vendor Stores migration (retry)
-- =========================================================

ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'agro_store_approved';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'agro_store_rejected';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'agro_store_suspended';

DO $$ BEGIN
  CREATE TYPE public.agro_store_status AS ENUM (
    'draft','pending_review','approved','suspended','rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.hatcheries
  ADD COLUMN IF NOT EXISTS logo_path text,
  ADD COLUMN IF NOT EXISTS phone_e164 text,
  ADD COLUMN IF NOT EXISTS business_hours jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.service_profiles
  ADD COLUMN IF NOT EXISTS logo_path text,
  ADD COLUMN IF NOT EXISTS phone_e164 text,
  ADD COLUMN IF NOT EXISTS business_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS district text;

CREATE TABLE IF NOT EXISTS public.agro_vendor_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  business_name text NOT NULL,
  pillar text NOT NULL CHECK (pillar IN ('agrofeed_supplements','agromed_veterinary','agro_equipment_tools')),
  blurb text,
  cover_path text,
  logo_path text,
  region text NOT NULL,
  district text,
  address text,
  whatsapp_e164 text,
  phone_e164 text,
  email text,
  business_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  delivers boolean NOT NULL DEFAULT false,
  delivery_regions text[] NOT NULL DEFAULT '{}'::text[],
  min_order_ghs numeric,
  business_reg_number text,
  vsd_licence_number text,
  licence_doc_path text,
  status public.agro_store_status NOT NULL DEFAULT 'draft',
  approved_by uuid,
  approved_at timestamptz,
  rejection_reason text,
  is_active boolean NOT NULL DEFAULT true,
  badge_tier text NOT NULL DEFAULT 'none',
  listing_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agro_stores_owner_idx ON public.agro_vendor_stores(owner_id);
CREATE INDEX IF NOT EXISTS agro_stores_pillar_idx ON public.agro_vendor_stores(pillar);
CREATE INDEX IF NOT EXISTS agro_stores_status_idx ON public.agro_vendor_stores(status);
CREATE INDEX IF NOT EXISTS agro_stores_region_idx ON public.agro_vendor_stores(region);

ALTER TABLE public.agro_vendor_stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agro stores public read approved" ON public.agro_vendor_stores;
CREATE POLICY "agro stores public read approved"
  ON public.agro_vendor_stores FOR SELECT
  USING (
    (status = 'approved' AND is_active = true)
    OR auth.uid() = owner_id
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "agro stores owner insert" ON public.agro_vendor_stores;
CREATE POLICY "agro stores owner insert"
  ON public.agro_vendor_stores FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "agro stores owner update" ON public.agro_vendor_stores;
CREATE POLICY "agro stores owner update"
  ON public.agro_vendor_stores FOR UPDATE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "agro stores admin delete" ON public.agro_vendor_stores;
CREATE POLICY "agro stores admin delete"
  ON public.agro_vendor_stores FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS agro_stores_touch_updated ON public.agro_vendor_stores;
CREATE TRIGGER agro_stores_touch_updated
  BEFORE UPDATE ON public.agro_vendor_stores
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.check_vendor_slug_unique()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME <> 'hatcheries' AND EXISTS (SELECT 1 FROM public.hatcheries WHERE slug = NEW.slug) THEN
    RAISE EXCEPTION 'SLUG_TAKEN: % already used by a hatchery', NEW.slug;
  END IF;
  IF TG_TABLE_NAME <> 'service_profiles' AND EXISTS (SELECT 1 FROM public.service_profiles WHERE slug = NEW.slug) THEN
    RAISE EXCEPTION 'SLUG_TAKEN: % already used by a service profile', NEW.slug;
  END IF;
  IF TG_TABLE_NAME <> 'agro_vendor_stores' AND EXISTS (SELECT 1 FROM public.agro_vendor_stores WHERE slug = NEW.slug) THEN
    RAISE EXCEPTION 'SLUG_TAKEN: % already used by an agro store', NEW.slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hatcheries_slug_unique ON public.hatcheries;
CREATE TRIGGER hatcheries_slug_unique
  BEFORE INSERT OR UPDATE OF slug ON public.hatcheries
  FOR EACH ROW EXECUTE FUNCTION public.check_vendor_slug_unique();

DROP TRIGGER IF EXISTS service_profiles_slug_unique ON public.service_profiles;
CREATE TRIGGER service_profiles_slug_unique
  BEFORE INSERT OR UPDATE OF slug ON public.service_profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_vendor_slug_unique();

DROP TRIGGER IF EXISTS agro_stores_slug_unique ON public.agro_vendor_stores;
CREATE TRIGGER agro_stores_slug_unique
  BEFORE INSERT OR UPDATE OF slug ON public.agro_vendor_stores
  FOR EACH ROW EXECUTE FUNCTION public.check_vendor_slug_unique();

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS vendor_store_id uuid;

CREATE INDEX IF NOT EXISTS listings_vendor_store_idx ON public.listings(vendor_store_id);

CREATE OR REPLACE FUNCTION public.autolink_listing_to_store()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id uuid;
BEGIN
  IF NEW.vendor_store_id IS NULL
     AND NEW.top_category IN ('agrofeed_supplements','agromed_veterinary','agro_equipment_tools') THEN
    SELECT id INTO v_store_id
    FROM public.agro_vendor_stores
    WHERE owner_id = NEW.seller_id
      AND pillar = NEW.top_category
      AND status = 'approved'
      AND is_active = true
    LIMIT 1;
    IF v_store_id IS NOT NULL THEN
      NEW.vendor_store_id := v_store_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listings_autolink_store ON public.listings;
CREATE TRIGGER listings_autolink_store
  BEFORE INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.autolink_listing_to_store();

CREATE OR REPLACE FUNCTION public.bump_store_listing_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.vendor_store_id IS NOT NULL THEN
    UPDATE public.agro_vendor_stores SET listing_count = listing_count + 1 WHERE id = NEW.vendor_store_id;
  ELSIF TG_OP = 'DELETE' AND OLD.vendor_store_id IS NOT NULL THEN
    UPDATE public.agro_vendor_stores SET listing_count = GREATEST(0, listing_count - 1) WHERE id = OLD.vendor_store_id;
  ELSIF TG_OP = 'UPDATE' AND COALESCE(OLD.vendor_store_id::text,'') <> COALESCE(NEW.vendor_store_id::text,'') THEN
    IF OLD.vendor_store_id IS NOT NULL THEN
      UPDATE public.agro_vendor_stores SET listing_count = GREATEST(0, listing_count - 1) WHERE id = OLD.vendor_store_id;
    END IF;
    IF NEW.vendor_store_id IS NOT NULL THEN
      UPDATE public.agro_vendor_stores SET listing_count = listing_count + 1 WHERE id = NEW.vendor_store_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS listings_bump_store_count ON public.listings;
CREATE TRIGGER listings_bump_store_count
  AFTER INSERT OR UPDATE OR DELETE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.bump_store_listing_count();

CREATE OR REPLACE VIEW public.vendor_stores_v AS
  SELECT
    'hatchery'::text AS store_kind,
    h.id, h.owner_id, h.slug, h.name AS name,
    h.category::text AS pillar_or_category,
    h.region, h.district, h.cover_path, h.logo_path, h.blurb,
    'none'::text AS badge_tier,
    (h.status = 'approved') AS is_public,
    h.created_at
  FROM public.hatcheries h
  WHERE h.status = 'approved'
  UNION ALL
  SELECT
    'service'::text, s.id, s.owner_id, s.slug, s.business_name,
    s.category, s.region, s.district, s.cover_path, s.logo_path, s.blurb, s.badge_tier,
    (s.is_active = true), s.created_at
  FROM public.service_profiles s
  WHERE s.is_active = true
  UNION ALL
  SELECT
    'agro'::text, a.id, a.owner_id, a.slug, a.business_name,
    a.pillar, a.region, a.district, a.cover_path, a.logo_path, a.blurb, a.badge_tier,
    (a.status = 'approved' AND a.is_active = true), a.created_at
  FROM public.agro_vendor_stores a
  WHERE a.status = 'approved' AND a.is_active = true;

GRANT SELECT ON public.vendor_stores_v TO anon, authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-licences','vendor-licences', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "vendor licences owner read" ON storage.objects;
CREATE POLICY "vendor licences owner read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vendor-licences'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin'))
  );

DROP POLICY IF EXISTS "vendor licences owner write" ON storage.objects;
CREATE POLICY "vendor licences owner write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-licences'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "vendor licences owner update" ON storage.objects;
CREATE POLICY "vendor licences owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vendor-licences'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );