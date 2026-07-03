-- ═══════════════════════════════════════════════════════════════
-- Casa — Supabase schema (Phase 06)
--
-- Field names are deliberately matched to the Supabase calls already
-- sketched (commented out) in the frontend, so wiring is mechanical:
--   - booking.html  -> enquiries insert (property_id, guest_id, check_in,
--                      check_out, guests, pets, message, special_requests, status)
--   - list.html     -> properties insert (host_id, title, region, type, town,
--                      description, house_rules, sleeps, bedrooms, bathrooms,
--                      max_guests, price_per_night, cleaning_fee, min_stay,
--                      amenities, published)
--   - signup.html   -> supabase.auth.signUp / signInWithPassword,
--                      full_name + role passed as auth metadata
--
-- Every other table here is new: it exists to replace a localStorage key
-- that a real feature this session was built against. Each table's
-- comment names the exact key/file it replaces, so nothing here is
-- speculative -- it's the existing seed-data shape, normalised.
-- ═══════════════════════════════════════════════════════════════

-- ─── profiles ───
-- One row per auth.users row. Replaces casa:user (casaGetUser/casaSetUser
-- in casa.js) and the CASA_HOSTS registry in casa-hosts.js.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('guest', 'host')) default 'guest',
  avatar_url text,
  bio text,
  location text,
  languages text[] default '{}',
  response_rate int,               -- % of enquiries replied to (host only)
  response_time text,              -- e.g. 'within an hour' (host only, display string)
  joined_at timestamptz not null default now(),

  -- "Verified Host" criteria — see VERIFICATION-POLICY.md.
  -- casaHostVerifiedTier() in casa-hosts.js computes the badge from these.
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  gov_id_verified boolean not null default false,
  background_check boolean not null default false,

  created_at timestamptz not null default now()
);

-- ─── properties ───
-- Replaces the CASA_PROPERTIES array in casa-properties.js.
create table properties (
  id bigint generated always as identity primary key,
  host_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  town text not null,              -- casa-properties.js: `loc`
  region text not null,            -- casa-properties.js: `region` (e.g. 'lake-district')
  region_label text not null,      -- casa-properties.js: `rLabel` (e.g. 'Lake District')
  type text not null,              -- cottage | barn | cabin | farmhouse | glamping | houseboat | manor
  description text,
  house_rules text,
  price_per_night int not null,
  cleaning_fee int not null default 0,
  min_stay int not null default 1, -- casa-properties.js: computed as `minNights`
  sleeps int not null,
  bedrooms int not null,
  bathrooms int not null default 1,
  max_guests int not null,
  amenities text[] default '{}',   -- casa-properties.js: `tags`
  published boolean not null default false,
  instant_book boolean not null default false,
  created_at timestamptz not null default now()
);

create table property_photos (
  id bigint generated always as identity primary key,
  property_id bigint not null references properties(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false
);

create table saved_properties (
  -- Replaces casa:saved (casaGetSavedIds/casaToggleSaved in casa.js).
  user_id uuid not null references profiles(id) on delete cascade,
  property_id bigint not null references properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- ─── conversations & messages ───
-- Replaces the CONVOS array (messages.html) and casa:local-convos
-- (the enquiry -> conversation link added when linking bookings to threads).
create table conversations (
  id bigint generated always as identity primary key,
  property_id bigint references properties(id) on delete set null,
  created_at timestamptz not null default now()
);

create table conversation_participants (
  conversation_id bigint not null references conversations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  archived boolean not null default false,
  blocked boolean not null default false,  -- casa:blocked-convos, per-participant not global
  primary key (conversation_id, user_id)
);

create table messages (
  id bigint generated always as identity primary key,
  conversation_id bigint not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── enquiries (bookings) ───
-- Replaces casa:enquiries (casaSaveEnquiry/casaGetEnquiries/
-- casaMarkEnquiryReplied in casa.js). conversation_id is what let a host's
-- reply in messages.html automatically flip the dashboard status.
create table enquiries (
  id bigint generated always as identity primary key,
  property_id bigint not null references properties(id) on delete cascade,
  guest_id uuid not null references profiles(id) on delete cascade,
  host_id uuid not null references profiles(id) on delete cascade,
  conversation_id bigint references conversations(id) on delete set null,
  check_in date not null,
  check_out date not null,
  guests int not null default 1,
  pets boolean not null default false,
  message text,
  special_requests text,
  total_price int,
  status text not null check (status in ('pending', 'replied', 'confirmed', 'declined')) default 'pending',
  created_at timestamptz not null default now()
);

-- ─── community feed ───
-- Replaces POSTS/REPLIES in casa-feed-posts.js and their casa:local-*
-- localStorage overlays (casaAddLocalReply, submitReview's feed cross-post,
-- attractions.html's tip submission).
create table feed_posts (
  id bigint generated always as identity primary key,
  author_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('avail', 'looking', 'review', 'tip', 'photo')),
  region text not null default 'all',  -- casa-feed-posts.js: `county`
  property_id bigint references properties(id) on delete set null,
  body text,
  image_urls text[] default '{}',
  review_stars int check (review_stars between 1 and 5),
  created_at timestamptz not null default now()
);

create table feed_replies (
  -- Replaces REPLIES / casa:local-replies (casaGetRepliesForPost/casaAddLocalReply).
  id bigint generated always as identity primary key,
  post_id bigint not null references feed_posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ─── reviews ───
-- Replaces casa:reviews (profile.html's review modal, read by property.html).
create table reviews (
  id bigint generated always as identity primary key,
  property_id bigint not null references properties(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  enquiry_id bigint references enquiries(id) on delete set null,  -- proves a real stay
  stars int not null check (stars between 1 and 5),
  body text not null,
  created_at timestamptz not null default now()
);

-- ─── follows ───
-- Replaces casa:follows (casaGetFollowedHosts/casaIsFollowing/casaToggleFollow).
create table follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  followed_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id != followed_id)
);

-- ─── moderation ───
-- Replaces casa:reports / casa:muted-users (casaReportContent/casaMuteUser
-- in casa.js — the feed.html and messages.html Report/Mute/Block actions).
create table reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'conversation', 'user')),
  target_id text not null,  -- text, not fk: target table varies by target_type
  reason text,
  status text not null check (status in ('open', 'reviewed', 'dismissed')) default 'open',
  created_at timestamptz not null default now()
);

create table muted_users (
  user_id uuid not null references profiles(id) on delete cascade,
  muted_user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, muted_user_id)
);

-- ─── notifications ───
-- Replaces casa:notifications (casaGetNotifications/casaAddNotification/
-- casaMarkNotifRead in casa.js).
create table notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,  -- 'enquiry' | 'reply' | 'review' | 'welcome' | 'tip' | 'community'
  title text not null,
  body text,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- Row-Level Security
--
-- Starter policies matching the tracker's stated principle: "hosts edit
-- only their own listings, guests see only their own bookings/messages."
-- Treat these as a first pass, not final — property visibility in
-- particular (published vs. draft) will need product input once the
-- listing wizard's publish flow is wired up.
-- ═══════════════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table properties enable row level security;
alter table property_photos enable row level security;
alter table saved_properties enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table enquiries enable row level security;
alter table feed_posts enable row level security;
alter table feed_replies enable row level security;
alter table reviews enable row level security;
alter table follows enable row level security;
alter table reports enable row level security;
alter table muted_users enable row level security;
alter table notifications enable row level security;

-- profiles: public read (host/guest profiles are shown to strangers),
-- self-only write.
create policy "profiles are publicly readable" on profiles for select using (true);
create policy "users create their own profile" on profiles for insert with check (auth.uid() = id);
create policy "users update their own profile" on profiles for update using (auth.uid() = id);

-- Auto-create a profiles row whenever a new auth.users row is created, using
-- the full_name/role passed as signUp() metadata (see signup.html). Runs as
-- security definer so it works even before email confirmation (no session
-- yet, so a client-side insert would fail RLS at that point).
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
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- properties: published listings are public; hosts see and manage their
-- own regardless of publish state.
create policy "published properties are publicly readable" on properties
  for select using (published = true or host_id = auth.uid());
create policy "hosts manage their own properties" on properties
  for all using (host_id = auth.uid());

create policy "photos follow their property's visibility" on property_photos
  for select using (
    exists (select 1 from properties p where p.id = property_id and (p.published or p.host_id = auth.uid()))
  );
create policy "hosts manage their own property photos" on property_photos
  for all using (
    exists (select 1 from properties p where p.id = property_id and p.host_id = auth.uid())
  );

-- saved_properties: strictly private to the saving user.
create policy "users manage their own saved properties" on saved_properties
  for all using (user_id = auth.uid());

-- conversations & messages: only participants can read or write.
create policy "participants read their conversations" on conversations
  for select using (
    exists (select 1 from conversation_participants cp where cp.conversation_id = id and cp.user_id = auth.uid())
  );
create policy "participants manage their own participant row" on conversation_participants
  for all using (user_id = auth.uid());
create policy "participants read messages in their conversations" on messages
  for select using (
    exists (select 1 from conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid())
  );
create policy "participants send messages in their conversations" on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid())
  );
create policy "participants mark messages read" on messages
  for update using (
    exists (select 1 from conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid())
  );

-- enquiries: guest who sent it or host who received it, only.
create policy "guest or host read their enquiries" on enquiries
  for select using (guest_id = auth.uid() or host_id = auth.uid());
create policy "guests create enquiries" on enquiries
  for insert with check (guest_id = auth.uid());
create policy "guest or host update their enquiries" on enquiries
  for update using (guest_id = auth.uid() or host_id = auth.uid());

-- feed_posts / feed_replies: public read (it's a public community feed),
-- self-only write.
create policy "feed posts are publicly readable" on feed_posts for select using (true);
create policy "authors manage their own posts" on feed_posts for all using (author_id = auth.uid());
create policy "feed replies are publicly readable" on feed_replies for select using (true);
create policy "authors manage their own replies" on feed_replies for all using (author_id = auth.uid());

-- reviews: public read, but only insertable by the guest tied to a real
-- enquiry for that property (prevents fabricated reviews).
create policy "reviews are publicly readable" on reviews for select using (true);
create policy "guests review properties they actually booked" on reviews
  for insert with check (
    author_id = auth.uid()
    and (enquiry_id is null or exists (
      select 1 from enquiries e where e.id = enquiry_id and e.guest_id = auth.uid() and e.property_id = reviews.property_id
    ))
  );

-- follows: public read (following is a public signal), self-only write.
create policy "follows are publicly readable" on follows for select using (true);
create policy "users manage their own follows" on follows for all using (follower_id = auth.uid());

-- reports / muted_users: strictly private to the reporting/muting user.
-- (A real moderation team role would need a separate admin policy, added
-- once that role exists.)
create policy "users manage their own reports" on reports for all using (reporter_id = auth.uid());
create policy "users manage their own mutes" on muted_users for all using (user_id = auth.uid());

-- notifications: strictly private to the recipient.
create policy "users manage their own notifications" on notifications for all using (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- Conversation creation (Phase 06b — live messaging)
--
-- A guest can't create the host's conversation_participants row
-- directly under RLS ("participants manage their own participant
-- row" only allows user_id = auth.uid()), and there's no insert
-- policy on conversations at all. This runs as security definer to
-- atomically create the conversation, both participant rows, and the
-- opening message from a real enquiry, then link it back. Ongoing
-- replies from either side use plain inserts into messages (both are
-- already legitimate participants by then).
-- ═══════════════════════════════════════════════════════════════
create or replace function public.create_conversation_for_enquiry(p_enquiry_id bigint)
returns bigint
language plpgsql
security definer set search_path = public
as $$
declare
  v_enquiry enquiries%rowtype;
  v_conversation_id bigint;
begin
  select * into v_enquiry from enquiries where id = p_enquiry_id;
  if v_enquiry.id is null then
    raise exception 'enquiry not found';
  end if;
  if v_enquiry.guest_id != auth.uid() then
    raise exception 'not authorized';
  end if;
  if v_enquiry.conversation_id is not null then
    return v_enquiry.conversation_id;
  end if;

  insert into conversations (property_id) values (v_enquiry.property_id) returning id into v_conversation_id;

  insert into conversation_participants (conversation_id, user_id)
  values (v_conversation_id, v_enquiry.guest_id), (v_conversation_id, v_enquiry.host_id);

  insert into messages (conversation_id, sender_id, body)
  values (v_conversation_id, v_enquiry.guest_id, coalesce(v_enquiry.message, 'Hi, is this available?'));

  update enquiries set conversation_id = v_conversation_id where id = p_enquiry_id;

  return v_conversation_id;
end;
$$;

grant execute on function public.create_conversation_for_enquiry(bigint) to authenticated;

-- Realtime delivery for messages.html's live inbox (new tables aren't in
-- the publication by default).
alter publication supabase_realtime add table messages;
