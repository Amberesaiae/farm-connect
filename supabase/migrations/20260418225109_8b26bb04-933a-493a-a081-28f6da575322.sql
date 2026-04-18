-- Enums
create type public.app_role as enum ('admin', 'user');
create type public.listing_status as enum ('draft', 'active', 'expired', 'sold', 'hidden');
create type public.price_unit as enum ('per_head', 'per_kg', 'per_lb', 'lot');
create type public.badge_tier as enum ('none', 'verified', 'trusted', 'top_seller');
create type public.user_status as enum ('active', 'suspended');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.notification_type as enum ('enquiry', 'verification_approved', 'verification_rejected', 'listing_expiring', 'listing_expired');
create type public.listing_event_type as enum ('view', 'contact_whatsapp', 'save');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Seller',
  whatsapp_e164 text,
  region text,
  district text,
  avatar_url text,
  badge_tier public.badge_tier not null default 'none',
  trade_count int not null default 0,
  listing_count int not null default 0,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles read all" on public.profiles for select using (true);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);

-- User roles + has_role
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "user_roles read own or admin" on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "user_roles admin manage" on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

-- Listings
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  breed text,
  age_months int,
  sex text,
  quantity int not null default 1,
  weight_kg numeric,
  price_ghs numeric not null,
  price_unit public.price_unit not null default 'per_head',
  region text not null,
  district text,
  description text,
  status public.listing_status not null default 'active',
  view_count int not null default 0,
  contact_count int not null default 0,
  save_count int not null default 0,
  expires_at timestamptz not null default (now() + interval '60 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(category, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(breed, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(region, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'D')
  ) stored
);
create index listings_search_idx on public.listings using gin(search_vector);
create index listings_status_idx on public.listings (status, created_at desc);
create index listings_seller_idx on public.listings (seller_id, created_at desc);
create index listings_category_idx on public.listings (category, status);
create index listings_region_idx on public.listings (region, status);

alter table public.listings enable row level security;
create policy "listings public read" on public.listings for select
  using (status in ('active','sold','expired') or auth.uid() = seller_id or public.has_role(auth.uid(), 'admin'));
create policy "listings owner insert" on public.listings for insert with check (auth.uid() = seller_id);
create policy "listings owner update" on public.listings for update
  using (auth.uid() = seller_id or public.has_role(auth.uid(), 'admin'));
create policy "listings owner delete" on public.listings for delete
  using (auth.uid() = seller_id or public.has_role(auth.uid(), 'admin'));

create trigger listings_touch before update on public.listings
for each row execute function public.touch_updated_at();

create or replace function public.bump_listing_count()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set listing_count = listing_count + 1 where id = new.seller_id;
  elsif tg_op = 'DELETE' then
    update public.profiles set listing_count = greatest(0, listing_count - 1) where id = old.seller_id;
  end if;
  return null;
end; $$;
create trigger listings_count_ins after insert on public.listings
for each row execute function public.bump_listing_count();
create trigger listings_count_del after delete on public.listings
for each row execute function public.bump_listing_count();

-- Listing photos
create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  display_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);
create index listing_photos_listing_idx on public.listing_photos (listing_id, display_order);
alter table public.listing_photos enable row level security;
create policy "photos read all" on public.listing_photos for select using (true);
create policy "photos owner write" on public.listing_photos for all
  using (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
         or public.has_role(auth.uid(), 'admin'))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()));

-- Listing events
create table public.listing_events (
  id bigserial primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type public.listing_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index listing_events_listing_idx on public.listing_events (listing_id, created_at desc);
alter table public.listing_events enable row level security;
create policy "events anyone insert" on public.listing_events for insert with check (true);
create policy "events seller or admin read" on public.listing_events for select
  using (public.has_role(auth.uid(), 'admin')
         or exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()));

-- Saved
create table public.saved_listings (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
alter table public.saved_listings enable row level security;
create policy "saved owner read" on public.saved_listings for select using (auth.uid() = user_id);
create policy "saved owner insert" on public.saved_listings for insert with check (auth.uid() = user_id);
create policy "saved owner delete" on public.saved_listings for delete using (auth.uid() = user_id);

-- Verifications
create table public.verification_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ghana_card_path text not null,
  selfie_path text not null,
  status public.verification_status not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index verifications_user_idx on public.verification_submissions (user_id, created_at desc);
create index verifications_status_idx on public.verification_submissions (status, created_at);
alter table public.verification_submissions enable row level security;
create policy "verifications owner or admin read" on public.verification_submissions for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "verifications owner insert" on public.verification_submissions for insert
  with check (auth.uid() = user_id);
create policy "verifications admin update" on public.verification_submissions for update
  using (public.has_role(auth.uid(), 'admin'));

-- Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
create policy "notifications owner read" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications owner update" on public.notifications for update using (auth.uid() = user_id);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

create policy "listing-photos public read" on storage.objects for select using (bucket_id = 'listing-photos');
create policy "listing-photos owner write" on storage.objects for insert with check (
  bucket_id = 'listing-photos' and auth.uid() is not null
  and exists (select 1 from public.listings l where l.id::text = (storage.foldername(name))[1] and l.seller_id = auth.uid())
);
create policy "listing-photos owner delete" on storage.objects for delete using (
  bucket_id = 'listing-photos'
  and exists (select 1 from public.listings l where l.id::text = (storage.foldername(name))[1] and l.seller_id = auth.uid())
);

create policy "verification-docs owner read" on storage.objects for select using (
  bucket_id = 'verification-docs'
  and (auth.uid()::text = (storage.foldername(name))[1] or public.has_role(auth.uid(), 'admin'))
);
create policy "verification-docs owner insert" on storage.objects for insert with check (
  bucket_id = 'verification-docs' and auth.uid()::text = (storage.foldername(name))[1]
);