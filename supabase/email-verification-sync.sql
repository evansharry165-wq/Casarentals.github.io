-- ═══════════════════════════════════════════════════════════════
-- Casa — sync real email confirmation into profiles.email_verified
--
-- Supabase Auth already tracks real email confirmation for certain
-- (auth.users.email_confirmed_at gets set the moment a user completes
-- the magic-link/6-digit-code flow in signup.html/auth-callback.html —
-- that's Supabase's own infrastructure, not something Casa built).
-- Nothing synced that into profiles.email_verified though, so
-- VERIFICATION-POLICY.md correctly documented it as "manual today" —
-- Harry was re-confirming by hand something Supabase already knew for
-- certain. This closes that one gap. phone_verified / gov_id_verified /
-- background_check stay exactly as documented: genuinely manual, no
-- automated source of truth exists for those yet.
--
-- Two parts:
--   1. handle_new_user() (schema.sql) now seeds email_verified from
--      auth.users.email_confirmed_at at profile-creation time — covers
--      a user who's already confirmed the moment their profiles row is
--      created (e.g. an OAuth-style flow where confirmation IS signup).
--   2. A new trigger on auth.users fires the normal path: signUp()
--      creates an unconfirmed user, then confirming later flips
--      email_confirmed_at from null to a real timestamp, and this
--      syncs that into the existing profiles row.
-- Plus a one-time backfill for accounts that confirmed before this
-- migration existed (Harry's own test accounts, most likely).
--
-- Depends on rls-hardening.sql's trg_protect_verification_columns being
-- applied first (or not at all) — either order is safe, since this sets
-- casa.internal_write for its own update regardless of whether that
-- guard trigger exists yet.
--
-- ADDITIVE & IDEMPOTENT — safe to re-run. Apply after schema.sql.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'guest'),
    new.email_confirmed_at is not null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.casa_sync_email_verified()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    perform set_config('casa.internal_write', 'true', true);
    update public.profiles set email_verified = true where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.casa_sync_email_verified();

-- One-time backfill for accounts confirmed before this migration existed.
update public.profiles p
set email_verified = true
from auth.users u
where u.id = p.id
  and u.email_confirmed_at is not null
  and p.email_verified = false;
