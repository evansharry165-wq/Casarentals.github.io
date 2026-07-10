-- ═══════════════════════════════════════════════════════════════
-- Casa — homepage personalization (Phase 14)
--
-- NOT APPLIED YET — review before running. Same status as
-- supabase/concierge.sql: a real migration, written for review, not
-- run against the live project as part of this pass.
--
-- WHY A NEW TABLE, NOT A JSONB COLUMN ON profiles:
-- The obvious first instinct is a `homepage_preferences jsonb` column
-- directly on `profiles`, since this is genuinely 1:1-per-user data —
-- but `profiles` already has `create policy "profiles are publicly
-- readable" on profiles for select using (true)` (schema.sql), by
-- design, so host-profile.html/property.html can show a host's public
-- bio/name/rating to any visitor. RLS in Postgres is row-level, not
-- column-level: there is no way to keep one column on that same row
-- private while every other column on it stays `using (true)` public,
-- short of a view or column-level GRANT/REVOKE — real options, but a
-- second security mechanism this codebase doesn't otherwise use, for a
-- feature that doesn't need it. A separate table with its own
-- genuinely private RLS policy (own-row-only, no `using (true)`
-- anywhere) is simpler, and is the only way to satisfy "a user can only
-- read/write their own preferences" without touching the existing
-- public profiles policy at all. `text[]` columns (not jsonb) match the
-- existing convention on profiles.languages — three flat lists don't
-- need jsonb's flexibility.
--
-- ADDITIVE & IDEMPOTENT — safe to re-run. Apply after schema.sql.
-- ═══════════════════════════════════════════════════════════════

create table homepage_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  -- Region slugs — the exact same vocabulary as tag.html's CASA_TAG_MAP
  -- region-scoped entries / browse.html's region filter (lake-district,
  -- cornwall, highlands, norfolk, yorkshire, cotswolds, snowdonia, skye,
  -- causeway, pembrokeshire, devon…). Not validated by a CHECK constraint
  -- against a fixed list — that list lives in casa-tags.js on the
  -- frontend and already changes independently of this schema (e.g.
  -- Yorkshire was added there without a migration); a stale slug here
  -- just silently matches nothing on the frontend rather than breaking
  -- an insert.
  regions text[] not null default '{}',
  -- Lifestyle/amenity tags — the exact same vocabulary as
  -- casa-properties.js's `tags` array / browse.html's amenity filter
  -- pills (pets, woodburner, hottub, seaview, offgrid, romantic, garden,
  -- sauna, etc.).
  tags text[] not null default '{}',
  -- Property types — casa-properties.js's `type` field (cottage, barn,
  -- cabin, farmhouse, glamping, houseboat, manor).
  property_types text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table homepage_preferences enable row level security;

-- Own-row-only, every operation, no public-read policy at all —
-- deliberately the opposite of profiles' own "publicly readable"
-- policy, which is the entire reason this is a separate table. Every
-- column here is meant to be freely user-editable (it's literally "my
-- own choices"), so unlike profiles' verification columns
-- (rls-hardening.sql), no column-level protection trigger is needed —
-- there's nothing on this row that should be off-limits to its own
-- owner.
create policy "users manage their own homepage preferences" on homepage_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index idx_homepage_preferences_user on homepage_preferences(user_id);
