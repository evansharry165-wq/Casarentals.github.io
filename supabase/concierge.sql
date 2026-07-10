-- ═══════════════════════════════════════════════════════════════
-- Casa — Concierge data model (Phase 13, SCOPING ONLY)
--
-- NOT APPLIED. This is a design for review, not a live migration —
-- unlike every other file in this directory, do not run this against
-- the live project yet. It exists so the schema is ready the moment
-- Harry has actually connected a real WhatsApp Business API account
-- and/or a Concierge-specific Resend sending domain — see
-- CONCIERGE-INTEGRATION.md for exactly what that requires outside of
-- code, and realistic timelines. Nothing here creates, calls, or
-- depends on either integration; it only shapes where their data would
-- land once they exist.
--
-- WHY NOT JUST REUSE conversations/messages:
-- `messages.sender_id uuid not null references profiles(id)` requires
-- a real Casa account on every message. A guest reaching a host over
-- WhatsApp or a Concierge-specific email inbox may not be a signed-in
-- Casa user at all — they're identified by a phone number or an email
-- address, not a profiles.id, and may never create a Casa account.
-- Forcing that through `messages` would mean either fabricating a
-- profiles row for every external contact (identity/privacy problem —
-- Casa would be inventing "accounts" for people who never signed up)
-- or loosening `sender_id`'s NOT NULL/FK, which would weaken every
-- other real internal conversation on the same table. A parallel,
-- purpose-built shape avoids both, while `concierge_threads
-- .conversation_id` still lets a thread be linked to a real internal
-- conversation when the same guest also has one (e.g. they enquired
-- through Casa AND messaged the host's WhatsApp number) — genuinely
-- additive, not a duplicate of what schema.sql already built.
--
-- THE TWO GUARDRAILS THIS SCHEMA EXISTS TO PRESERVE (see
-- CONCIERGE-INTEGRATION.md for the full explanation of *how*):
--   1. Flat monthly pricing only — never a % of bookings. Nothing in
--      this file stores or derives a booking-value-linked charge; nothing
--      to enforce here because there's simply no such column anywhere in
--      this schema. (A live copy inconsistency was found elsewhere on
--      the site while scoping this — flagged in CONCIERGE-INTEGRATION.md,
--      not fixed here, out of scope for a schema pass.)
--   2. Concierge only ever drafts, never auto-sends. Enforced at the data
--      layer, not just app code: `concierge_messages` has NO UPDATE
--      policy for authenticated users at all (not even a column-
--      restricted one — the rls-hardening.sql lesson applied from the
--      start here, rather than retrofitted), and its INSERT policy's
--      WITH CHECK clause only ever permits status='draft'. The ONLY path
--      from draft to sent is `casa_send_concierge_message()`, a
--      SECURITY DEFINER function a real authenticated host must call
--      themselves. See the full walkthrough below the table definitions.
--
-- ADDITIVE & IDEMPOTENT (once applied) — safe to re-run. Would apply
-- after schema.sql. Review this file and CONCIERGE-INTEGRATION.md
-- together before running anything.
-- ═══════════════════════════════════════════════════════════════

-- ─── concierge_settings ───
-- The real, server-side home for what's currently ONLY in the browser's
-- localStorage (casa:concierge, casa-concierge.js:CASA_CONCIERGE_DEFAULTS
-- / casaGetConciergeSettings / casaSaveConciergeSettings). That's fine
-- while Concierge is a client-only rules simulator (host-concierge.html's
-- "test your rules" panel) — it stops being fine the moment a real
-- WhatsApp/email message needs a *server-side* process (an Edge
-- Function, not a browser tab that might not be open) to read a host's
-- rules and draft a reply. One row per host, mirroring the existing
-- single-settings-object shape (CASA_CONCIERGE_DEFAULTS.properties is
-- already an array of property ids one settings object applies to, not
-- one settings object per property) — column names map 1:1 to the
-- existing local keys so wiring this up later is mechanical, the same
-- reason schema.sql's own header gives for its field-naming choices.
-- NOTE: creating this table does not change what host-concierge.html or
-- host.html actually read from/write to — that wiring is a separate,
-- later frontend task (this pass is schema + docs only, per brief).
create table concierge_settings (
  id bigint generated always as identity primary key,
  host_id uuid not null references profiles(id) on delete cascade,
  enabled boolean not null default false,
  min_nights int not null default 2,
  max_guests int not null default 6,
  min_lead_days int not null default 3,
  price_floor int not null default 150,
  pets_policy text not null default 'allowed' check (pets_policy in ('allowed', 'on-request', 'none')),
  auto_accept boolean not null default false,
  auto_decline_under_min boolean not null default true,
  check_in_from text not null default '15:00',   -- display string, not a `time` — matches the existing UI's plain HH:MM input, no time arithmetic done on it anywhere
  check_out_by text not null default '10:00',
  tone text not null default 'warm' check (tone in ('warm', 'professional', 'brief')),
  escalate_deposit boolean not null default true,
  escalate_custom_requests boolean not null default true,
  property_ids bigint[] not null default '{}',  -- casa-concierge.js: `properties`
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (host_id)
);

-- ─── concierge_channels ───
-- One row per external channel a host has actually connected — WhatsApp
-- Business number, or a Concierge-specific inbound email address. Starts
-- empty; a row only exists once Harry (or, later, a self-serve host
-- flow) has genuinely completed that channel's setup. `status` is
-- deliberately NOT host-settable to 'active' (see the protective trigger
-- below) — a host claiming "active" for a channel that was never really
-- verified would mislead guests into thinking Concierge is live on a
-- channel that silently doesn't work.
create table concierge_channels (
  id bigint generated always as identity primary key,
  host_id uuid not null references profiles(id) on delete cascade,
  channel_type text not null check (channel_type in ('whatsapp', 'email')),
  external_identity text not null,     -- E.164 WhatsApp Business number, or the Concierge-specific email address
  display_name text,                    -- WhatsApp Business Profile display name, once Meta approves it
  status text not null default 'pending_verification' check (status in ('pending_verification', 'active', 'disabled')),
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  unique (host_id, channel_type)
);

-- ─── concierge_threads ───
-- The generic "concierge_thread" concept the brief asks for — one per
-- external conversation with a guest contact, on one channel. Optionally
-- bridges to a real internal `conversations` row (nullable: a WhatsApp
-- contact may never have gone through Casa's own enquiry flow at all).
-- `host_id` is denormalised here rather than only reachable via a join
-- through `channel_id` -> concierge_channels.host_id — deliberately, so
-- every RLS check in this file needs at most one join (thread ->
-- channel would otherwise be a second hop on every single policy in
-- concierge_messages too). Not client-writable (no INSERT policy on
-- this table at all, see below), so it can only ever be set by the
-- same trusted service-role code that resolves channel_id in the first
-- place — that code is responsible for keeping the two in sync, the
-- same way schema.sql already trusts create_conversation_for_enquiry to
-- keep enquiries.conversation_id consistent rather than re-deriving it
-- via a constraint on every read.
create table concierge_threads (
  id bigint generated always as identity primary key,
  host_id uuid not null references profiles(id) on delete cascade,
  property_id bigint references properties(id) on delete set null,
  channel_id bigint not null references concierge_channels(id) on delete cascade,
  conversation_id bigint references conversations(id) on delete set null,
  external_contact text not null,        -- the guest's phone number or email address on this channel — not a profiles.id FK, they may not be a Casa user
  external_contact_name text,            -- best-known display name (WhatsApp profile name, or email "From" header)
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

-- ─── concierge_messages ───
-- Every message in a thread — inbound from the guest, an AI-drafted
-- reply awaiting the host, a host-typed reply awaiting send, or an
-- actually-sent message. See the CHECK constraint and the RLS section
-- below for how "draft never means sent" is enforced, not just implied
-- by these status names.
create table concierge_messages (
  id bigint generated always as identity primary key,
  thread_id bigint not null references concierge_threads(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  status text not null default 'received' check (status in ('draft', 'sent', 'discarded', 'received')),
  body text not null,
  drafted_by text check (drafted_by in ('concierge_ai', 'host')),  -- who wrote it; null for inbound
  -- Who actually sent it (always a real host, never 'concierge_ai' —
  -- see casa_send_concierge_message below); null until sent. Deliberately
  -- `on delete set null`, not `on delete cascade` like schema.sql's own
  -- `messages.sender_id` — a message that genuinely reached a guest is a
  -- real historical record of what was said, and shouldn't disappear
  -- just because the sending host's account is deleted later. Only the
  -- attribution is lost, not the record.
  sent_by uuid references profiles(id) on delete set null,
  external_message_id text,   -- WhatsApp message id / email Message-ID header, for later delivery/read-receipt reconciliation
  created_at timestamptz not null default now(),
  sent_at timestamptz,

  -- Shape guard: an inbound (guest-sent) row can only ever be 'received'
  -- — draft/sent/discarded only make sense for something Casa is
  -- sending. An outbound row can never be 'received'.
  constraint concierge_messages_direction_status_shape check (
    (direction = 'inbound' and status = 'received')
    or (direction = 'outbound' and status in ('draft', 'sent', 'discarded'))
  ),
  -- A draft must record who drafted it; a sent message must record who
  -- sent it and when. Both are the actual data-level trace of "a human
  -- was involved", not just a status label.
  constraint concierge_messages_authorship_shape check (
    (status != 'draft' or drafted_by is not null)
    and (status != 'sent' or (sent_by is not null and sent_at is not null))
  )
);

create index idx_concierge_threads_host on concierge_threads(host_id);
create index idx_concierge_messages_thread on concierge_messages(thread_id, created_at);

-- ═══════════════════════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════════════════════
alter table concierge_settings enable row level security;
alter table concierge_channels enable row level security;
alter table concierge_threads enable row level security;
alter table concierge_messages enable row level security;

-- concierge_settings: a host's own rules, no shared/asymmetric access —
-- every column here is meant to be freely host-editable (it's literally
-- "my own settings"), so a plain "own row" policy is correct, the same
-- reasoning schema.sql already uses for saved_properties/follows. No
-- column protection needed: unlike profiles.gov_id_verified or
-- properties.published, nothing on this row is meant to be off-limits
-- to the row's own owner.
create policy "host manages their own concierge settings" on concierge_settings
  for all using (host_id = auth.uid()) with check (host_id = auth.uid());

-- concierge_channels: host can see/create their own channel rows and
-- edit their own input fields, but never self-promote status (below).
create policy "host manages their own concierge channels" on concierge_channels
  for all using (host_id = auth.uid()) with check (host_id = auth.uid());

create or replace function public.casa_protect_concierge_channel_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    if tg_op = 'INSERT' then
      new.status := 'pending_verification';
      new.connected_at := null;
    else
      new.status := old.status;
      new.connected_at := old.connected_at;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_concierge_channel_status on concierge_channels;
create trigger trg_protect_concierge_channel_status
  before insert or update on concierge_channels
  for each row execute function public.casa_protect_concierge_channel_status();

-- concierge_threads: host reads/lists their own threads and may update
-- `status` (open/closed) themselves, but not reassign a thread to a
-- different channel/property/contact — same shape of gap
-- rls-hardening.sql found and fixed on `messages`, applied here from
-- the start instead of retrofitted later.
create policy "host reads their own concierge threads" on concierge_threads
  for select using (host_id = auth.uid());
create policy "host updates their own concierge threads" on concierge_threads
  for update using (host_id = auth.uid());

-- No INSERT policy at all, deliberately — a thread only ever comes into
-- existence because a guest contacted a host first (a real inbound
-- WhatsApp message or email, created by a service-role webhook handler,
-- which bypasses RLS entirely), never because a host clicked something
-- claiming a guest reached out. This mirrors property.html's existing
-- comment on why Casa's own messaging is enquiry-gated: "a guest
-- messages a host by enquiring, not via a free-standing DM" — the same
-- guest-initiates-first principle, applied to the external channels too.

create or replace function public.casa_protect_concierge_thread_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    new.host_id := old.host_id;
    new.property_id := old.property_id;
    new.channel_id := old.channel_id;
    new.conversation_id := old.conversation_id;
    new.external_contact := old.external_contact;
    new.external_contact_name := old.external_contact_name;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_concierge_thread_columns on concierge_threads;
create trigger trg_protect_concierge_thread_columns
  before update on concierge_threads
  for each row execute function public.casa_protect_concierge_thread_columns();

-- ─── concierge_messages: the guardrail-2 enforcement ───
-- Read: a host can read every message in their own threads.
create policy "host reads messages in their own concierge threads" on concierge_messages
  for select using (
    exists (select 1 from concierge_threads t where t.id = concierge_messages.thread_id and t.host_id = auth.uid())
  );

-- Insert: a host may only ever insert an OUTBOUND DRAFT of their own —
-- never 'sent' (that requires casa_send_concierge_message below), never
-- 'received' (inbound only ever arrives via a service-role webhook,
-- which bypasses RLS entirely and is not reachable by a normal client
-- session at all). This WITH CHECK clause is the actual enforcement —
-- not a comment promising it, a constraint the database itself checks
-- on every insert regardless of what the client sends.
create policy "host drafts outbound messages in their own threads" on concierge_messages
  for insert
  with check (
    direction = 'outbound' and status = 'draft'
    and exists (select 1 from concierge_threads t where t.id = thread_id and t.host_id = auth.uid())
  );

-- No DELETE policy at all — a draft a host doesn't want to send is
-- *discarded* (see casa_discard_concierge_draft below), not deleted.
-- 'discarded' is a first-class status precisely so this table keeps the
-- same "permanent, auditable history" property messages.html already
-- relies on for sent messages (never delete a real conversation record,
-- even one that ended in "didn't send this after all") — a plain DELETE
-- policy here would have quietly undermined that for drafts specifically.

-- Deliberately NO update policy at all for concierge_messages. With RLS
-- enabled and zero UPDATE policies matching the 'authenticated' role,
-- Postgres denies every direct UPDATE outright — stronger than a
-- column-restricted trigger (rls-hardening.sql's fix for `messages`
-- needed a trigger precisely because that table's existing "own row"
-- UPDATE policy already permitted rewriting any column once the row
-- matched). There is no legitimate reason a client should ever run a
-- raw UPDATE on this table; the one legitimate status transition
-- (draft -> sent) goes exclusively through the function below.

-- ═══════════════════════════════════════════════════════════════
-- The only draft -> sent path (guardrail 2, the actual mechanism)
--
-- A real authenticated host calls this themselves, e.g. clicking "Send"
-- on a drafted reply in a future messages.html/host-concierge.html UI
-- (not built this pass). It does NOT call WhatsApp's API or Resend
-- itself — actually dispatching the message to the guest is a separate
-- Edge Function that would call this AFTER a successful external send
-- (or before, with a rollback path — a decision for whoever builds that
-- integration once Harry's accounts exist). What this function
-- guarantees, today, at the schema level: no row in this table can ever
-- reach status='sent' without a real, authenticated human explicitly
-- invoking this exact function on their own thread's own draft. Nothing
-- else — no trigger, no default, no other policy — can produce that
-- state.
-- ═══════════════════════════════════════════════════════════════
create or replace function public.casa_send_concierge_message(p_message_id bigint)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_msg concierge_messages%rowtype;
  v_host_id uuid;
begin
  select * into v_msg from concierge_messages where id = p_message_id;
  if v_msg.id is null then
    raise exception 'message not found';
  end if;

  select host_id into v_host_id from concierge_threads where id = v_msg.thread_id;
  if v_host_id is null or v_host_id != auth.uid() then
    raise exception 'not authorized';
  end if;

  if v_msg.direction != 'outbound' or v_msg.status != 'draft' then
    raise exception 'only a pending outbound draft can be sent';
  end if;

  update concierge_messages
  set status = 'sent', sent_by = auth.uid(), sent_at = now()
  where id = p_message_id;

  update concierge_threads set last_message_at = now() where id = v_msg.thread_id;
end;
$$;

grant execute on function public.casa_send_concierge_message(bigint) to authenticated;

-- The only way a draft goes away without being sent — same
-- SECURITY DEFINER + ownership-check shape as casa_send_concierge_message,
-- so "who can make a draft disappear" has exactly one, auditable path
-- too, not just "who can make it sent".
create or replace function public.casa_discard_concierge_draft(p_message_id bigint)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_host_id uuid;
begin
  select t.host_id into v_host_id
  from concierge_messages m join concierge_threads t on t.id = m.thread_id
  where m.id = p_message_id and m.status = 'draft';

  if v_host_id is null or v_host_id != auth.uid() then
    raise exception 'not authorized';
  end if;

  update concierge_messages set status = 'discarded' where id = p_message_id;
end;
$$;

grant execute on function public.casa_discard_concierge_draft(bigint) to authenticated;

-- Realtime for a future live Concierge inbox UI, matching messages.html's
-- existing pattern. Conditional add, same idempotent-safe pattern
-- notifications.sql uses.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'concierge_messages'
  ) then
    execute 'alter publication supabase_realtime add table concierge_messages';
  end if;
end $$;
