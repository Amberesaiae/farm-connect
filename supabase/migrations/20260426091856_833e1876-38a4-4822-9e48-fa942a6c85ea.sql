-- =============================================================================
-- Marketplace taxonomy: pillars, categories, synonyms
-- =============================================================================

CREATE TABLE public.market_pillars (
  slug              text PRIMARY KEY,
  label             text NOT NULL,
  short_label       text NOT NULL,
  icon_key          text,
  description       text,
  sort_order        int  NOT NULL DEFAULT 0,
  is_marketplace    boolean NOT NULL DEFAULT true,  -- true = listings pillar; false = directory (hatcheries/services)
  requires_expiry   boolean NOT NULL DEFAULT false,
  requires_condition boolean NOT NULL DEFAULT false,
  requires_licence  boolean NOT NULL DEFAULT false,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.market_categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_slug     text NOT NULL REFERENCES public.market_pillars(slug) ON DELETE CASCADE,
  slug            text NOT NULL,
  label           text NOT NULL,
  icon_key        text,
  description     text,
  sort_order      int  NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pillar_slug, slug)
);

CREATE INDEX idx_market_categories_pillar ON public.market_categories(pillar_slug, sort_order);

CREATE TABLE public.market_category_synonyms (
  pillar_slug     text NOT NULL REFERENCES public.market_pillars(slug) ON DELETE CASCADE,
  alias_slug      text NOT NULL,
  canonical_slug  text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pillar_slug, alias_slug),
  FOREIGN KEY (pillar_slug, canonical_slug) REFERENCES public.market_categories(pillar_slug, slug) ON DELETE CASCADE
);

-- updated_at triggers
CREATE TRIGGER trg_market_pillars_updated_at
  BEFORE UPDATE ON public.market_pillars
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_market_categories_updated_at
  BEFORE UPDATE ON public.market_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =============================================================================
-- RLS — public read, admin write
-- =============================================================================

ALTER TABLE public.market_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_category_synonyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pillars public read" ON public.market_pillars FOR SELECT USING (true);
CREATE POLICY "pillars admin write" ON public.market_pillars FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "categories public read" ON public.market_categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.market_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "synonyms public read" ON public.market_category_synonyms FOR SELECT USING (true);
CREATE POLICY "synonyms admin write" ON public.market_category_synonyms FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================================================
-- Seed pillars
-- =============================================================================

INSERT INTO public.market_pillars
  (slug, label, short_label, icon_key, sort_order, is_marketplace, requires_expiry, requires_condition, requires_licence, description) VALUES
  ('livestock',            'Livestock',             'Livestock',  'cattle',  10, true,  false, false, false, 'Live animals from verified farmers across Ghana.'),
  ('agrofeed_supplements', 'Feed & Supplements',    'Feed',       'feed',    20, true,  false, false, false, 'Animal feed, concentrates, mineral licks and supplements.'),
  ('agromed_veterinary',   'Agromed / Veterinary',  'Agromed',    'agromed', 30, true,  true,  false, true,  'Vaccines, antibiotics, dewormers and veterinary supplies.'),
  ('agro_equipment_tools', 'Equipment & Tools',     'Equipment',  'tools',   40, true,  false, true,  false, 'Incubators, feeders, cages and farm equipment.'),
  ('hatcheries',           'Hatcheries & Breeders', 'Hatcheries', 'egg',     50, false, false, false, false, 'Day-olds, fingerlings and breeding stock from approved hatcheries.'),
  ('services',             'Services',              'Services',   'service', 60, false, false, false, false, 'Vet, transport, training, insurance and advisory services.');

-- =============================================================================
-- Seed categories (canonical slugs)
-- =============================================================================

-- Livestock
INSERT INTO public.market_categories (pillar_slug, slug, label, icon_key, sort_order) VALUES
  ('livestock', 'cattle',   'Cattle',   'cattle',  10),
  ('livestock', 'goats',    'Goats',    'goat',    20),
  ('livestock', 'sheep',    'Sheep',    'sheep',   30),
  ('livestock', 'poultry',  'Poultry',  'poultry', 40),
  ('livestock', 'pigs',     'Pigs',     'pig',     50),
  ('livestock', 'rabbits',  'Rabbits',  'rabbit',  60),
  ('livestock', 'fish',     'Fish',     'fish',    70),
  ('livestock', 'eggs',     'Eggs',     'egg',     80);

-- Feed & supplements
INSERT INTO public.market_categories (pillar_slug, slug, label, sort_order) VALUES
  ('agrofeed_supplements', 'layer_mash',        'Layer mash',        10),
  ('agrofeed_supplements', 'broiler_starter',   'Broiler starter',   20),
  ('agrofeed_supplements', 'broiler_finisher',  'Broiler finisher',  30),
  ('agrofeed_supplements', 'concentrate',       'Concentrate',       40),
  ('agrofeed_supplements', 'mineral_lick',      'Mineral lick',      50),
  ('agrofeed_supplements', 'fish_feed',         'Fish feed',         60),
  ('agrofeed_supplements', 'supplement',        'Supplement / Premix',70);

-- Agromed / Veterinary
INSERT INTO public.market_categories (pillar_slug, slug, label, sort_order) VALUES
  ('agromed_veterinary', 'vaccine',       'Vaccine',           10),
  ('agromed_veterinary', 'antibiotic',    'Antibiotic',        20),
  ('agromed_veterinary', 'dewormer',      'Dewormer',          30),
  ('agromed_veterinary', 'vitamin',       'Vitamins / Tonic',  40),
  ('agromed_veterinary', 'antiparasitic', 'Antiparasitic',     50),
  ('agromed_veterinary', 'disinfectant',  'Disinfectant',      60);

-- Equipment & tools
INSERT INTO public.market_categories (pillar_slug, slug, label, sort_order) VALUES
  ('agro_equipment_tools', 'incubator', 'Incubator',          10),
  ('agro_equipment_tools', 'feeder',    'Feeders',            20),
  ('agro_equipment_tools', 'drinker',   'Drinkers',           30),
  ('agro_equipment_tools', 'cage',      'Cages / Crates',     40),
  ('agro_equipment_tools', 'milking',   'Milking equipment',  50),
  ('agro_equipment_tools', 'spray',     'Sprayers',           60),
  ('agro_equipment_tools', 'brooder',   'Brooders / Heaters', 70);

-- Hatcheries (directory)
INSERT INTO public.market_categories (pillar_slug, slug, label, icon_key, sort_order) VALUES
  ('hatcheries', 'poultry',  'Poultry chicks',     'poultry', 10),
  ('hatcheries', 'fish',     'Fish fingerlings',   'fish',    20),
  ('hatcheries', 'breeding', 'Breeding stock',     'cattle',  30);

-- Services (directory)
INSERT INTO public.market_categories (pillar_slug, slug, label, sort_order) VALUES
  ('services', 'vet',        'Veterinary',     10),
  ('services', 'transport',  'Transport',      20),
  ('services', 'feed',       'Feed & Agro-vet',30),
  ('services', 'insurance',  'Insurance',      40),
  ('services', 'training',   'Training',       50),
  ('services', 'advisory',   'Advisory',       60);

-- =============================================================================
-- Seed synonyms (legacy slugs from before the canonical set)
-- =============================================================================

INSERT INTO public.market_category_synonyms (pillar_slug, alias_slug, canonical_slug) VALUES
  ('livestock', 'goat',    'goats'),
  ('livestock', 'pig',     'pigs'),
  ('livestock', 'rabbit',  'rabbits'),
  ('livestock', 'egg',     'eggs');

-- =============================================================================
-- Validation helpers
-- =============================================================================

-- Resolves an alias to a canonical category slug; returns NULL if neither alias nor canonical exists.
CREATE OR REPLACE FUNCTION public.resolve_category_slug(_pillar text, _slug text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_canonical text;
BEGIN
  IF _slug IS NULL THEN RETURN NULL; END IF;

  -- already canonical?
  SELECT slug INTO v_canonical
  FROM public.market_categories
  WHERE pillar_slug = _pillar AND slug = _slug AND is_active = true;
  IF FOUND THEN RETURN v_canonical; END IF;

  -- synonym?
  SELECT canonical_slug INTO v_canonical
  FROM public.market_category_synonyms
  WHERE pillar_slug = _pillar AND alias_slug = _slug;
  IF FOUND THEN RETURN v_canonical; END IF;

  RETURN NULL;
END;
$$;

-- =============================================================================
-- Trigger: validate listings against the taxonomy + per-pillar rules
-- =============================================================================

CREATE OR REPLACE FUNCTION public.validate_listing_taxonomy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pillar      public.market_pillars%ROWTYPE;
  v_canonical   text;
BEGIN
  -- Pillar must exist and be a marketplace pillar
  SELECT * INTO v_pillar
  FROM public.market_pillars
  WHERE slug = NEW.top_category AND is_active = true AND is_marketplace = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_PILLAR: % is not a valid marketplace pillar', NEW.top_category
      USING ERRCODE = 'check_violation';
  END IF;

  -- Subcategory: required, must resolve to a canonical category in this pillar
  IF NEW.subcategory_slug IS NULL OR length(trim(NEW.subcategory_slug)) = 0 THEN
    RAISE EXCEPTION 'MISSING_SUBCATEGORY: pillar % requires a subcategory', NEW.top_category
      USING ERRCODE = 'check_violation';
  END IF;

  v_canonical := public.resolve_category_slug(NEW.top_category, NEW.subcategory_slug);
  IF v_canonical IS NULL THEN
    RAISE EXCEPTION 'INVALID_CATEGORY: % is not a valid category for pillar %', NEW.subcategory_slug, NEW.top_category
      USING ERRCODE = 'check_violation';
  END IF;

  -- Normalise + mirror canonical slug into the legacy `category` column
  NEW.subcategory_slug := v_canonical;
  NEW.category := v_canonical;

  -- Per-pillar rules
  IF v_pillar.requires_expiry AND NEW.expires_on IS NULL THEN
    RAISE EXCEPTION 'MISSING_EXPIRY: pillar % requires an expiry date', NEW.top_category
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_pillar.requires_condition AND (NEW.condition IS NULL OR NEW.condition NOT IN ('new','used')) THEN
    RAISE EXCEPTION 'MISSING_CONDITION: pillar % requires condition (new|used)', NEW.top_category
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_listings_validate_taxonomy
  BEFORE INSERT OR UPDATE OF top_category, subcategory_slug, expires_on, condition
  ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.validate_listing_taxonomy();

-- =============================================================================
-- Trigger: validate vendor stores (only the 3 sellable marketplace pillars)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.validate_store_pillar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.pillar NOT IN ('agrofeed_supplements','agromed_veterinary','agro_equipment_tools') THEN
    RAISE EXCEPTION 'INVALID_STORE_PILLAR: % is not a valid agro store pillar', NEW.pillar
      USING ERRCODE = 'check_violation';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.market_pillars
    WHERE slug = NEW.pillar AND is_active = true AND is_marketplace = true
  ) THEN
    RAISE EXCEPTION 'INVALID_STORE_PILLAR: % is not an active marketplace pillar', NEW.pillar
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stores_validate_pillar
  BEFORE INSERT OR UPDATE OF pillar
  ON public.agro_vendor_stores
  FOR EACH ROW EXECUTE FUNCTION public.validate_store_pillar();

-- =============================================================================
-- Trigger: validate hatchery + service categories
-- =============================================================================

CREATE OR REPLACE FUNCTION public.validate_hatchery_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_canonical text;
BEGIN
  v_canonical := public.resolve_category_slug('hatcheries', NEW.category::text);
  IF v_canonical IS NULL THEN
    RAISE EXCEPTION 'INVALID_HATCHERY_CATEGORY: % is not a valid hatchery category', NEW.category
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_hatcheries_validate_category
  BEFORE INSERT OR UPDATE OF category
  ON public.hatcheries
  FOR EACH ROW EXECUTE FUNCTION public.validate_hatchery_category();

CREATE OR REPLACE FUNCTION public.validate_service_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_canonical text;
BEGIN
  v_canonical := public.resolve_category_slug('services', NEW.category);
  IF v_canonical IS NULL THEN
    RAISE EXCEPTION 'INVALID_SERVICE_CATEGORY: % is not a valid service category', NEW.category
      USING ERRCODE = 'check_violation';
  END IF;
  NEW.category := v_canonical;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_service_profiles_validate_category
  BEFORE INSERT OR UPDATE OF category
  ON public.service_profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_service_category();
