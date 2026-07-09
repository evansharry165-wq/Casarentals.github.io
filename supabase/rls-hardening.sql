-- ═══════════════════════════════════════════════════════════════
-- Casa — RLS hardening
--
-- A real security pass, not a re-read of schema.sql's comments: spot-
-- checked every "own row" policy against what it actually permits, not
-- what its name says. Row Level Security only ever controls WHICH ROWS
-- a policy lets through — it says nothing about WHICH COLUMNS on an
-- already-own-row can be changed. Four real, exploitable gaps came from
-- exactly that gotcha: an "own row" USING clause with no column-level
-- guard, on a table with at least one column that should never be
-- client-settable.
--
-- Found (all reachable today with nothing more than a browser devtools
-- console and a real session — no special access needed):
--
-- 1. profiles — "users update their own profile" has no column
--    restriction at all. Any signed-in user can currently do
--    `supabase.from('profiles').update({ gov_id_verified: true,
--    background_check: true }).eq('id', myId)` and forge their own
--    "Verified+" badge — the entire point of VERIFICATION-POLICY.md's
--    manual-review process, bypassed in one API call.
-- 2. community_members — "users join/leave" has no column restriction
--    on `role`. Any user can insert or update their own membership row
--    with `role: 'admin'` and become a moderator of any community
--    (including on first join, with no prior member), gaining
--    `casa_is_moderator()`-gated powers (ban users, edit the
--    community, flip is_official).
-- 3. messages — "participants mark messages read" has no column
--    restriction. Its own name says "mark read", but the policy lets
--    any participant rewrite ANY column on ANY message in a
--    conversation they're in, including `body` and `sender_id` — not
--    just their own messages, and not just read_at.
-- 4. enquiries — "guest or host update their enquiries" lets the GUEST
--    update the same row the HOST is supposed to confirm/decline.
--    Nothing stops a guest from calling
--    `supabase.from('enquiries').update({status:'confirmed'})` on their
--    own pending enquiry and self-confirming a booking the host never
--    approved, or silently altering check_in/check_out/total_price
--    after submitting.
--
-- Fix pattern: tighten the RLS row-level USING clause where the row
-- itself shouldn't have been reachable by both parties (enquiries), and
-- add a BEFORE UPDATE trigger guard on the others that resets protected
-- columns to their prior value for any plain authenticated-role
-- request — auth.role() = 'authenticated' is specifically the role
-- PostgREST assigns real end-user sessions; it is NOT what Harry's
-- Supabase Dashboard table editor connects as (that's a service-role/
-- superuser context), so his manual verification workflow described in
-- VERIFICATION-POLICY.md is untouched by this. SECURITY DEFINER
-- functions bypass RLS row checks but NOT triggers, so
-- create_conversation_for_enquiry's legitimate conversation_id write
-- is explicitly allowed through the enquiries guard.
--
-- ADDITIVE & IDEMPOTENT — safe to re-run. Apply after schema.sql.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. profiles: protect the four verification columns ───
create or replace function public.casa_protect_verification_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated'
     and coalesce(current_setting('casa.internal_write', true), '') <> 'true' then
    if new.email_verified is distinct from old.email_verified
       or new.phone_verified is distinct from old.phone_verified
       or new.gov_id_verified is distinct from old.gov_id_verified
       or new.background_check is distinct from old.background_check then
      new.email_verified := old.email_verified;
      new.phone_verified := old.phone_verified;
      new.gov_id_verified := old.gov_id_verified;
      new.background_check := old.background_check;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_verification_columns on profiles;
create trigger trg_protect_verification_columns
  before update on profiles
  for each row execute function public.casa_protect_verification_columns();

-- ─── 2. community_members: protect the role column ───
create or replace function public.casa_protect_member_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    if tg_op = 'INSERT' then
      new.role := 'member';
    elsif new.role is distinct from old.role then
      new.role := old.role;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_member_role on community_members;
create trigger trg_protect_member_role
  before insert or update on community_members
  for each row execute function public.casa_protect_member_role();

-- ─── 3. messages: "mark read" should only ever touch read_at ───
create or replace function public.casa_protect_message_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    new.conversation_id := old.conversation_id;
    new.sender_id := old.sender_id;
    new.body := old.body;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_message_columns on messages;
create trigger trg_protect_message_columns
  before update on messages
  for each row execute function public.casa_protect_message_columns();

-- ─── 4. enquiries: only the host can update, and only status changes
--        (conversation_id is the one exception — see comment above) ───
drop policy if exists "guest or host update their enquiries" on enquiries;
create policy "host confirms or declines their received enquiries" on enquiries
  for update using (host_id = auth.uid());

create or replace function public.casa_protect_enquiry_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    new.property_id := old.property_id;
    new.guest_id := old.guest_id;
    new.host_id := old.host_id;
    new.check_in := old.check_in;
    new.check_out := old.check_out;
    new.guests := old.guests;
    new.pets := old.pets;
    new.message := old.message;
    new.special_requests := old.special_requests;
    new.total_price := old.total_price;
    new.created_at := old.created_at;
    -- status and conversation_id are deliberately left alone: status
    -- for the host's confirm/decline action (host.html, messages.html),
    -- conversation_id for create_conversation_for_enquiry (SECURITY
    -- DEFINER, bypasses the RLS row check above but not this trigger).
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_enquiry_columns on enquiries;
create trigger trg_protect_enquiry_columns
  before update on enquiries
  for each row execute function public.casa_protect_enquiry_columns();
