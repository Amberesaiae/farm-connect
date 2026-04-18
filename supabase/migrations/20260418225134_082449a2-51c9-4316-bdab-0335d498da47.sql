-- Fix function search_path
create or replace function public.touch_updated_at()
returns trigger language plpgsql
set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

create or replace function public.bump_listing_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set listing_count = listing_count + 1 where id = new.seller_id;
  elsif tg_op = 'DELETE' then
    update public.profiles set listing_count = greatest(0, listing_count - 1) where id = old.seller_id;
  end if;
  return null;
end; $$;

-- Tighten event-insert policy: anonymous can only insert 'view' events; signed-in users can insert all event types for themselves
drop policy if exists "events anyone insert" on public.listing_events;
create policy "events insert view anon" on public.listing_events for insert
  with check (
    event_type = 'view'
    or (auth.uid() is not null and (actor_id is null or actor_id = auth.uid()))
  );

-- Tighten listing-photos public read: only objects under a folder (so no top-level listing of bucket)
drop policy if exists "listing-photos public read" on storage.objects;
create policy "listing-photos public read" on storage.objects for select
  using (bucket_id = 'listing-photos' and position('/' in name) > 0);