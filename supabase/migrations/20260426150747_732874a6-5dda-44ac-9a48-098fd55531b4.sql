-- =========================================================================
-- Marketplace taxonomy v2 — Migration 1: Schema
-- Additive only. No drops. No enforcement. Backwards compatible.
-- =========================================================================

-- ---------- 1. units catalog ---------------------------------------------
create table if not exists public.units (
  slug text primary key,
  label_en text not null,
  label_local jsonb not null default '{}'::jsonb,
  kind text not null check (kind in ('price','weight','volume','duration','count','length','area')),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.units enable row level security;
create policy "units public read" on public.units for select using (true);
create policy "units admin write" on public.units for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
create trigger trg_units_touch before update on public.units
  for each row execute function public.touch_updated_at();

-- ---------- 2. market_pillars — additive columns -------------------------
alter table public.market_pillars
  add column if not exists label_local jsonb not null default '{}'::jsonb,
  add column if not exists accepts_vendor_stores boolean not null default false,
  add column if not exists has_directory boolean not null default false,
  add column if not exists default_unit_slug text references public.units(slug),
  add column if not exists allowed_units text[] not null default '{}'::text[],
  add column if not exists status text not null default 'active'
    check (status in ('active','deprecated'));

-- ---------- 3. market_categories — tree structure ------------------------
alter table public.market_categories
  add column if not exists parent_id uuid references public.market_categories(id) on delete restrict,
  add column if not exists canonical_path text,
  add column if not exists label_local jsonb not null default '{}'::jsonb,
  add column if not exists is_promoted boolean not null default false,
  add column if not exists accepts_listings boolean not null default true,
  add column if not exists status text not null default 'active'
    check (status in ('active','deprecated','merged')),
  add column if not exists merged_into_id uuid references public.market_categories(id) on delete restrict;

create index if not exists idx_market_categories_tree
  on public.market_categories (pillar_slug, parent_id, sort_order);
create index if not exists idx_market_categories_path
  on public.market_categories (canonical_path);

-- Recompute canonical_path for a category and its descendants
create or replace function public.recompute_category_path(_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pillar text;
  v_parent uuid;
  v_slug text;
  v_path text;
  v_parent_path text;
begin
  select pillar_slug, parent_id, slug into v_pillar, v_parent, v_slug
  from public.market_categories where id = _id;
  if not found then return; end if;

  if v_parent is null then
    v_path := v_pillar || '/' || v_slug;
  else
    select canonical_path into v_parent_path from public.market_categories where id = v_parent;
    v_path := coalesce(v_parent_path, v_pillar) || '/' || v_slug;
  end if;

  update public.market_categories set canonical_path = v_path where id = _id;

  -- recurse into children
  perform public.recompute_category_path(c.id)
  from public.market_categories c
  where c.parent_id = _id;
end;
$$;

create or replace function public.tg_market_categories_path()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- only recompute on INSERT or when slug/parent/pillar changed
  if tg_op = 'INSERT'
     or new.slug is distinct from old.slug
     or new.parent_id is distinct from old.parent_id
     or new.pillar_slug is distinct from old.pillar_slug then
    perform public.recompute_category_path(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_market_categories_path on public.market_categories;
create trigger trg_market_categories_path
  after insert or update on public.market_categories
  for each row execute function public.tg_market_categories_path();

-- Backfill paths for existing rows (all currently top-level)
update public.market_categories
set canonical_path = pillar_slug || '/' || slug
where canonical_path is null;

-- ---------- 4. attribute_definitions -------------------------------------
create table if not exists public.attribute_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label_en text not null,
  label_local jsonb not null default '{}'::jsonb,
  data_type text not null check (data_type in ('text','integer','decimal','enum','date','boolean','reference')),
  unit_slug text references public.units(slug),
  enum_values text[] not null default '{}'::text[],
  reference_table text check (reference_table in ('breeds','vaccines','feed_brands')),
  validation jsonb not null default '{}'::jsonb,
  help_text_en text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.attribute_definitions enable row level security;
create policy "attributes public read" on public.attribute_definitions for select using (true);
create policy "attributes admin write" on public.attribute_definitions for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
create trigger trg_attributes_touch before update on public.attribute_definitions
  for each row execute function public.touch_updated_at();

-- ---------- 5. category_attributes ---------------------------------------
create table if not exists public.category_attributes (
  category_id uuid not null references public.market_categories(id) on delete cascade,
  attribute_id uuid not null references public.attribute_definitions(id) on delete cascade,
  is_required boolean not null default false,
  is_filterable boolean not null default false,
  is_promoted boolean not null default false,
  display_order int not null default 0,
  default_value jsonb,
  created_at timestamptz not null default now(),
  primary key (category_id, attribute_id)
);
alter table public.category_attributes enable row level security;
create policy "category_attributes public read" on public.category_attributes for select using (true);
create policy "category_attributes admin write" on public.category_attributes for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
create index if not exists idx_category_attributes_category
  on public.category_attributes (category_id, display_order);

-- ---------- 6. breeds catalog --------------------------------------------
create table if not exists public.breeds (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.market_categories(id) on delete cascade,
  slug text not null,
  label_en text not null,
  label_local jsonb not null default '{}'::jsonb,
  origin text check (origin in ('Indigenous','Exotic','Cross','Unknown')) default 'Unknown',
  status text not null default 'active' check (status in ('active','pending','deprecated')),
  submitted_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);
alter table public.breeds enable row level security;
create policy "breeds public read active" on public.breeds for select
  using (status in ('active','pending') or public.has_role(auth.uid(),'admin'));
create policy "breeds user submit pending" on public.breeds for insert
  with check (auth.uid() is not null and status = 'pending' and submitted_by = auth.uid());
create policy "breeds admin write" on public.breeds for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
create trigger trg_breeds_touch before update on public.breeds
  for each row execute function public.touch_updated_at();
create index if not exists idx_breeds_category on public.breeds (category_id, status);

-- ---------- 7. vaccines catalog ------------------------------------------
create table if not exists public.vaccines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label_en text not null,
  label_local jsonb not null default '{}'::jsonb,
  target_species text[] not null default '{}'::text[],
  disease text,
  withdrawal_days int,
  status text not null default 'active' check (status in ('active','pending','deprecated')),
  submitted_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.vaccines enable row level security;
create policy "vaccines public read" on public.vaccines for select
  using (status in ('active','pending') or public.has_role(auth.uid(),'admin'));
create policy "vaccines user submit pending" on public.vaccines for insert
  with check (auth.uid() is not null and status = 'pending' and submitted_by = auth.uid());
create policy "vaccines admin write" on public.vaccines for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
create trigger trg_vaccines_touch before update on public.vaccines
  for each row execute function public.touch_updated_at();

-- ---------- 8. feed_brands catalog ---------------------------------------
create table if not exists public.feed_brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label_en text not null,
  manufacturer text,
  status text not null default 'active' check (status in ('active','pending','deprecated')),
  submitted_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.feed_brands enable row level security;
create policy "feed_brands public read" on public.feed_brands for select
  using (status in ('active','pending') or public.has_role(auth.uid(),'admin'));
create policy "feed_brands user submit pending" on public.feed_brands for insert
  with check (auth.uid() is not null and status = 'pending' and submitted_by = auth.uid());
create policy "feed_brands admin write" on public.feed_brands for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
create trigger trg_feed_brands_touch before update on public.feed_brands
  for each row execute function public.touch_updated_at();

-- ---------- 9. taxonomy_audit_log ----------------------------------------
create table if not exists public.taxonomy_audit_log (
  id bigserial primary key,
  actor_id uuid,
  table_name text not null,
  row_id text not null,
  action text not null check (action in ('insert','update','delete')),
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);
alter table public.taxonomy_audit_log enable row level security;
create policy "taxonomy_audit admin read" on public.taxonomy_audit_log for select
  using (public.has_role(auth.uid(),'admin'));

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
begin
  if tg_op = 'DELETE' then
    v_row_id := coalesce((to_jsonb(old)->>'id'), (to_jsonb(old)->>'slug'));
    v_before := to_jsonb(old);
    v_after  := null;
  elsif tg_op = 'UPDATE' then
    v_row_id := coalesce((to_jsonb(new)->>'id'), (to_jsonb(new)->>'slug'));
    v_before := to_jsonb(old);
    v_after  := to_jsonb(new);
  else
    v_row_id := coalesce((to_jsonb(new)->>'id'), (to_jsonb(new)->>'slug'));
    v_before := null;
    v_after  := to_jsonb(new);
  end if;

  insert into public.taxonomy_audit_log(actor_id, table_name, row_id, action, before, after)
  values (auth.uid(), tg_table_name, v_row_id, lower(tg_op), v_before, v_after);

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_audit_market_pillars on public.market_pillars;
create trigger trg_audit_market_pillars
  after insert or update or delete on public.market_pillars
  for each row execute function public.tg_taxonomy_audit();

drop trigger if exists trg_audit_market_categories on public.market_categories;
create trigger trg_audit_market_categories
  after insert or update or delete on public.market_categories
  for each row execute function public.tg_taxonomy_audit();

drop trigger if exists trg_audit_market_category_synonyms on public.market_category_synonyms;
create trigger trg_audit_market_category_synonyms
  after insert or update or delete on public.market_category_synonyms
  for each row execute function public.tg_taxonomy_audit();

drop trigger if exists trg_audit_attribute_definitions on public.attribute_definitions;
create trigger trg_audit_attribute_definitions
  after insert or update or delete on public.attribute_definitions
  for each row execute function public.tg_taxonomy_audit();

drop trigger if exists trg_audit_category_attributes on public.category_attributes;
create trigger trg_audit_category_attributes
  after insert or update or delete on public.category_attributes
  for each row execute function public.tg_taxonomy_audit();

-- ---------- 10. listings / hatcheries / service_profiles — additive ------
alter table public.listings
  add column if not exists category_id uuid references public.market_categories(id),
  add column if not exists attributes jsonb not null default '{}'::jsonb,
  add column if not exists price_unit_slug text references public.units(slug);

alter table public.hatcheries
  add column if not exists category_id uuid references public.market_categories(id),
  add column if not exists attributes jsonb not null default '{}'::jsonb;

alter table public.service_profiles
  add column if not exists category_id uuid references public.market_categories(id),
  add column if not exists attributes jsonb not null default '{}'::jsonb;

create index if not exists idx_listings_attributes_gin
  on public.listings using gin (attributes jsonb_path_ops);
create index if not exists idx_listings_pillar_category_status
  on public.listings (top_category, category_id, status, region);
create index if not exists idx_listings_category_id on public.listings (category_id);
create index if not exists idx_hatcheries_category_id on public.hatcheries (category_id);
create index if not exists idx_service_profiles_category_id on public.service_profiles (category_id);
