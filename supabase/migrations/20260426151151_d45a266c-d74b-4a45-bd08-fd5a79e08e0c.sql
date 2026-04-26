-- Fix the audit trigger: tolerate composite-PK tables (e.g. market_category_synonyms)
create or replace function public.tg_taxonomy_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row_id text;
  v_before jsonb;
  v_after jsonb;
  v_payload jsonb;
begin
  if tg_op = 'DELETE' then
    v_payload := to_jsonb(old);
    v_before  := v_payload;
    v_after   := null;
  elsif tg_op = 'UPDATE' then
    v_payload := to_jsonb(new);
    v_before  := to_jsonb(old);
    v_after   := v_payload;
  else
    v_payload := to_jsonb(new);
    v_before  := null;
    v_after   := v_payload;
  end if;

  v_row_id := coalesce(
    v_payload->>'id',
    v_payload->>'slug',
    -- composite key for synonyms
    (v_payload->>'pillar_slug') || ':' || (v_payload->>'alias_slug'),
    -- composite key for category_attributes
    (v_payload->>'category_id') || ':' || (v_payload->>'attribute_id'),
    'unknown'
  );

  insert into public.taxonomy_audit_log(actor_id, table_name, row_id, action, before, after)
  values (auth.uid(), tg_table_name, v_row_id, lower(tg_op), v_before, v_after);

  return coalesce(new, old);
end;
$$;

-- =========================================================================
-- Marketplace taxonomy v2 — Migration 2: Backfill + seed (re-run)
-- =========================================================================

-- ---------- 1. Units catalog ---------------------------------------------
insert into public.units (slug, label_en, kind, sort_order) values
  ('per_head','per head','price',10),
  ('per_kg','per kg','price',20),
  ('per_bag','per bag','price',30),
  ('per_litre','per litre','price',40),
  ('per_crate','per crate','price',50),
  ('per_dozen','per dozen','price',60),
  ('per_pack','per pack','price',70),
  ('per_dose','per dose','price',80),
  ('per_service','per service','price',90),
  ('kg','kg','weight',10),
  ('g','g','weight',20),
  ('ml','ml','volume',10),
  ('l','L','volume',20),
  ('months','months','duration',10),
  ('weeks','weeks','duration',20),
  ('days','days','duration',30),
  ('cm','cm','length',10),
  ('m','m','length',20)
on conflict (slug) do nothing;

-- ---------- 2. Enrich pillars --------------------------------------------
update public.market_pillars set
  accepts_vendor_stores = (slug in ('agrofeed_supplements','agromed_veterinary','agro_equipment_tools')),
  has_directory         = (slug in ('hatcheries','services')),
  default_unit_slug = case slug
    when 'livestock' then 'per_head'
    when 'agrofeed_supplements' then 'per_bag'
    when 'agromed_veterinary' then 'per_dose'
    when 'agro_equipment_tools' then 'per_head'
    when 'hatcheries' then 'per_head'
    when 'services' then 'per_service'
    else 'per_head' end,
  allowed_units = case slug
    when 'livestock' then array['per_head','per_kg','per_dozen','per_crate']
    when 'agrofeed_supplements' then array['per_bag','per_kg','per_pack','per_litre']
    when 'agromed_veterinary' then array['per_dose','per_pack','per_litre']
    when 'agro_equipment_tools' then array['per_head','per_pack']
    when 'hatcheries' then array['per_head','per_dozen']
    when 'services' then array['per_service','per_head']
    else array['per_head'] end,
  label_local = case slug
    when 'livestock' then '{"tw":"Mmoa","ga":"Kɛkɛ"}'::jsonb
    when 'agrofeed_supplements' then '{"tw":"Aduane"}'::jsonb
    when 'agromed_veterinary' then '{"tw":"Aduro"}'::jsonb
    when 'agro_equipment_tools' then '{"tw":"Nnwuma nneɛma"}'::jsonb
    else '{}'::jsonb end;

-- ---------- 3. Hierarchical category seed --------------------------------
do $$
declare
  v_parent uuid;
begin
  select id into v_parent from public.market_categories where pillar_slug='livestock' and slug='poultry';
  if v_parent is not null then
    insert into public.market_categories(pillar_slug, parent_id, slug, label, sort_order, accepts_listings, is_promoted) values
      ('livestock', v_parent, 'layers',       'Layers',         10, true, false),
      ('livestock', v_parent, 'broilers',     'Broilers',       20, true, true),
      ('livestock', v_parent, 'local_sasso',  'Local / Sasso',  30, true, false),
      ('livestock', v_parent, 'cockerels',    'Cockerels',      40, true, false),
      ('livestock', v_parent, 'guinea_fowl',  'Guinea fowl',    50, true, false),
      ('livestock', v_parent, 'ducks',        'Ducks',          60, true, false),
      ('livestock', v_parent, 'turkeys',      'Turkeys',        70, true, false),
      ('livestock', v_parent, 'quails',       'Quails',         80, true, false)
    on conflict do nothing;
  end if;

  select id into v_parent from public.market_categories where pillar_slug='livestock' and slug='eggs';
  if v_parent is not null then
    insert into public.market_categories(pillar_slug, parent_id, slug, label, sort_order, accepts_listings) values
      ('livestock', v_parent, 'table_eggs',     'Table eggs',     10, true),
      ('livestock', v_parent, 'fertile_eggs',   'Fertile eggs',   20, true),
      ('livestock', v_parent, 'hatching_eggs',  'Hatching eggs',  30, true)
    on conflict do nothing;
  end if;

  select id into v_parent from public.market_categories where pillar_slug='livestock' and slug='fish';
  if v_parent is not null then
    insert into public.market_categories(pillar_slug, parent_id, slug, label, sort_order, accepts_listings) values
      ('livestock', v_parent, 'tilapia',  'Tilapia',  10, true),
      ('livestock', v_parent, 'catfish',  'Catfish',  20, true)
    on conflict do nothing;
  end if;

  select id into v_parent from public.market_categories where pillar_slug='agromed_veterinary' and slug='vaccine';
  if v_parent is not null then
    insert into public.market_categories(pillar_slug, parent_id, slug, label, sort_order, accepts_listings) values
      ('agromed_veterinary', v_parent, 'newcastle',   'Newcastle',           10, true),
      ('agromed_veterinary', v_parent, 'gumboro',     'Gumboro',             20, true),
      ('agromed_veterinary', v_parent, 'mareks',      'Marek''s',            30, true),
      ('agromed_veterinary', v_parent, 'fowl_pox',    'Fowl pox',            40, true),
      ('agromed_veterinary', v_parent, 'lasota',      'Lasota',              50, true),
      ('agromed_veterinary', v_parent, 'inf_bronch',  'Infectious Bronchitis', 60, true)
    on conflict do nothing;
  end if;

  select id into v_parent from public.market_categories where pillar_slug='agro_equipment_tools' and slug='incubator';
  if v_parent is not null then
    insert into public.market_categories(pillar_slug, parent_id, slug, label, sort_order, accepts_listings) values
      ('agro_equipment_tools', v_parent, 'inc_small',  'Small (≤ 100 eggs)',     10, true),
      ('agro_equipment_tools', v_parent, 'inc_medium', 'Medium (101–500 eggs)', 20, true),
      ('agro_equipment_tools', v_parent, 'inc_large',  'Large (500+ eggs)',     30, true)
    on conflict do nothing;
  end if;
end $$;

update public.market_categories set is_promoted = true
where (pillar_slug, slug) in (
  ('livestock','cattle'),
  ('livestock','goats'),
  ('livestock','poultry'),
  ('livestock','sheep'),
  ('livestock','pigs'),
  ('livestock','fish'),
  ('livestock','eggs'),
  ('agrofeed_supplements','layer_mash'),
  ('agromed_veterinary','vaccine'),
  ('agro_equipment_tools','incubator')
);

-- ---------- 4. Synonyms expansion ----------------------------------------
insert into public.market_category_synonyms (pillar_slug, alias_slug, canonical_slug) values
  ('livestock','aponkye','goats'),
  ('livestock','tewi','goats'),
  ('livestock','nantwi','cattle'),
  ('livestock','akoko','poultry'),
  ('livestock','prako','pigs'),
  ('livestock','adwene','fish'),
  ('livestock','nantwie','cattle'),
  ('livestock','adwen','fish'),
  ('livestock','broiler','broilers'),
  ('livestock','layer','layers'),
  ('livestock','cockerel','cockerels'),
  ('livestock','duck','ducks'),
  ('livestock','turkey','turkeys'),
  ('livestock','quail','quails'),
  ('livestock','table_egg','table_eggs'),
  ('livestock','hatching_egg','hatching_eggs'),
  ('agro_equipment_tools','incubators','incubator'),
  ('agro_equipment_tools','feeders','feeder'),
  ('agro_equipment_tools','drinkers','drinker')
on conflict do nothing;

-- ---------- 5. Attribute definitions -------------------------------------
insert into public.attribute_definitions (key, label_en, data_type, unit_slug, enum_values, reference_table, validation, help_text_en) values
  ('breed',            'Breed',                'reference', null, '{}'::text[], 'breeds', '{}'::jsonb, 'Pick from catalog or type to suggest a new one'),
  ('breed_text',       'Breed (free text)',    'text',      null, '{}'::text[], null, '{"max":80}'::jsonb, null),
  ('age_months',       'Age',                  'integer',   'months', '{}'::text[], null, '{"min":0,"max":240}'::jsonb, null),
  ('sex',              'Sex',                  'enum',      null, array['male','female','mixed'], null, '{}'::jsonb, null),
  ('weight_kg',        'Weight',               'decimal',   'kg', '{}'::text[], null, '{"min":0,"max":2000}'::jsonb, null),
  ('quantity',         'Quantity available',   'integer',   null, '{}'::text[], null, '{"min":1}'::jsonb, null),
  ('min_order',        'Minimum order',        'integer',   null, '{}'::text[], null, '{"min":1}'::jsonb, null),
  ('pack_size',        'Pack size',            'text',      null, '{}'::text[], null, '{"max":40}'::jsonb, 'e.g. 50 kg bag, 1 L bottle, 100 doses'),
  ('brand',            'Brand',                'reference', null, '{}'::text[], 'feed_brands', '{"max":80}'::jsonb, null),
  ('brand_text',       'Brand (free text)',    'text',      null, '{}'::text[], null, '{"max":80}'::jsonb, null),
  ('condition',        'Condition',            'enum',      null, array['new','used'], null, '{}'::jsonb, null),
  ('model',            'Model',                'text',      null, '{}'::text[], null, '{"max":80}'::jsonb, null),
  ('expires_on',       'Expiry date',          'date',      null, '{}'::text[], null, '{}'::jsonb, null),
  ('manufactured_on',  'Manufactured',         'date',      null, '{}'::text[], null, '{}'::jsonb, null),
  ('active_ingredient','Active ingredient',    'text',      null, '{}'::text[], null, '{"max":120}'::jsonb, null),
  ('dosage',           'Dosage',               'text',      null, '{}'::text[], null, '{"max":120}'::jsonb, 'e.g. 1 ml / 10 birds'),
  ('withdrawal_days',  'Withdrawal period',    'integer',   'days', '{}'::text[], null, '{"min":0,"max":365}'::jsonb, null),
  ('target_species',   'For species',          'enum',      null, array['poultry','cattle','goats','sheep','pigs','rabbits','fish','any'], null, '{}'::jsonb, null),
  ('vaccine',          'Vaccine',              'reference', null, '{}'::text[], 'vaccines', '{}'::jsonb, null),
  ('licence_number',   'VSD licence number',   'text',      null, '{}'::text[], null, '{"max":40}'::jsonb, null),
  ('capacity',         'Capacity',             'integer',   null, '{}'::text[], null, '{"min":0}'::jsonb, 'e.g. number of eggs / animals it serves'),
  ('power_source',     'Power source',         'enum',      null, array['electric','solar','gas','manual','dual'], null, '{}'::jsonb, null),
  ('voltage',          'Voltage',              'text',      null, '{}'::text[], null, '{"max":20}'::jsonb, 'e.g. 220V'),
  ('warranty_months',  'Warranty',             'integer',   'months', '{}'::text[], null, '{"min":0,"max":120}'::jsonb, null)
on conflict (key) do nothing;

-- ---------- 6. Category-attribute wiring ---------------------------------
insert into public.category_attributes (category_id, attribute_id, is_required, is_filterable, is_promoted, display_order)
select c.id, a.id, x.req, x.flt, x.prm, x.ord
from (values
  ('livestock','cattle',  'breed',       false, true,  true,  10),
  ('livestock','cattle',  'sex',         false, true,  true,  20),
  ('livestock','cattle',  'age_months',  false, true,  true,  30),
  ('livestock','cattle',  'weight_kg',   false, true,  false, 40),
  ('livestock','cattle',  'quantity',    false, false, false, 50),
  ('livestock','goats',   'breed',       false, true,  true,  10),
  ('livestock','goats',   'sex',         false, true,  true,  20),
  ('livestock','goats',   'age_months',  false, true,  true,  30),
  ('livestock','goats',   'weight_kg',   false, true,  false, 40),
  ('livestock','sheep',   'breed',       false, true,  true,  10),
  ('livestock','sheep',   'sex',         false, true,  true,  20),
  ('livestock','sheep',   'age_months',  false, true,  true,  30),
  ('livestock','sheep',   'weight_kg',   false, true,  false, 40),
  ('livestock','poultry', 'breed',       false, true,  true,  10),
  ('livestock','poultry', 'age_months',  false, true,  true,  20),
  ('livestock','poultry', 'sex',         false, true,  false, 30),
  ('livestock','poultry', 'quantity',    false, false, true,  40),
  ('livestock','pigs',    'breed',       false, true,  true,  10),
  ('livestock','pigs',    'sex',         false, true,  true,  20),
  ('livestock','pigs',    'age_months',  false, true,  true,  30),
  ('livestock','pigs',    'weight_kg',   false, true,  false, 40),
  ('livestock','rabbits', 'breed',       false, true,  true,  10),
  ('livestock','rabbits', 'sex',         false, true,  true,  20),
  ('livestock','rabbits', 'age_months',  false, true,  true,  30),
  ('livestock','fish',    'breed',       false, true,  true,  10),
  ('livestock','fish',    'weight_kg',   false, true,  true,  20),
  ('livestock','fish',    'quantity',    false, false, true,  30),
  ('livestock','eggs',    'pack_size',   false, true,  true,  10),
  ('livestock','eggs',    'quantity',    false, false, true,  20),
  ('agrofeed_supplements','layer_mash',       'brand',     false, true,  true,  10),
  ('agrofeed_supplements','layer_mash',       'pack_size', false, true,  true,  20),
  ('agrofeed_supplements','layer_mash',       'expires_on',false, false, false, 30),
  ('agrofeed_supplements','broiler_starter',  'brand',     false, true,  true,  10),
  ('agrofeed_supplements','broiler_starter',  'pack_size', false, true,  true,  20),
  ('agrofeed_supplements','broiler_starter',  'expires_on',false, false, false, 30),
  ('agrofeed_supplements','broiler_finisher', 'brand',     false, true,  true,  10),
  ('agrofeed_supplements','broiler_finisher', 'pack_size', false, true,  true,  20),
  ('agrofeed_supplements','concentrate',      'brand',     false, true,  true,  10),
  ('agrofeed_supplements','concentrate',      'pack_size', false, true,  true,  20),
  ('agrofeed_supplements','mineral_lick',     'brand',     false, true,  true,  10),
  ('agrofeed_supplements','mineral_lick',     'pack_size', false, true,  true,  20),
  ('agrofeed_supplements','fish_feed',        'brand',     false, true,  true,  10),
  ('agrofeed_supplements','fish_feed',        'pack_size', false, true,  true,  20),
  ('agrofeed_supplements','supplement',       'brand',     false, true,  true,  10),
  ('agrofeed_supplements','supplement',       'pack_size', false, true,  true,  20),
  ('agromed_veterinary','vaccine',       'vaccine',           false, true,  true,  10),
  ('agromed_veterinary','vaccine',       'target_species',    false, true,  true,  20),
  ('agromed_veterinary','vaccine',       'pack_size',         false, true,  false, 30),
  ('agromed_veterinary','vaccine',       'expires_on',        true,  false, false, 40),
  ('agromed_veterinary','vaccine',       'licence_number',    false, false, false, 50),
  ('agromed_veterinary','antibiotic',    'active_ingredient', false, true,  true,  10),
  ('agromed_veterinary','antibiotic',    'target_species',    false, true,  true,  20),
  ('agromed_veterinary','antibiotic',    'dosage',            false, false, true,  30),
  ('agromed_veterinary','antibiotic',    'withdrawal_days',   false, true,  false, 40),
  ('agromed_veterinary','antibiotic',    'expires_on',        true,  false, false, 50),
  ('agromed_veterinary','dewormer',      'active_ingredient', false, true,  true,  10),
  ('agromed_veterinary','dewormer',      'target_species',    false, true,  true,  20),
  ('agromed_veterinary','dewormer',      'dosage',            false, false, true,  30),
  ('agromed_veterinary','dewormer',      'expires_on',        true,  false, false, 40),
  ('agromed_veterinary','vitamin',       'active_ingredient', false, true,  true,  10),
  ('agromed_veterinary','vitamin',       'target_species',    false, true,  true,  20),
  ('agromed_veterinary','vitamin',       'expires_on',        true,  false, false, 30),
  ('agromed_veterinary','antiparasitic', 'active_ingredient', false, true,  true,  10),
  ('agromed_veterinary','antiparasitic', 'target_species',    false, true,  true,  20),
  ('agromed_veterinary','antiparasitic', 'expires_on',        true,  false, false, 30),
  ('agromed_veterinary','disinfectant',  'active_ingredient', false, true,  true,  10),
  ('agromed_veterinary','disinfectant',  'pack_size',         false, true,  true,  20),
  ('agromed_veterinary','disinfectant',  'expires_on',        true,  false, false, 30),
  ('agro_equipment_tools','incubator', 'condition',       true,  true,  true,  10),
  ('agro_equipment_tools','incubator', 'capacity',        false, true,  true,  20),
  ('agro_equipment_tools','incubator', 'power_source',    false, true,  true,  30),
  ('agro_equipment_tools','incubator', 'voltage',         false, false, false, 40),
  ('agro_equipment_tools','incubator', 'brand',           false, true,  false, 50),
  ('agro_equipment_tools','incubator', 'warranty_months', false, false, false, 60),
  ('agro_equipment_tools','feeder',    'condition',       true,  true,  true,  10),
  ('agro_equipment_tools','feeder',    'capacity',        false, true,  true,  20),
  ('agro_equipment_tools','feeder',    'brand',           false, true,  false, 30),
  ('agro_equipment_tools','drinker',   'condition',       true,  true,  true,  10),
  ('agro_equipment_tools','drinker',   'capacity',        false, true,  true,  20),
  ('agro_equipment_tools','cage',      'condition',       true,  true,  true,  10),
  ('agro_equipment_tools','cage',      'capacity',        false, true,  true,  20),
  ('agro_equipment_tools','milking',   'condition',       true,  true,  true,  10),
  ('agro_equipment_tools','milking',   'power_source',    false, true,  true,  20),
  ('agro_equipment_tools','spray',     'condition',       true,  true,  true,  10),
  ('agro_equipment_tools','spray',     'power_source',    false, true,  true,  20),
  ('agro_equipment_tools','brooder',   'condition',       true,  true,  true,  10),
  ('agro_equipment_tools','brooder',   'capacity',        false, true,  true,  20),
  ('agro_equipment_tools','brooder',   'power_source',    false, true,  true,  30)
) as x(pillar, slug, attr_key, req, flt, prm, ord)
join public.market_categories c on c.pillar_slug = x.pillar and c.slug = x.slug
join public.attribute_definitions a on a.key = x.attr_key
on conflict do nothing;

-- ---------- 7. Catalog seeds ---------------------------------------------
do $$
declare
  cattle_id uuid; goats_id uuid; sheep_id uuid; pigs_id uuid;
  poultry_id uuid; rabbits_id uuid; fish_id uuid;
begin
  select id into cattle_id  from public.market_categories where pillar_slug='livestock' and slug='cattle';
  select id into goats_id   from public.market_categories where pillar_slug='livestock' and slug='goats';
  select id into sheep_id   from public.market_categories where pillar_slug='livestock' and slug='sheep';
  select id into pigs_id    from public.market_categories where pillar_slug='livestock' and slug='pigs';
  select id into poultry_id from public.market_categories where pillar_slug='livestock' and slug='poultry';
  select id into rabbits_id from public.market_categories where pillar_slug='livestock' and slug='rabbits';
  select id into fish_id    from public.market_categories where pillar_slug='livestock' and slug='fish';

  insert into public.breeds (category_id, slug, label_en, origin) values
    (cattle_id, 'sanga',          'Sanga',           'Indigenous'),
    (cattle_id, 'ndama',          'N''Dama',         'Indigenous'),
    (cattle_id, 'sokoto_gudali',  'Sokoto Gudali',   'Indigenous'),
    (cattle_id, 'white_fulani',   'White Fulani',    'Indigenous'),
    (cattle_id, 'friesian',       'Friesian',        'Exotic'),
    (cattle_id, 'jersey',         'Jersey',          'Exotic'),
    (cattle_id, 'boran',          'Boran',           'Exotic'),
    (goats_id,  'wad',            'West African Dwarf','Indigenous'),
    (goats_id,  'sahel',          'Sahel',           'Indigenous'),
    (goats_id,  'boer',           'Boer',            'Exotic'),
    (goats_id,  'kalahari',       'Kalahari Red',    'Exotic'),
    (sheep_id,  'djallonke',      'Djallonké',       'Indigenous'),
    (sheep_id,  'sahel_sheep',    'Sahel sheep',     'Indigenous'),
    (pigs_id,   'large_white',    'Large White',     'Exotic'),
    (pigs_id,   'landrace',       'Landrace',        'Exotic'),
    (pigs_id,   'duroc',          'Duroc',           'Exotic'),
    (pigs_id,   'local_pig',      'Local',           'Indigenous'),
    (poultry_id,'isa_brown',      'Isa Brown',       'Exotic'),
    (poultry_id,'lohmann',        'Lohmann',         'Exotic'),
    (poultry_id,'cobb_500',       'Cobb 500',        'Exotic'),
    (poultry_id,'ross_308',       'Ross 308',        'Exotic'),
    (poultry_id,'sasso',          'Sasso',           'Exotic'),
    (poultry_id,'local_poultry',  'Local',           'Indigenous'),
    (rabbits_id,'nz_white',       'New Zealand White','Exotic'),
    (rabbits_id,'chinchilla',     'Chinchilla',      'Exotic'),
    (rabbits_id,'flemish',        'Flemish Giant',   'Exotic'),
    (fish_id,   'tilapia_akosombo','Akosombo Strain Tilapia','Indigenous'),
    (fish_id,   'tilapia_nile',   'Nile Tilapia',    'Exotic'),
    (fish_id,   'catfish_clarias','Catfish (Clarias)','Indigenous')
  on conflict do nothing;
end $$;

insert into public.vaccines (slug, label_en, target_species, disease, withdrawal_days) values
  ('newcastle_lasota',   'Newcastle (Lasota)',         array['poultry'], 'Newcastle disease', 0),
  ('newcastle_clone30',  'Newcastle (Clone 30)',       array['poultry'], 'Newcastle disease', 0),
  ('gumboro_intermed',   'Gumboro (Intermediate)',     array['poultry'], 'Infectious Bursal Disease', 0),
  ('mareks_hvt',         'Marek''s (HVT)',             array['poultry'], 'Marek''s disease', 0),
  ('fowl_pox',           'Fowl pox',                   array['poultry'], 'Fowl pox', 0),
  ('inf_bronchitis_h120','Infectious Bronchitis H120', array['poultry'], 'Infectious Bronchitis', 0),
  ('ppr',                'PPR',                        array['goats','sheep'], 'Peste des Petits Ruminants', 21),
  ('lsd',                'Lumpy Skin Disease',         array['cattle'], 'LSD', 21),
  ('bq',                 'Black Quarter',              array['cattle','goats','sheep'], 'Black Quarter', 21)
on conflict do nothing;

insert into public.feed_brands (slug, label_en, manufacturer) values
  ('unbranded', 'Other / Unbranded', null),
  ('agricare',  'Agricare',          'Agricare Ltd')
on conflict do nothing;

-- ---------- 8. Backfill listings -----------------------------------------
update public.listings l
set category_id = c.id
from public.market_categories c
where l.category_id is null
  and c.pillar_slug = l.top_category
  and (
    c.slug = l.subcategory_slug
    or c.slug = public.resolve_category_slug(l.top_category, l.subcategory_slug)
  );

update public.listings
set price_unit_slug = case price_unit::text
  when 'per_head' then 'per_head'
  when 'per_kg'   then 'per_kg'
  when 'per_bag'  then 'per_bag'
  when 'per_litre' then 'per_litre'
  when 'per_crate' then 'per_crate'
  when 'per_dozen' then 'per_dozen'
  when 'per_pack' then 'per_pack'
  else 'per_head' end
where price_unit_slug is null;

update public.listings
set attributes = coalesce(attributes,'{}'::jsonb)
  || jsonb_strip_nulls(jsonb_build_object(
       'breed_text',    breed,
       'age_months',    age_months,
       'sex',           sex,
       'weight_kg',     weight_kg,
       'condition',     condition
     ))
  || coalesce(metadata,'{}'::jsonb)
where attributes = '{}'::jsonb or attributes is null;

update public.hatcheries h
set category_id = c.id
from public.market_categories c
where h.category_id is null
  and c.pillar_slug = 'hatcheries'
  and c.slug = public.resolve_category_slug('hatcheries', h.category::text);

update public.service_profiles s
set category_id = c.id
from public.market_categories c
where s.category_id is null
  and c.pillar_slug = 'services'
  and c.slug = public.resolve_category_slug('services', s.category);
