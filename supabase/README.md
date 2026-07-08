# Casa — Supabase setup (Phase 06)

## Status: live

Project is live at `https://ktxhkoxjrgkjxrszmbii.supabase.co` (org "Casa
Rentals", free tier). Schema, RLS policies, and seed data are applied;
the frontend is wired against it for the features listed below.

`casa-supabase.js` holds the client init (project URL + publishable key —
safe for frontend code, the modern equivalent of the old anon key). It's
loaded before `casa.js` on every page. The `service_role` key has never
been placed in any file, commit, or chat message, per the standing rule.

## What's wired to real Supabase calls

- **Auth** (`signup.html`) — real `signUp`/`signInWithPassword`. Session
  state syncs into the existing `casa:user` localStorage cache
  (`casaSyncUserFromSession` in `casa.js`), so every pre-existing
  `casaGetUser()` call site across the site keeps working unchanged —
  it's a read-through cache now, not the source of truth. Sign-out
  (`casaSignOut`) is wired on `profile.html`.
- **Listings** (`list.html`) — publishing a listing inserts into
  `properties` for real.
- **Enquiries** (`booking.html`) — sending an enquiry inserts into
  `enquiries` for real, with the host resolved from the property's real
  `host_id` (this also fixed a bug: the host name shown on the page was
  previously hardcoded to "Sarah" regardless of which property was being
  booked).
- **Saved properties & follows** (`casa.js`, `saved.html`) — `casaToggleSaved`/
  `casaToggleFollow` write through to `saved_properties`/`follows` when
  signed in, and sync down from Supabase on sign-in. Follows are resolved
  via a `supabaseId` field added to each `CASA_HOSTS` entry, matched to
  the demo host auth accounts. `saved.html` itself used to be 100% static
  HTML — 7 hardcoded demo cards shown to every visitor regardless of what
  they'd actually saved — now it renders the signed-in guest's real
  saved list.
- **Reviews** (`profile.html`) — posting a review to "the property page"
  also inserts into `reviews` for real.
- **Reports** (`casa.js`) — `casaReportContent` writes through to
  `reports` (target_id has no FK constraint, so this works regardless of
  whether the reported content itself is migrated).
- **Messaging** (`booking.html`, `messages.html`, `host.html`) — fully
  live, not just wired. Every enquiry creates a real conversation via the
  `create_conversation_for_enquiry` Postgres function (a guest can't
  insert the host's `conversation_participants` row directly under RLS,
  so this runs as security definer). `messages.html` is a real inbox now
  — it loads the signed-in user's actual conversations, sends/receives
  real messages, and subscribes to Supabase Realtime for live delivery.
  Report and block are both real writes.
- **Real listing photos** (`list.html`) — the photo step used to be
  fully decorative (clicking it just showed "Photo upload available
  once connected to backend," and every property image site-wide was a
  solid-colour placeholder div). Hosts can now actually pick/drag real
  image files; they upload to the `property-photos` Storage bucket on
  publish and link into the `property_photos` table (already in
  `schema.sql`, just never wired up). Every page that shows a property
  image (`browse.html`, `saved.html`, `host-profile.html`,
  `property.html`'s gallery, map pin popups) now renders the real photo
  when one exists, falling back to the existing colour-placeholder /
  stock-photo system otherwise — nothing regresses for the 36 seed
  properties, which have no real photos and never will.
  **Requires a one-time manual step**: run `supabase/storage.sql` in
  the Supabase SQL editor to create the bucket and its policies — the
  frontend's publishable key can't create a bucket itself (403), by
  design. Until that's run, publishing still works, it just silently
  skips the photo upload (toasts a per-file error, no orphaned data).
- **Guest-facing discovery** (`browse.html`, `map.html`, `property.html`,
  `host-profile.html`) — a real host's published listing now actually
  shows up. Previously these pages only ever read the 36 hardcoded seed
  properties in `casa-properties.js`, so a newly published listing was
  both undiscoverable in search/map and, if linked to directly,
  `property.html` would silently render the wrong property (it always
  fell back to the first seed listing for any unrecognised id — a
  genuinely bad bug, not just a missing feature). `casaRefreshProperties()`
  (in `casa-properties.js`) now fetches real rows from `properties` +
  `reviews` + host verification fields and reconciles them into the same
  shared `CASA_PROPERTIES` array the rest of the site already reads, so
  every page renders instantly from local seed data first and corrects
  itself in place once the real data lands — no page needed its core
  rendering logic rewritten. `casaResolveHostProfile()` (in
  `casa-hosts.js`) does the same for a real host's profile page.

All of the above keep their original localStorage behaviour too (as a
cache / for pages not yet reading from Supabase directly), so nothing
regresses if `window.casaSupabase` is ever unavailable.

- **Community feed** (`feed.html`, `attractions.html`, `property.html`,
  `host.html`, `profile.html`) — the 21 seed posts in `casa-feed-posts.js`
  were fabricated content (invented authors like "Marcus J."/"Laura P."
  with no real account, plus made-up likes/reply counts) and had never
  been migrated into `feed_posts`. Rather than migrate fake people into
  the real database, they were deleted outright — the community feed now
  starts genuinely empty and grows from real posts only. `feed.html`'s
  composer (`submitPost`), reply box (`sendReply`), and mute action
  (`muteUser`) all write through to `feed_posts`/`feed_replies`/
  `muted_users` for real now, keyed by the real signed-in user's id (mute
  used to key on a display-name string, which only worked for fabricated
  seed "people" — real posts need a real id to attach a mute to).
  `attractions.html`'s tip composer and `property.html`'s "community
  mentions" section both read/write the same real `feed_posts` rows
  (filtered by `type='tip'` and `property_id` respectively) instead of
  their own separate localStorage copies. `profile.html`'s "cross-post a
  review to the feed" checkbox does the same. `host.html`'s "guest
  questions on your posts" widget was hardcoded to a fake host name
  ("Sarah R.") regardless of who was actually signed in — it now reads
  the real signed-in host's own posts and replies.
  **Note**: `feed_posts.body`/`feed_replies.body` are real free-text user
  input now, not developer-authored seed HTML — anywhere they're
  rendered uses `casaEscapeHtml`/`casaFormatFeedBody` (in
  `casa-feed-posts.js`) before going into `innerHTML`, to avoid an XSS
  hole that didn't exist when this content was hardcoded.
- **Notifications** — now real, see Phase 08 below.

## Phase 07 — Community platform (`community.sql`)

Expands the Phase-06 feed into a full property + holidaying community,
so the backend is ready to host real communities at scale. **Additive
and idempotent** — layers on top of `schema.sql` and is safe to re-run.

**Apply once, manually**, in the Supabase SQL editor (same as
`storage.sql`): run `supabase/schema.sql` first if not already applied,
then `supabase/community.sql`. The frontend's publishable key can't run
DDL, by design — nothing here is applied automatically, and the live
site is unaffected until it's run (the Phase-06 feed keeps working).

What it adds:

- **Communities / "spaces"** (`communities`, `community_members`,
  `community_bans`) — Reddit-style spaces with membership + per-space
  moderator/admin roles. Seeded with **18 official Casa spaces**: the
  10 catalogue regions (Lake District, Cornwall, Highlands…) plus topic
  spaces (Wild Swimming, Dog-Friendly Travel, First-Time Hosts, Walking
  & Hiking, Foodie Trails, Off-Grid & Slow, Accessible Travel, Budget
  Breaks). Seeding *structural* official spaces is legitimate — it's not
  fabricated user content like the old fake posts.
- **Voting + ranking** (`post_votes`, `reply_votes`) — up/down votes with
  incremental trigger-maintained `score`/`upvotes`/`downvotes` on posts &
  replies, plus author `post_karma`/`comment_karma`. A `feed_posts_ranked`
  view exposes a Reddit-style **hot** rank (log-weighted score decaying
  with age) so hot/top/new are all one indexed read.
- **Threaded comments** — `feed_replies.parent_id` (self-referencing) for
  nested threads; `reply_count` kept live on the post.
- **Saves, reposts, awards** (`post_saves`, `post_reposts`, `post_awards`).
- **Hashtags** (`hashtags`, `post_hashtags`) + a `trending_hashtags` view
  (last 7 days) for discovery.
- **Rich media & polls** (`post_media`, `post_polls`, `poll_options`,
  `poll_votes`) — multi-image/video posts and X-style polls.
- **Local events / meetups** (`community_events`, `event_attendees`).
- **Richer notifications** (`actor_id` + `entity_type`/`entity_id`) and
  **moderation** (`mod_actions`, community-scoped report resolution,
  a `casa_is_moderator()` helper backing the mod RLS policies).
- **RLS on every new table** (31 policies): public spaces/feed are
  world-readable; votes/saves are private to the user; mod actions and
  bans are gated to a space's moderators; post media/polls/tags are
  writable only by the post's author.

`feed_posts.type` (avail/looking/review/tip/photo) is unchanged — it's
the Casa post *flavour*; `community_id` is the new *space* it lives in.

Frontend for this (community browse, voting UI, threaded comments,
composer with space/poll/media, hot/top/new toggle) is the next build —
the existing `casa-feed-posts.js` data layer will be extended with
`casa-community.js` helpers (vote/save/repost/join/fetch-ranked).

## Phase 08 — Real cross-user notifications (`notifications.sql`)

The `notifications` table's own RLS (`user_id = auth.uid()`) only lets a
client write its own row, so a sender can't directly insert a notification
for whoever they just replied to/messaged/enquired with — the exact same
problem `create_conversation_for_enquiry` already solved for
`conversation_participants`. `notifications.sql` uses the same fix:
`SECURITY DEFINER` triggers that fire on the real underlying event
(new `feed_replies` row, new `enquiries` row, `enquiries.status` change,
new `messages` row, new `follows` row, new `reviews` row) and insert the
right recipient's notification row directly — this can't be silently
skipped by an incomplete client wiring, since it fires regardless of
which page/code path created the underlying row.

**Apply once, manually** in the SQL editor, after `schema.sql` (order vs.
`community.sql`/`storage.sql` doesn't matter — additive and idempotent,
safe to re-run).

Client side (`casa.js`): `casaAddNotification()` is now for **self**-
notifications only (e.g. "your enquiry was sent") and write-throughs to
the real table; `casaSyncNotificationsFromSupabase()` is the real read
path (replaces the local cache, mirrors `casaSyncMutedFromSupabase`);
`casaMarkNotifRead`/`casaMarkAllNotifsRead` write real `UPDATE`s.
`messages.html`'s realtime handler no longer also adds a local
notification on incoming messages — the trigger covers that persistently
now (previously it only fired while the recipient happened to be on that
page).

## Phase 09 — Real availability blocking (`availability.sql`)

Booking.html had zero conflict checking of any kind (not even against
the old local-only `casa-availability.js` demo calendar, which nothing
guest-facing ever actually called) — two different guests could get a
"confirmed" booking for the same week and nothing would notice. Guests
can't read other guests' `enquiries` rows under RLS at all (correctly,
for privacy), so there was no way for a browser about to submit a new
enquiry to know a property was already booked. Same shape of problem as
`create_conversation_for_enquiry` — solved the same way: two narrow
`SECURITY DEFINER` functions that reveal only the minimum needed, never
guest identity or any other enquiry detail:

- `casa_check_date_conflict(property_id, check_in, check_out)` → boolean.
  Only a **confirmed** enquiry blocks; pending/replied isn't a real
  commitment yet. `booking.html` calls this right before inserting a new
  enquiry and blocks submission with a clear message on a real conflict.
  Fails open (logs and proceeds) if the RPC isn't reachable, so this
  doesn't break booking before the migration below is applied.
- `casa_get_confirmed_ranges(property_id)` → the confirmed date ranges
  only (no guest/price/message) — available for a future calendar UI
  that greys out unavailable dates up front rather than only failing at
  submit time; not wired into any page yet.

**Apply once, manually** in the SQL editor, after `schema.sql`.

**host.html** now has real Confirm/Decline buttons on each enquiry,
writing a real `enquiries.status` update (`confirmed`/`declined`) — this
is also what makes Phase 08's `casa_notify_on_enquiry_status` trigger
fire for real, so declining/confirming actually notifies the guest.
Before this, `status` only ever moved from `pending` to `replied`
(messages.html, on a host's first reply) — nothing ever set `confirmed`
or `declined`, so the host dashboard's own "confirmed bookings" calendar
strip was always empty in practice.

## Phase 10 — Cancellation policy & pilot payments (`cancellation-policy.sql`)

Two linked pilot decisions, made together since they both come down to
"Casa doesn't touch the money":

- **Payments**: bank transfer, direct between guest and host, off-platform
  — not permanent, Stripe Connect is the planned graduation path once real
  volume justifies the integration effort. Casa never stores or sees a
  bank account number; no schema change needed for this part; see
  `CASA_PROJECT_BRIEF.md`. `host.html`'s `updateEnquiryStatus()` now posts
  a real message into the enquiry's conversation the moment a host
  confirms, and `messages.html`'s thread-status banner now has a real
  `confirmed` state (the CSS already existed — `else { st.style.display =
  'none' }` was silently swallowing it for every non-pending status).
- **Cancellation policy**: since Casa can't hold funds, it can't enforce a
  refund — `properties.cancellation_policy` (added by
  `cancellation-policy.sql`) exists purely so whatever the host has agreed
  is visible to a guest before they enquire, same spirit as `min_stay`.
  Host-set in `list.html` (sensible pre-filled default, editable),
  displayed on `property.html` and `booking.html`.

**Apply once, manually** in the SQL editor, after `schema.sql`.

## Recommended next phase (deferred, not urgent)

Real image upload for feed posts (the "Photo" post type has no working
upload path yet — a post can be that type, it just won't have any
images), and a real calendar UI (using `casa_get_confirmed_ranges`) so
unavailable dates are greyed out in the booking form itself.
