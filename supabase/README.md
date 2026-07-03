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

All of the above keep their original localStorage behaviour too (as a
cache / for pages not yet reading from Supabase directly), so nothing
regresses if `window.casaSupabase` is ever unavailable.

## What's intentionally still local-only, and why

- **`casaMuteUser`/`casaBlockConvo`** — these key on display-name strings
  and local conversation ids that don't correspond to real Supabase
  users or conversations (most demo "people" in the seed feed/message
  data — e.g. "Marcus J.", "Laura P." — have no real auth account at
  all). Migrating these cleanly needs the feed/messaging migration below
  to land first.
- **Feed replies** (`casaAddLocalReply`) — the 21 seed community posts in
  `casa-feed-posts.js` were never migrated into the `feed_posts` table
  (it exists in the schema but is empty). A reply can't get a real
  `post_id` foreign key until its parent post is a real row. Migrating
  the seed posts is a content-migration task in its own right (remap 21
  posts + decide how `property.html`'s "community mentions" and
  `attractions.html`'s tip feed re-source their data), not a quick wire.
- **Notifications** — low-value to migrate before the above; most calls
  are ephemeral in-session toasts today.
- **Messages real-time/polling** — blocked by the same gap: conversations
  and messages are still entirely local (`casa:local-convos`, created by
  `casaSaveEnquiry`). Real-time only means something once conversations
  are real rows Supabase can push changes for. This needs conversations
  to be created server-side (e.g. when an enquiry is inserted) before
  `messages.html` can be wired to Realtime or even simple polling.

## Recommended next phase

Migrate feed posts and conversations into real tables — that one piece
unblocks feed replies, blocked conversations, and messages real-time all
at once, rather than tackling them as three separate partial wires.
