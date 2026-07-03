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
- **Saved properties & follows** (`casa.js`) — `casaToggleSaved`/
  `casaToggleFollow` write through to `saved_properties`/`follows` when
  signed in, and sync down from Supabase on sign-in. Follows are resolved
  via a `supabaseId` field added to each `CASA_HOSTS` entry, matched to
  the demo host auth accounts.
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

All of the above keep their original localStorage behaviour too (as a
cache / for pages not yet reading from Supabase directly), so nothing
regresses if `window.casaSupabase` is ever unavailable.

## What's intentionally still local-only, and why

- **`casaMuteUser`** — keys on display-name strings, not real user ids
  (most demo "people" in the seed feed data — e.g. "Marcus J.", "Laura
  P." — have no real auth account at all). Migrating this cleanly needs
  the feed post migration below to land first, so there's a real user to
  attach a mute to.
- **Feed replies** (`casaAddLocalReply`) — the 21 seed community posts in
  `casa-feed-posts.js` were never migrated into the `feed_posts` table
  (it exists in the schema but is empty). A reply can't get a real
  `post_id` foreign key until its parent post is a real row. Migrating
  the seed posts is a content-migration task in its own right (remap 21
  posts + decide how `property.html`'s "community mentions" and
  `attractions.html`'s tip feed re-source their data), not a quick wire.
  **Deliberately deferred** — see "Recommended next phase" below.
- **`submitPost()` in feed.html** — the "new post" composer doesn't
  persist anywhere at all today, not even localStorage (`POSTS.unshift()`
  is an in-memory array mutation that's gone on refresh). This needs
  fixing as part of the feed migration, not before it — no point wiring
  persistence for content that's about to be restructured anyway.
- **Notifications** — low-value to migrate before the above; most calls
  are ephemeral in-session toasts today.

## Recommended next phase (deferred, not urgent)

Migrate the 21 seed feed posts into `feed_posts`, decide what happens to
them once real hosts are posting alongside them (permanent seed content,
retired once there's critical mass, or kept out of production entirely),
and wire `submitPost()`/`casaAddLocalReply()` to real inserts. That one
piece unblocks feed replies and muting at once.
