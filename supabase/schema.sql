-- Casa.co.uk — Supabase schema (run in SQL Editor)
-- Auth: enable Email provider in Authentication → Providers

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'guest' check (role in ('guest', 'host')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'guest')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enquiries (guest → host)
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  property_id integer not null,
  property_title text,
  host_name text,
  host_initial text,
  guest_id uuid references auth.users (id) on delete set null,
  guest_name text,
  guest_email text not null,
  checkin date not null,
  checkout date not null,
  guests integer not null default 1,
  pets boolean not null default false,
  message text not null,
  price_per_night integer,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'confirmed')),
  created_at timestamptz not null default now()
);

create index if not exists enquiries_guest_id_idx on public.enquiries (guest_id);
create index if not exists enquiries_guest_email_idx on public.enquiries (guest_email);
create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;

create policy "Guests can insert enquiries"
  on public.enquiries for insert
  with check (
    guest_id is null
    or auth.uid() = guest_id
  );

create policy "Guests can read own enquiries"
  on public.enquiries for select
  using (
    auth.uid() = guest_id
    or lower(guest_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Waitlist (pre-launch signups)
create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  fname text not null,
  lname text not null,
  email text not null,
  role text not null check (role in ('guest', 'host')),
  region text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_email_idx on public.waitlist_entries (email);
create index if not exists waitlist_created_at_idx on public.waitlist_entries (created_at);

alter table public.waitlist_entries enable row level security;

create policy "Anyone can join waitlist"
  on public.waitlist_entries for insert
  with check (true);

-- Public waitlist count (no PII) for position display
create or replace function public.waitlist_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint from public.waitlist_entries;
$$;

grant execute on function public.waitlist_count() to anon, authenticated;
