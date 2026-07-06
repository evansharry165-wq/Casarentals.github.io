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
- **Notifications** — still local-only; low-value to migrate next, most
  calls are ephemeral in-session toasts today.

## Recommended next phase (deferred, not urgent)

Real image upload for feed posts (the "Photo" post type has no working
upload path yet — a post can be that type, it just won't have any
images), and notifications.
