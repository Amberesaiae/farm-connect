-- ============================================================================
-- 1. EXTEND ENUMS (additive)
-- ============================================================================

-- Extend notification_type enum with new event types
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'reservation_received';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'reservation_confirmed';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'reservation_waitlisted';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'reservation_cancelled';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'reservation_fulfilled';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'service_request_received';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'service_request_responded';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'listing_hidden_by_admin';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'hatchery_approved';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'hatchery_rejected';

-- ============================================================================
-- 2. NEW ENUMS
-- ============================================================================

CREATE TYPE public.hatchery_status AS ENUM (
  'draft', 'pending_review', 'approved', 'suspended', 'rejected'
);

CREATE TYPE public.hatchery_category AS ENUM (
  'poultry', 'fish', 'breeding'
);

CREATE TYPE public.batch_status AS ENUM (
  'draft', 'open', 'full', 'closed', 'cancelled'
);

CREATE TYPE public.reservation_status AS ENUM (
  'pending', 'confirmed', 'waitlisted', 'cancelled_by_buyer', 'cancelled_by_hatchery', 'fulfilled'
);

CREATE TYPE public.service_request_status AS ENUM (
  'submitted', 'viewed', 'responded', 'accepted', 'declined', 'expired'
);

CREATE TYPE public.permit_authority AS ENUM (
  'vsd', 'fisheries_commission', 'epa', 'district_assembly', 'other'
);

CREATE TYPE public.fulfilment_mode AS ENUM (
  'pickup', 'delivery'
);

-- ============================================================================
-- 3. EXTEND PROFILES
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS roles text[] NOT NULL DEFAULT ARRAY['buyer']::text[],
  ADD COLUMN IF NOT EXISTS active_role text NOT NULL DEFAULT 'buyer',
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_active_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_active_role_check
  CHECK (active_role IN ('buyer', 'seller', 'provider', 'hatchery', 'admin'));

-- ============================================================================
-- 4. EXTEND LISTINGS (agro categories foundation)
-- ============================================================================

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS top_category text NOT NULL DEFAULT 'livestock',
  ADD COLUMN IF NOT EXISTS subcategory_slug text,
  ADD COLUMN IF NOT EXISTS condition text,
  ADD COLUMN IF NOT EXISTS stock_quantity int,
  ADD COLUMN IF NOT EXISTS min_order_qty int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS expires_on date,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.listings SET top_category = 'livestock' WHERE top_category IS NULL;

ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_top_category_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_top_category_check
  CHECK (top_category IN ('livestock', 'agrofeed_supplements', 'agromed_veterinary', 'agro_equipment_tools'));

ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_condition_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_condition_check
  CHECK (condition IS NULL OR condition IN ('new', 'used', 'refurbished'));

CREATE INDEX IF NOT EXISTS listings_top_category_idx ON public.listings(top_category);
CREATE INDEX IF NOT EXISTS listings_subcategory_idx ON public.listings(subcategory_slug);

-- ============================================================================
-- 5. HATCHERIES
-- ============================================================================

CREATE TABLE public.hatcheries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category public.hatchery_category NOT NULL,
  region text NOT NULL,
  district text,
  address text,
  blurb text,
  cover_path text,
  capacity_per_cycle int,
  whatsapp_e164 text,
  permit_number text,
  permit_authority public.permit_authority,
  permit_doc_path text,
  status public.hatchery_status NOT NULL DEFAULT 'draft',
  rejection_reason text,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX hatcheries_owner_idx ON public.hatcheries(owner_id);
CREATE INDEX hatcheries_status_idx ON public.hatcheries(status);
CREATE INDEX hatcheries_category_idx ON public.hatcheries(category);
CREATE INDEX hatcheries_region_idx ON public.hatcheries(region);

CREATE TRIGGER hatcheries_touch_updated_at
  BEFORE UPDATE ON public.hatcheries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.hatcheries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hatcheries public read approved"
  ON public.hatcheries FOR SELECT
  USING (status = 'approved' OR auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "hatcheries owner insert"
  ON public.hatcheries FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "hatcheries owner update"
  ON public.hatcheries FOR UPDATE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "hatcheries admin delete"
  ON public.hatcheries FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 6. HATCHERY BATCHES
-- ============================================================================

CREATE TABLE public.hatchery_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hatchery_id uuid NOT NULL REFERENCES public.hatcheries(id) ON DELETE CASCADE,
  batch_type text NOT NULL,
  breed text,
  hatch_date date,
  pickup_start_date date NOT NULL,
  pickup_end_date date NOT NULL,
  total_quantity int NOT NULL CHECK (total_quantity > 0),
  reserved_quantity int NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  available_quantity int GENERATED ALWAYS AS (total_quantity - reserved_quantity) STORED,
  min_order_qty int NOT NULL DEFAULT 1 CHECK (min_order_qty > 0),
  price_per_unit numeric NOT NULL CHECK (price_per_unit >= 0),
  unit_label text NOT NULL DEFAULT 'chick',
  region text NOT NULL,
  allows_pickup boolean NOT NULL DEFAULT true,
  allows_delivery boolean NOT NULL DEFAULT false,
  notes text,
  status public.batch_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT batch_qty_consistency CHECK (reserved_quantity <= total_quantity),
  CONSTRAINT batch_pickup_window CHECK (pickup_end_date >= pickup_start_date)
);

CREATE INDEX batches_hatchery_idx ON public.hatchery_batches(hatchery_id);
CREATE INDEX batches_status_idx ON public.hatchery_batches(status);
CREATE INDEX batches_pickup_start_idx ON public.hatchery_batches(pickup_start_date);

CREATE TRIGGER batches_touch_updated_at
  BEFORE UPDATE ON public.hatchery_batches
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.hatchery_batches ENABLE ROW LEVEL SECURITY;

-- Helper: is owner of hatchery
CREATE OR REPLACE FUNCTION public.is_hatchery_owner(_user_id uuid, _hatchery_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.hatcheries WHERE id = _hatchery_id AND owner_id = _user_id)
$$;

-- Helper: owns batch (via hatchery)
CREATE OR REPLACE FUNCTION public.owns_batch(_user_id uuid, _batch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hatchery_batches b
    JOIN public.hatcheries h ON h.id = b.hatchery_id
    WHERE b.id = _batch_id AND h.owner_id = _user_id
  )
$$;

CREATE POLICY "batches public read"
  ON public.hatchery_batches FOR SELECT
  USING (
    (status IN ('open', 'full') AND EXISTS (
      SELECT 1 FROM public.hatcheries h WHERE h.id = hatchery_id AND h.status = 'approved'
    ))
    OR public.is_hatchery_owner(auth.uid(), hatchery_id)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "batches owner write"
  ON public.hatchery_batches FOR ALL
  USING (public.is_hatchery_owner(auth.uid(), hatchery_id) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_hatchery_owner(auth.uid(), hatchery_id) OR public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 7. HATCHERY BATCH PHOTOS
-- ============================================================================

CREATE TABLE public.hatchery_batch_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.hatchery_batches(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX batch_photos_batch_idx ON public.hatchery_batch_photos(batch_id);

ALTER TABLE public.hatchery_batch_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "batch photos read all"
  ON public.hatchery_batch_photos FOR SELECT USING (true);

CREATE POLICY "batch photos owner write"
  ON public.hatchery_batch_photos FOR ALL
  USING (public.owns_batch(auth.uid(), batch_id) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.owns_batch(auth.uid(), batch_id) OR public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 8. BATCH RESERVATIONS
-- ============================================================================

CREATE TABLE public.batch_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.hatchery_batches(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_qty int NOT NULL CHECK (requested_qty > 0),
  confirmed_qty int CHECK (confirmed_qty IS NULL OR confirmed_qty >= 0),
  pickup_date date,
  fulfilment public.fulfilment_mode NOT NULL DEFAULT 'pickup',
  delivery_address text,
  buyer_contact text,
  buyer_note text,
  hatchery_note text,
  status public.reservation_status NOT NULL DEFAULT 'pending',
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  fulfilled_at timestamptz,
  cancelled_at timestamptz,
  UNIQUE (buyer_id, idempotency_key)
);

CREATE INDEX reservations_batch_idx ON public.batch_reservations(batch_id);
CREATE INDEX reservations_buyer_idx ON public.batch_reservations(buyer_id);
CREATE INDEX reservations_status_idx ON public.batch_reservations(status);

CREATE TRIGGER reservations_touch_updated_at
  BEFORE UPDATE ON public.batch_reservations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.batch_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations buyer read own"
  ON public.batch_reservations FOR SELECT
  USING (auth.uid() = buyer_id OR public.owns_batch(auth.uid(), batch_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "reservations buyer insert pending"
  ON public.batch_reservations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id AND status = 'pending');

CREATE POLICY "reservations buyer cancel own"
  ON public.batch_reservations FOR UPDATE
  USING (auth.uid() = buyer_id OR public.owns_batch(auth.uid(), batch_id) OR public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 9. RESERVATION SQL FUNCTIONS (concurrency-safe)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.confirm_reservation(
  _reservation_id uuid,
  _confirmed_qty int
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch_id uuid;
  v_total int;
  v_reserved int;
  v_available int;
  v_old_status public.reservation_status;
  v_owner_id uuid;
BEGIN
  -- Lock the reservation
  SELECT batch_id, status INTO v_batch_id, v_old_status
  FROM public.batch_reservations WHERE id = _reservation_id FOR UPDATE;

  IF v_batch_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_FOUND');
  END IF;

  IF v_old_status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'state', v_old_status);
  END IF;

  -- Lock the batch and check ownership
  SELECT b.total_quantity, b.reserved_quantity, h.owner_id
  INTO v_total, v_reserved, v_owner_id
  FROM public.hatchery_batches b
  JOIN public.hatcheries h ON h.id = b.hatchery_id
  WHERE b.id = v_batch_id FOR UPDATE;

  IF v_owner_id <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'FORBIDDEN');
  END IF;

  v_available := v_total - v_reserved;
  IF _confirmed_qty > v_available THEN
    RETURN jsonb_build_object(
      'ok', false, 'code', 'INVENTORY_EXCEEDED',
      'available', v_available, 'requested', _confirmed_qty
    );
  END IF;

  UPDATE public.batch_reservations
  SET status = 'confirmed', confirmed_qty = _confirmed_qty, confirmed_at = now()
  WHERE id = _reservation_id;

  UPDATE public.hatchery_batches
  SET reserved_quantity = reserved_quantity + _confirmed_qty,
      status = CASE WHEN reserved_quantity + _confirmed_qty >= total_quantity THEN 'full'::batch_status ELSE status END
  WHERE id = v_batch_id;

  RETURN jsonb_build_object('ok', true, 'reservation_id', _reservation_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_reservation(
  _reservation_id uuid,
  _by_hatchery boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch_id uuid;
  v_old_status public.reservation_status;
  v_confirmed_qty int;
  v_owner_id uuid;
  v_buyer_id uuid;
  v_new_status public.reservation_status;
BEGIN
  SELECT batch_id, status, confirmed_qty, buyer_id
  INTO v_batch_id, v_old_status, v_confirmed_qty, v_buyer_id
  FROM public.batch_reservations WHERE id = _reservation_id FOR UPDATE;

  IF v_batch_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_FOUND');
  END IF;

  SELECT h.owner_id INTO v_owner_id
  FROM public.hatchery_batches b
  JOIN public.hatcheries h ON h.id = b.hatchery_id
  WHERE b.id = v_batch_id FOR UPDATE;

  -- Authorization
  IF _by_hatchery THEN
    IF v_owner_id <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
      RETURN jsonb_build_object('ok', false, 'code', 'FORBIDDEN');
    END IF;
    v_new_status := 'cancelled_by_hatchery';
  ELSE
    IF v_buyer_id <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
      RETURN jsonb_build_object('ok', false, 'code', 'FORBIDDEN');
    END IF;
    v_new_status := 'cancelled_by_buyer';
  END IF;

  IF v_old_status IN ('cancelled_by_buyer', 'cancelled_by_hatchery', 'fulfilled') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_STATE');
  END IF;

  UPDATE public.batch_reservations
  SET status = v_new_status, cancelled_at = now()
  WHERE id = _reservation_id;

  -- If was confirmed, give the inventory back
  IF v_old_status = 'confirmed' AND v_confirmed_qty IS NOT NULL THEN
    UPDATE public.hatchery_batches
    SET reserved_quantity = GREATEST(0, reserved_quantity - v_confirmed_qty),
        status = CASE WHEN status = 'full' THEN 'open'::batch_status ELSE status END
    WHERE id = v_batch_id;
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ============================================================================
-- 10. SERVICE PROFILES
-- ============================================================================

CREATE TABLE public.service_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  business_name text NOT NULL,
  category text NOT NULL,
  blurb text,
  coverage_regions text[] NOT NULL DEFAULT '{}',
  coverage_districts text[] NOT NULL DEFAULT '{}',
  pricing_model text,
  base_rate_ghs numeric,
  whatsapp_e164 text,
  email text,
  cover_path text,
  badge_tier text NOT NULL DEFAULT 'none',
  rating_avg numeric NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX service_profiles_owner_idx ON public.service_profiles(owner_id);
CREATE INDEX service_profiles_category_idx ON public.service_profiles(category);
CREATE INDEX service_profiles_active_idx ON public.service_profiles(is_active);

CREATE TRIGGER service_profiles_touch_updated_at
  BEFORE UPDATE ON public.service_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.service_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service profiles public read active"
  ON public.service_profiles FOR SELECT
  USING (
    is_active = true
    OR auth.uid() = owner_id
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "service profiles owner insert"
  ON public.service_profiles FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "service profiles owner update"
  ON public.service_profiles FOR UPDATE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "service profiles admin delete"
  ON public.service_profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 11. SERVICE REQUESTS (quote inbox)
-- ============================================================================

CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_profile_id uuid NOT NULL REFERENCES public.service_profiles(id) ON DELETE CASCADE,
  provider_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  region text NOT NULL,
  district text,
  preferred_date date,
  preferred_window text,
  budget_min_ghs numeric,
  budget_max_ghs numeric,
  notes text,
  buyer_contact text,
  provider_response text,
  responded_price_ghs numeric,
  status public.service_request_status NOT NULL DEFAULT 'submitted',
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  UNIQUE (buyer_id, idempotency_key)
);

CREATE INDEX service_requests_provider_idx ON public.service_requests(provider_user_id);
CREATE INDEX service_requests_buyer_idx ON public.service_requests(buyer_id);
CREATE INDEX service_requests_status_idx ON public.service_requests(status);

CREATE TRIGGER service_requests_touch_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service requests participants read"
  ON public.service_requests FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = provider_user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "service requests buyer insert"
  ON public.service_requests FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "service requests provider update"
  ON public.service_requests FOR UPDATE
  USING (auth.uid() = provider_user_id OR public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 12. ADMIN AUDIT LOGS
-- ============================================================================

CREATE TABLE public.admin_audit_logs (
  id bigserial PRIMARY KEY,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_actor_idx ON public.admin_audit_logs(actor_id);
CREATE INDEX audit_logs_target_idx ON public.admin_audit_logs(target_type, target_id);
CREATE INDEX audit_logs_created_idx ON public.admin_audit_logs(created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit logs admin read"
  ON public.admin_audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "audit logs admin insert"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = actor_id);

-- ============================================================================
-- 13. STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('hatchery-photos', 'hatchery-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('hatchery-permits', 'hatchery-permits', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-attachments', 'service-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- hatchery-photos policies (public read, owner write)
CREATE POLICY "hatchery photos public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hatchery-photos');

CREATE POLICY "hatchery photos owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hatchery-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "hatchery photos owner update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'hatchery-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "hatchery photos owner delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'hatchery-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- hatchery-permits (private — owner + admin only)
CREATE POLICY "hatchery permits owner read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'hatchery-permits'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "hatchery permits owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hatchery-permits' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "hatchery permits owner update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'hatchery-permits' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "hatchery permits owner delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'hatchery-permits' AND auth.uid()::text = (storage.foldername(name))[1]);

-- service-attachments (private — owner + admin)
CREATE POLICY "service attachments owner read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'service-attachments'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "service attachments owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- 14. SEED ROWS (curated names from old static lists, no owner)
-- ============================================================================

-- Hatcheries seed (owner_id NULL — admin can claim/assign later)
INSERT INTO public.hatcheries (slug, name, category, region, blurb, status)
VALUES
  ('akropong-day-old-hatchery', 'Akropong Day-Old Hatchery', 'poultry', 'Eastern',
    'Layer & broiler day-olds weekly. Vaccinated against Marek & Newcastle.', 'approved'),
  ('ashanti-broilers-hatchery', 'Ashanti Broilers Hatchery', 'poultry', 'Ashanti',
    'Cobb 500 and Ross 308 broiler chicks. Pickup or regional delivery.', 'approved'),
  ('sunyani-layer-hatchery', 'Sunyani Layer Hatchery', 'poultry', 'Bono',
    'Lohmann Brown layer chicks, point-of-lay pullets available.', 'approved'),
  ('volta-tilapia-fingerlings', 'Volta Tilapia Fingerlings', 'fish', 'Volta',
    'Mono-sex Nile tilapia fingerlings, sized 5–10g and 20g+.', 'approved'),
  ('akosombo-catfish-nursery', 'Akosombo Catfish Nursery', 'fish', 'Eastern',
    'African catfish fry and fingerlings, year-round supply.', 'approved'),
  ('northern-sanga-stud', 'Northern Sanga Stud', 'breeding', 'Northern',
    'Pure Sanga and Sanga × Friesian breeding bulls.', 'approved'),
  ('savannah-boer-goats', 'Savannah Boer Goats', 'breeding', 'Savannah',
    'Pedigree Boer bucks and does for crossbreeding programmes.', 'approved')
ON CONFLICT (slug) DO NOTHING;