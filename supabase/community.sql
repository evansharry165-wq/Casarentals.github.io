-- ═══════════════════════════════════════════════════════════════
-- Casa — Community platform (Phase 07)
--
-- Expands the Phase-06 feed (schema.sql) into a full property +
-- holidaying community: "spaces" (region + interest communities),
-- voting & hot/top/new ranking, threaded comments, saves, reposts,
-- hashtags, polls, rich media, awards, local events, and richer
-- notifications + moderation.
--
-- ADDITIVE & IDEMPOTENT: layers on top of schema.sql and is safe to
-- re-run (uses `if not exists`, and drops+recreates triggers/policies).
-- Apply after schema.sql in the Supabase SQL editor.
--
-- Denormalised counters (score, upvotes, reply_count, member_count,
-- karma …) are maintained incrementally by triggers so feed ranking
-- and profile stats stay a single indexed read, never an aggregate.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────
-- 1 · Profile extensions — community identity + reputation
-- ───────────────────────────────────────────────
alter table profiles
  add column if not exists username     text unique,
  add column if not exists banner_url   text,
  add column if not exists website      text,
  add column if not exists interests    text[] not null default '{}',
  add column if not exists post_karma   int not null default 0,
  add column if not exists comment_karma int not null default 0;

-- ───────────────────────────────────────────────
-- 2 · Communities — Casa's "spaces": regions + interest topics
-- ───────────────────────────────────────────────
create table if not exists communities (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text,
  kind text not null check (kind in ('region', 'topic', 'interest')) default 'topic',
  region text,                 -- set when kind='region' (matches properties.region)
  icon text,                   -- icon KEY the frontend maps to an SVG (no emoji in UI)
  color text,                  -- accent hex for the space header
  cover_url text,
  is_official boolean not null default false,   -- Casa-curated vs user-created
  is_private boolean not null default false,
  member_count int not null default 0,          -- denormalized (trigger-maintained)
  post_count int not null default 0,            -- denormalized (trigger-maintained)
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists community_members (
  community_id bigint not null references communities(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('member', 'moderator', 'admin')) default 'member',
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table if not exists community_bans (
  community_id bigint not null references communities(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  banned_by uuid references profiles(id) on delete set null,
  reason text,
  expires_at timestamptz,           -- null = permanent
  created_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

-- ───────────────────────────────────────────────
-- 3 · Post extensions — community, title, ranking counters, moderation
-- ───────────────────────────────────────────────
-- feed_posts.type stays the Casa flavour (avail|looking|review|tip|photo).
alter table feed_posts
  add column if not exists community_id bigint references communities(id) on delete set null,
  add column if not exists title       text,
  add column if not exists link_url    text,
  add column if not exists hashtags    text[] not null default '{}',
  add column if not exists score       int not null default 0,
  add column if not exists upvotes     int not null default 0,
  add column if not exists downvotes   int not null default 0,
  add column if not exists reply_count int not null default 0,
  add column if not exists repost_count int not null default 0,
  add column if not exists save_count  int not null default 0,
  add column if not exists pinned      boolean not null default false,
  add column if not exists locked      boolean not null default false,
  add column if not exists edited_at   timestamptz,
  add column if not exists deleted_at  timestamptz;

-- ───────────────────────────────────────────────
-- 4 · Reply extensions — threading + voting + moderation
-- ───────────────────────────────────────────────
alter table feed_replies
  add column if not exists parent_id  bigint references feed_replies(id) on delete cascade,
  add column if not exists score      int not null default 0,
  add column if not exists upvotes    int not null default 0,
  add column if not exists downvotes  int not null default 0,
  add column if not exists edited_at  timestamptz,
  add column if not exists deleted_at timestamptz;

-- ───────────────────────────────────────────────
-- 5 · Voting
-- ───────────────────────────────────────────────
create table if not exists post_votes (
  post_id bigint not null references feed_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists reply_votes (
  reply_id bigint not null references feed_replies(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (reply_id, user_id)
);

-- ───────────────────────────────────────────────
-- 6 · Saves (bookmarks) · reposts · awards
-- ───────────────────────────────────────────────
create table if not exists post_saves (
  user_id uuid not null references profiles(id) on delete cascade,
  post_id bigint not null references feed_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists post_reposts (
  user_id uuid not null references profiles(id) on delete cascade,
  post_id bigint not null references feed_posts(id) on delete cascade,
  comment text,                 -- optional quote-repost note
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists post_awards (
  id bigint generated always as identity primary key,
  post_id bigint not null references feed_posts(id) on delete cascade,
  giver_id uuid not null references profiles(id) on delete cascade,
  award text not null,          -- 'helpful' | 'local-gem' | 'stunning' | 'lifesaver' …
  created_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- 7 · Hashtags (trending discovery)
-- ───────────────────────────────────────────────
create table if not exists hashtags (
  id bigint generated always as identity primary key,
  tag text not null unique,     -- stored without the leading '#', lower-cased
  post_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists post_hashtags (
  post_id bigint not null references feed_posts(id) on delete cascade,
  hashtag_id bigint not null references hashtags(id) on delete cascade,
  primary key (post_id, hashtag_id)
);

-- ───────────────────────────────────────────────
-- 8 · Rich media (multiple images / video per post)
-- ───────────────────────────────────────────────
create table if not exists post_media (
  id bigint generated always as identity primary key,
  post_id bigint not null references feed_posts(id) on delete cascade,
  url text not null,
  kind text not null check (kind in ('image', 'video')) default 'image',
  alt text,
  width int,
  height int,
  sort_order int not null default 0
);

-- ───────────────────────────────────────────────
-- 9 · Polls (X-style)
-- ───────────────────────────────────────────────
create table if not exists post_polls (
  post_id bigint primary key references feed_posts(id) on delete cascade,
  question text not null,
  multi boolean not null default false,   -- allow multiple selections
  closes_at timestamptz
);

create table if not exists poll_options (
  id bigint generated always as identity primary key,
  post_id bigint not null references feed_posts(id) on delete cascade,
  label text not null,
  vote_count int not null default 0,       -- denormalized (trigger-maintained)
  sort_order int not null default 0
);

create table if not exists poll_votes (
  option_id bigint not null references poll_options(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (option_id, user_id)
);

-- ───────────────────────────────────────────────
-- 10 · Local events / meetups (property + travel community)
-- ───────────────────────────────────────────────
create table if not exists community_events (
  id bigint generated always as identity primary key,
  community_id bigint references communities(id) on delete set null,
  host_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  region text,
  location text,               -- free-text venue / meeting point
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity int,
  attendee_count int not null default 0,   -- denormalized
  created_at timestamptz not null default now()
);

create table if not exists event_attendees (
  event_id bigint not null references community_events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null check (status in ('going', 'interested')) default 'going',
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ───────────────────────────────────────────────
-- 11 · Notification + moderation extensions
-- ───────────────────────────────────────────────
alter table notifications
  add column if not exists actor_id    uuid references profiles(id) on delete set null,
  add column if not exists entity_type text,     -- 'post' | 'reply' | 'community' | 'event' | 'follow'
  add column if not exists entity_id   text;

alter table reports
  add column if not exists community_id bigint references communities(id) on delete set null,
  add column if not exists resolved_by  uuid references profiles(id) on delete set null,
  add column if not exists resolved_at  timestamptz;

create table if not exists mod_actions (
  id bigint generated always as identity primary key,
  community_id bigint references communities(id) on delete cascade,
  moderator_id uuid references profiles(id) on delete set null,
  action text not null,        -- 'remove_post' | 'lock_post' | 'ban_user' | 'pin_post' …
  target_type text not null,   -- 'post' | 'reply' | 'user'
  target_id text not null,
  reason text,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- Triggers — keep denormalized counters + karma correct incrementally
-- ═══════════════════════════════════════════════════════════════

-- post votes → feed_posts.score/upvotes/downvotes + author post_karma
create or replace function public.casa_apply_post_vote()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_post   bigint := coalesce(new.post_id, old.post_id);
  v_delta  int := coalesce(new.value, 0) - coalesce(old.value, 0);
  v_up     int := (case when new.value = 1 then 1 else 0 end) - (case when old.value = 1 then 1 else 0 end);
  v_down   int := (case when new.value = -1 then 1 else 0 end) - (case when old.value = -1 then 1 else 0 end);
  v_author uuid;
begin
  update feed_posts set score = score + v_delta, upvotes = upvotes + v_up, downvotes = downvotes + v_down
    where id = v_post returning author_id into v_author;
  if v_author is not null then
    update profiles set post_karma = post_karma + v_delta where id = v_author;
  end if;
  return null;
end $$;
drop trigger if exists trg_post_vote on post_votes;
create trigger trg_post_vote after insert or update or delete on post_votes
  for each row execute function public.casa_apply_post_vote();

-- reply votes → feed_replies.score + author comment_karma
create or replace function public.casa_apply_reply_vote()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_reply  bigint := coalesce(new.reply_id, old.reply_id);
  v_delta  int := coalesce(new.value, 0) - coalesce(old.value, 0);
  v_up     int := (case when new.value = 1 then 1 else 0 end) - (case when old.value = 1 then 1 else 0 end);
  v_down   int := (case when new.value = -1 then 1 else 0 end) - (case when old.value = -1 then 1 else 0 end);
  v_author uuid;
begin
  update feed_replies set score = score + v_delta, upvotes = upvotes + v_up, downvotes = downvotes + v_down
    where id = v_reply returning author_id into v_author;
  if v_author is not null then
    update profiles set comment_karma = comment_karma + v_delta where id = v_author;
  end if;
  return null;
end $$;
drop trigger if exists trg_reply_vote on reply_votes;
create trigger trg_reply_vote after insert or update or delete on reply_votes
  for each row execute function public.casa_apply_reply_vote();

-- replies → feed_posts.reply_count (excludes soft-deleted)
create or replace function public.casa_apply_reply_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_post bigint := coalesce(new.post_id, old.post_id);
begin
  update feed_posts set reply_count = (
    select count(*) from feed_replies where post_id = v_post and deleted_at is null
  ) where id = v_post;
  return null;
end $$;
drop trigger if exists trg_reply_count on feed_replies;
create trigger trg_reply_count after insert or update or delete on feed_replies
  for each row execute function public.casa_apply_reply_count();

-- membership → communities.member_count
create or replace function public.casa_apply_member_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then update communities set member_count = member_count + 1 where id = new.community_id;
  elsif tg_op = 'DELETE' then update communities set member_count = greatest(0, member_count - 1) where id = old.community_id;
  end if;
  return null;
end $$;
drop trigger if exists trg_member_count on community_members;
create trigger trg_member_count after insert or delete on community_members
  for each row execute function public.casa_apply_member_count();

-- posts → communities.post_count (handles community moves)
create or replace function public.casa_apply_post_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.community_id is not null then
    update communities set post_count = post_count + 1 where id = new.community_id;
  elsif tg_op = 'DELETE' and old.community_id is not null then
    update communities set post_count = greatest(0, post_count - 1) where id = old.community_id;
  elsif tg_op = 'UPDATE' and new.community_id is distinct from old.community_id then
    if old.community_id is not null then update communities set post_count = greatest(0, post_count - 1) where id = old.community_id; end if;
    if new.community_id is not null then update communities set post_count = post_count + 1 where id = new.community_id; end if;
  end if;
  return null;
end $$;
drop trigger if exists trg_post_count on feed_posts;
create trigger trg_post_count after insert or update or delete on feed_posts
  for each row execute function public.casa_apply_post_count();

-- reposts / saves → feed_posts counters
create or replace function public.casa_apply_repost_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_post bigint := coalesce(new.post_id, old.post_id);
begin
  update feed_posts set repost_count = (select count(*) from post_reposts where post_id = v_post) where id = v_post;
  return null;
end $$;
drop trigger if exists trg_repost_count on post_reposts;
create trigger trg_repost_count after insert or delete on post_reposts
  for each row execute function public.casa_apply_repost_count();

create or replace function public.casa_apply_save_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_post bigint := coalesce(new.post_id, old.post_id);
begin
  update feed_posts set save_count = (select count(*) from post_saves where post_id = v_post) where id = v_post;
  return null;
end $$;
drop trigger if exists trg_save_count on post_saves;
create trigger trg_save_count after insert or delete on post_saves
  for each row execute function public.casa_apply_save_count();

-- poll votes → poll_options.vote_count
create or replace function public.casa_apply_poll_vote()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_opt bigint := coalesce(new.option_id, old.option_id);
begin
  update poll_options set vote_count = (select count(*) from poll_votes where option_id = v_opt) where id = v_opt;
  return null;
end $$;
drop trigger if exists trg_poll_vote on poll_votes;
create trigger trg_poll_vote after insert or delete on poll_votes
  for each row execute function public.casa_apply_poll_vote();

-- event attendance → community_events.attendee_count
create or replace function public.casa_apply_event_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_event bigint := coalesce(new.event_id, old.event_id);
begin
  update community_events set attendee_count = (
    select count(*) from event_attendees where event_id = v_event and status = 'going'
  ) where id = v_event;
  return null;
end $$;
drop trigger if exists trg_event_count on event_attendees;
create trigger trg_event_count after insert or update or delete on event_attendees
  for each row execute function public.casa_apply_event_count();

-- post_hashtags → hashtags.post_count
create or replace function public.casa_apply_hashtag_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_tag bigint := coalesce(new.hashtag_id, old.hashtag_id);
begin
  update hashtags set post_count = (select count(*) from post_hashtags where hashtag_id = v_tag) where id = v_tag;
  return null;
end $$;
drop trigger if exists trg_hashtag_count on post_hashtags;
create trigger trg_hashtag_count after insert or delete on post_hashtags
  for each row execute function public.casa_apply_hashtag_count();

-- ═══════════════════════════════════════════════════════════════
-- Ranking helpers (views run as the querying user — RLS still applies)
-- ═══════════════════════════════════════════════════════════════

-- Reddit-style "hot": log-weighted score decaying with age. Higher = hotter.
create or replace view feed_posts_ranked with (security_invoker = true) as
select fp.*,
  ( sign(fp.score::numeric) * log(greatest(abs(fp.score), 1)::numeric)
    + (extract(epoch from fp.created_at) - 1704067200) / 45000.0 ) as hot_rank
from feed_posts fp
where fp.deleted_at is null;

-- Trending tags over the last 7 days.
create or replace view trending_hashtags with (security_invoker = true) as
select h.tag, count(*)::int as recent_count
from post_hashtags ph
join hashtags h on h.id = ph.hashtag_id
join feed_posts fp on fp.id = ph.post_id
where fp.created_at > now() - interval '7 days' and fp.deleted_at is null
group by h.tag
order by recent_count desc;

-- ═══════════════════════════════════════════════════════════════
-- Indexes for the read paths (feed sort/filter, threads, profiles)
-- ═══════════════════════════════════════════════════════════════
create index if not exists idx_feed_posts_community    on feed_posts (community_id, created_at desc);
create index if not exists idx_feed_posts_score        on feed_posts (score desc);
create index if not exists idx_feed_posts_created       on feed_posts (created_at desc);
create index if not exists idx_feed_posts_author        on feed_posts (author_id);
create index if not exists idx_feed_replies_post_parent on feed_replies (post_id, parent_id);
create index if not exists idx_post_votes_user          on post_votes (user_id);
create index if not exists idx_reply_votes_user         on reply_votes (user_id);
create index if not exists idx_post_saves_user          on post_saves (user_id);
create index if not exists idx_community_members_user   on community_members (user_id);
create index if not exists idx_communities_kind         on communities (kind);

-- ═══════════════════════════════════════════════════════════════
-- Row-Level Security
-- ═══════════════════════════════════════════════════════════════
alter table communities        enable row level security;
alter table community_members  enable row level security;
alter table community_bans     enable row level security;
alter table post_votes         enable row level security;
alter table reply_votes        enable row level security;
alter table post_saves         enable row level security;
alter table post_reposts       enable row level security;
alter table post_awards        enable row level security;
alter table hashtags           enable row level security;
alter table post_hashtags      enable row level security;
alter table post_media         enable row level security;
alter table post_polls         enable row level security;
alter table poll_options       enable row level security;
alter table poll_votes         enable row level security;
alter table community_events   enable row level security;
alter table event_attendees    enable row level security;
alter table mod_actions        enable row level security;

-- helper: is the current user a moderator/admin of a community?
create or replace function public.casa_is_moderator(p_community bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from community_members
    where community_id = p_community and user_id = auth.uid() and role in ('moderator', 'admin')
  );
$$;

-- communities: public spaces are world-readable; anyone signed-in can create;
-- creator or a moderator can edit.
drop policy if exists "communities readable" on communities;
create policy "communities readable" on communities for select using (not is_private or casa_is_moderator(id) or exists (select 1 from community_members m where m.community_id = id and m.user_id = auth.uid()));
drop policy if exists "users create communities" on communities;
create policy "users create communities" on communities for insert with check (auth.uid() = created_by);
drop policy if exists "mods edit communities" on communities;
create policy "mods edit communities" on communities for update using (created_by = auth.uid() or casa_is_moderator(id));

-- community_members: public read (member counts / lists), self-manage own membership.
drop policy if exists "members readable" on community_members;
create policy "members readable" on community_members for select using (true);
drop policy if exists "users join/leave" on community_members;
create policy "users join/leave" on community_members for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- community_bans: only mods of that community.
drop policy if exists "mods manage bans" on community_bans;
create policy "mods manage bans" on community_bans for all using (casa_is_moderator(community_id));

-- votes: a user reads/writes only their own vote rows (public tallies live on the post).
drop policy if exists "own post votes" on post_votes;
create policy "own post votes" on post_votes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own reply votes" on reply_votes;
create policy "own reply votes" on reply_votes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- saves: strictly private.
drop policy if exists "own saves" on post_saves;
create policy "own saves" on post_saves for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reposts / awards: public read, self write.
drop policy if exists "reposts readable" on post_reposts;
create policy "reposts readable" on post_reposts for select using (true);
drop policy if exists "own reposts" on post_reposts;
create policy "own reposts" on post_reposts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "awards readable" on post_awards;
create policy "awards readable" on post_awards for select using (true);
drop policy if exists "users give awards" on post_awards;
create policy "users give awards" on post_awards for insert with check (giver_id = auth.uid());

-- hashtags: public read; any author can attach/create tags for their own post.
drop policy if exists "hashtags readable" on hashtags;
create policy "hashtags readable" on hashtags for select using (true);
drop policy if exists "users create hashtags" on hashtags;
create policy "users create hashtags" on hashtags for insert with check (auth.uid() is not null);
drop policy if exists "post_hashtags readable" on post_hashtags;
create policy "post_hashtags readable" on post_hashtags for select using (true);
drop policy if exists "authors tag own posts" on post_hashtags;
create policy "authors tag own posts" on post_hashtags for all using (
  exists (select 1 from feed_posts fp where fp.id = post_id and fp.author_id = auth.uid())
);

-- media / polls: public read (they belong to public posts); post author manages.
drop policy if exists "media readable" on post_media;
create policy "media readable" on post_media for select using (true);
drop policy if exists "authors manage own media" on post_media;
create policy "authors manage own media" on post_media for all using (
  exists (select 1 from feed_posts fp where fp.id = post_id and fp.author_id = auth.uid())
);
drop policy if exists "polls readable" on post_polls;
create policy "polls readable" on post_polls for select using (true);
drop policy if exists "authors manage own polls" on post_polls;
create policy "authors manage own polls" on post_polls for all using (
  exists (select 1 from feed_posts fp where fp.id = post_id and fp.author_id = auth.uid())
);
drop policy if exists "poll options readable" on poll_options;
create policy "poll options readable" on poll_options for select using (true);
drop policy if exists "authors manage own poll options" on poll_options;
create policy "authors manage own poll options" on poll_options for all using (
  exists (select 1 from feed_posts fp where fp.id = post_id and fp.author_id = auth.uid())
);
drop policy if exists "poll votes readable" on poll_votes;
create policy "poll votes readable" on poll_votes for select using (true);
drop policy if exists "own poll votes" on poll_votes;
create policy "own poll votes" on poll_votes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- events / attendance: public read, host manages event, self-manage attendance.
drop policy if exists "events readable" on community_events;
create policy "events readable" on community_events for select using (true);
drop policy if exists "hosts manage own events" on community_events;
create policy "hosts manage own events" on community_events for all using (host_id = auth.uid()) with check (host_id = auth.uid());
drop policy if exists "attendees readable" on event_attendees;
create policy "attendees readable" on event_attendees for select using (true);
drop policy if exists "own attendance" on event_attendees;
create policy "own attendance" on event_attendees for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- mod_actions: mods of the community only.
drop policy if exists "mods read mod actions" on mod_actions;
create policy "mods read mod actions" on mod_actions for select using (casa_is_moderator(community_id));
drop policy if exists "mods write mod actions" on mod_actions;
create policy "mods write mod actions" on mod_actions for insert with check (casa_is_moderator(community_id) and moderator_id = auth.uid());

-- Realtime for live feed interactions (guarded so re-runs don't error on
-- "table is already a member of the publication").
do $$
declare t text;
begin
  foreach t in array array['feed_posts', 'feed_replies', 'post_votes'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════
-- Seed — official Casa communities (structural, not fabricated content).
-- Region spaces mirror the 10 catalogue regions; topic spaces cover the
-- interests a UK property/holiday community actually revolves around.
-- ═══════════════════════════════════════════════════════════════
insert into communities (slug, name, kind, region, icon, color, is_official, description) values
  ('lake-district',  'Lake District',   'region', 'lake-district',  'mountain', '#4D5C40', true, 'Fells, tarns and slate cottages across Cumbria.'),
  ('cornwall',       'Cornwall',        'region', 'cornwall',       'wave',     '#3E6B7A', true, 'Cove beaches, coast paths and Cornish stays.'),
  ('highlands',      'Scottish Highlands','region','highlands',     'mountain', '#5B6E52', true, 'Glens, lochs and bothies across the Highlands.'),
  ('skye',           'Isle of Skye',    'region', 'skye',           'mountain', '#4F6472', true, 'The Cuillin, the Quiraing, and island stays.'),
  ('norfolk',        'Norfolk',         'region', 'norfolk',        'wave',     '#7A6B3E', true, 'Broads, big skies and the north Norfolk coast.'),
  ('yorkshire',      'Yorkshire',       'region', 'yorkshire',      'mountain', '#5C5140', true, 'Dales, moors and stone-built Yorkshire boltholes.'),
  ('cotswolds',      'The Cotswolds',   'region', 'cotswolds',      'leaf',     '#6B6033', true, 'Honey-stone villages and rolling wolds.'),
  ('pembrokeshire',  'Pembrokeshire',   'region', 'pembrokeshire',  'wave',     '#3E6B7A', true, 'Wales'' wild coast path and cliffside stays.'),
  ('snowdonia',      'Eryri / Snowdonia','region','snowdonia',      'mountain', '#4D5C40', true, 'Peaks, lakes and slate country in north Wales.'),
  ('causeway',       'Causeway Coast',  'region', 'causeway',       'wave',     '#3E6B7A', true, 'Antrim''s basalt coast and glens.'),
  ('wild-swimming',  'Wild Swimming',   'topic',  null,             'wave',     '#3E6B7A', true, 'Rivers, tarns and tidal pools worth the plunge.'),
  ('dog-friendly',   'Dog-Friendly Travel','topic',null,            'paw',      '#B05533', true, 'Stays, pubs and walks that welcome the dog.'),
  ('first-time-hosts','First-Time Hosts','topic', null,             'home',     '#8E4326', true, 'Getting your first listing right — advice from hosts.'),
  ('walking-hiking', 'Walking & Hiking','topic',  null,             'boot',     '#5B6E52', true, 'Routes, gear and trailheads across the UK.'),
  ('foodie-trails',  'Foodie Trails',   'topic',  null,             'fork',     '#B05533', true, 'Farm shops, pub lunches and local produce.'),
  ('off-grid',       'Off-Grid & Slow', 'topic',  null,             'bolt',     '#4D5C40', true, 'Cabins, solar, wood-burners and switching off.'),
  ('accessible',     'Accessible Travel','topic', null,             'access',   '#3E6B7A', true, 'Step-free stays and barrier-free days out.'),
  ('budget-breaks',  'Budget Breaks',   'topic',  null,             'tag',      '#6B6033', true, 'Great UK stays that don''t cost the earth.')
on conflict (slug) do nothing;
