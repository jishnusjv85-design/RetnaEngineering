-- RECO setup. Run once in the intended Supabase project's SQL editor.
-- No service secrets are stored in SQL or in the browser.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
grant all on public.admin_users to service_role;
create policy "Staff may check their own membership" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique default ('RECO-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  customer_name text not null check (length(trim(customer_name)) between 1 and 120),
  mobile_number text not null check (mobile_number ~ '^([+]91[ -]?)?[6-9][0-9]{9}$'),
  whatsapp_number text not null check (whatsapp_number ~ '^([+]91[ -]?)?[6-9][0-9]{9}$'),
  email text not null check (length(email) <= 200 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  car_manufacturer text not null check (length(trim(car_manufacturer)) between 1 and 120),
  car_model text not null check (length(trim(car_model)) between 1 and 120),
  manufacturing_year integer not null check (manufacturing_year between 1950 and 2200),
  fuel_type text not null check (fuel_type in ('Petrol','Diesel','CNG','LPG','Hybrid','Other')),
  registration_number text check (length(registration_number) <= 30),
  booking_type text not null check (booking_type in ('Car Silencer Inspection','Silencer Replacement Consultation','Exhaust Noise Inspection','Car Muffler Enquiry','Exhaust Pipe Enquiry','Custom Car Silencer Requirement','Product Pickup','General Product Consultation')),
  booking_date date not null,
  booking_time text not null check (booking_time in ('9:30 AM – 10:30 AM','10:30 AM – 11:30 AM','11:30 AM – 12:30 PM','2:00 PM – 3:00 PM','3:00 PM – 4:00 PM','4:00 PM – 5:00 PM')),
  requirement text not null check (length(trim(requirement)) between 1 and 3000),
  -- Private storage object path, NOT a publicly accessible image URL.
  uploaded_image_url text,
  preferred_contact_method text not null check (preferred_contact_method in ('Call','WhatsApp','Email')),
  status text not null default 'Pending' check (status in ('Pending','Confirmed','Completed','Cancelled')),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
-- The database, not the browser, is the final arbiter of slot occupancy.
create unique index bookings_unique_active_slot on public.bookings(booking_date, booking_time) where status <> 'Cancelled';
create index bookings_created_idx on public.bookings(created_at desc);
create index bookings_status_date_idx on public.bookings(status, booking_date);

create table public.booking_blocks (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  booking_time text check (booking_time in ('9:30 AM – 10:30 AM','10:30 AM – 11:30 AM','11:30 AM – 12:30 PM','2:00 PM – 3:00 PM','3:00 PM – 4:00 PM','4:00 PM – 5:00 PM')),
  reason text not null default 'Unavailable' check (length(reason) between 1 and 200),
  created_at timestamptz not null default now()
);
create unique index booking_blocks_date_slot_idx on public.booking_blocks(block_date, coalesce(booking_time, '*'));

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('REQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  customer_name text not null check (length(trim(customer_name)) between 1 and 120),
  mobile_number text not null check (mobile_number ~ '^([+]91[ -]?)?[6-9][0-9]{9}$'),
  email text not null check (length(email) <= 200),
  car_manufacturer text not null check (length(trim(car_manufacturer)) between 1 and 120),
  car_model text not null check (length(trim(car_model)) between 1 and 120),
  manufacturing_year integer not null check (manufacturing_year between 1950 and 2200),
  fuel_type text not null check (fuel_type in ('Petrol','Diesel','CNG','LPG','Hybrid','Other')),
  condition text not null check (length(trim(condition)) between 1 and 200),
  required_product text not null check (length(trim(required_product)) between 1 and 200),
  requirement text not null check (length(trim(requirement)) between 1 and 3000),
  uploaded_image_url text,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index enquiries_created_idx on public.enquiries(created_at desc);

alter table public.bookings enable row level security;
alter table public.booking_blocks enable row level security;
alter table public.enquiries enable row level security;
revoke all on public.bookings, public.booking_blocks, public.enquiries from anon, authenticated;
grant select, update on public.bookings to authenticated;
grant select, insert, update, delete on public.booking_blocks to authenticated;
grant select on public.enquiries to authenticated;
grant all on public.bookings, public.booking_blocks, public.enquiries to service_role;

create policy "Allowlisted staff read bookings" on public.bookings for select to authenticated
  using (exists(select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Allowlisted staff update bookings" on public.bookings for update to authenticated
  using (exists(select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists(select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Allowlisted staff manage blocks" on public.booking_blocks for all to authenticated
  using (exists(select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists(select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Allowlisted staff read enquiries" on public.enquiries for select to authenticated
  using (exists(select 1 from public.admin_users where user_id = (select auth.uid())));

create function private.guard_booking_schedule() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare starts_at time; needs_schedule_check boolean;
begin
  -- Lock dates in a consistent order, also serializing block creation.
  if TG_OP = 'UPDATE' then
    perform pg_advisory_xact_lock(741988, least(old.booking_date, new.booking_date) - date '2000-01-01');
    perform pg_advisory_xact_lock(741988, greatest(old.booking_date, new.booking_date) - date '2000-01-01');
    needs_schedule_check := old.booking_date is distinct from new.booking_date or old.booking_time is distinct from new.booking_time or (old.status = 'Cancelled' and new.status <> 'Cancelled');
  else
    perform pg_advisory_xact_lock(741988, new.booking_date - date '2000-01-01');
    needs_schedule_check := true;
  end if;
  if new.status = 'Cancelled' then return new; end if;
  if needs_schedule_check then
    if extract(dow from new.booking_date) = 0 then raise exception 'Sundays are unavailable' using errcode = 'P0001'; end if;
    starts_at := case new.booking_time when '9:30 AM – 10:30 AM' then time '09:30' when '10:30 AM – 11:30 AM' then time '10:30' when '11:30 AM – 12:30 PM' then time '11:30' when '2:00 PM – 3:00 PM' then time '14:00' when '3:00 PM – 4:00 PM' then time '15:00' when '4:00 PM – 5:00 PM' then time '16:00' end;
    if starts_at is null or (new.booking_date + starts_at) at time zone 'Asia/Kolkata' <= now() then raise exception 'Please choose a future time slot' using errcode = 'P0001'; end if;
    if exists(select 1 from public.booking_blocks where block_date = new.booking_date and (booking_time is null or booking_time = new.booking_time)) then raise exception 'This time slot is unavailable' using errcode = 'P0001'; end if;
  end if;
  return new;
end $$;
create trigger guard_booking_schedule before insert or update on public.bookings for each row execute function private.guard_booking_schedule();

create function private.guard_booking_block() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(741988, new.block_date - date '2000-01-01');
  if new.block_date < (now() at time zone 'Asia/Kolkata')::date then raise exception 'Cannot block a past date' using errcode = 'P0001'; end if;
  if exists(select 1 from public.bookings where booking_date = new.block_date and status <> 'Cancelled' and (new.booking_time is null or booking_time = new.booking_time)) then raise exception 'Reschedule or cancel existing bookings before blocking this time' using errcode = 'P0001'; end if;
  return new;
end $$;
create trigger guard_booking_block before insert or update on public.booking_blocks for each row execute function private.guard_booking_block();
revoke all on function private.guard_booking_schedule(), private.guard_booking_block() from public;

-- Server-only, atomic rate limits. Only hashes of IP/mobile values are stored.
create table private.request_limits (key text primary key, count integer not null, expires_at timestamptz not null);
alter table private.request_limits enable row level security;
grant all on private.request_limits to service_role;
create function public.reco_consume_rate_limit(p_key text) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare requests integer;
begin
  if length(p_key) <> 64 then return false; end if;
  delete from private.request_limits where expires_at < now() - interval '1 day';
  insert into private.request_limits(key,count,expires_at) values(p_key,1,now()+interval '15 minutes')
  on conflict (key) do update set count = case when private.request_limits.expires_at < now() then 1 else private.request_limits.count + 1 end,
    expires_at = case when private.request_limits.expires_at < now() then now()+interval '15 minutes' else private.request_limits.expires_at end
  returning count into requests;
  return requests <= 8;
end $$;
revoke all on function public.reco_consume_rate_limit(text) from public, anon, authenticated;
grant execute on function public.reco_consume_rate_limit(text) to service_role;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('silencer-photos','silencer-photos',false,2097152,array['image/jpeg','image/png','image/webp']);
create policy "Only allowlisted staff read silencer photos" on storage.objects for select to authenticated
  using (bucket_id = 'silencer-photos' and exists(select 1 from public.admin_users where user_id = (select auth.uid())));
commit;

-- AFTER creating the staff account in Supabase Auth (replace the UUID):
-- insert into public.admin_users(user_id) values ('staff-auth-user-uuid');
-- No signup UI or customer access to booking rows is provided.
