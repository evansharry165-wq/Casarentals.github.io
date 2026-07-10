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

## Phase 11 — Production readiness

Five items. Two (accessibility, real map tiles) are code-only and are
done. Three (email, error monitoring, analytics) need a real account +
credentials from Harry before they do anything — the code for all three
is real and deployed-ready, but **none of the three will actually send
an email, report an error, or record a pageview until that setup
happens.** Nothing was stubbed silently; each gap is called out below.

### 1. Email notifications — needs a Resend account + deployment

**Chose Resend over Postmark**: simpler API (one JSON POST, no XML), a
free tier (100/day, 3,000/month) that comfortably covers a 20–30-host
pilot, and it's the more common pairing with Supabase Edge Functions in
current docs/examples, so less friction if this needs revisiting later.

Reuses `notifications.sql`'s existing triggers rather than duplicating
their logic — those already fire on exactly the 3 requested events (new
enquiry -> host, confirmed/declined -> guest, new message -> recipient)
and write a row into `notifications`. `email-notifications.sql` adds one
more trigger on that same table: after insert, if the row's `type` is
`enquiry` or `reply`, call the `send-notification-email` Edge Function
(`supabase/functions/send-notification-email/index.ts`) via `pg_net`,
which looks up the recipient's real email (`auth.admin.getUserById`,
service-role only) and sends it through Resend.

**What Harry needs to do, in order:**
1. Create a Resend account at resend.com, verify a sending domain (or
   use their shared test domain while the pilot is small).
2. Copy the API key.
3. Install the Supabase CLI (`brew install supabase/tap/supabase` or see
   supabase.com/docs/guides/cli) and run `supabase login`, then
   `supabase link --project-ref <your-project-ref>` from this repo root.
4. `supabase functions deploy send-notification-email`
5. `supabase secrets set RESEND_API_KEY=re_xxx FROM_EMAIL="Casa <notifications@casa.co.uk>"`
   (the `FROM_EMAIL` address must be on the domain verified in step 1).
6. Open `supabase/email-notifications.sql`, replace `<YOUR-PROJECT-REF>`
   and `<YOUR-SERVICE-ROLE-KEY>` (Project Settings -> API) with the real
   values, and run it in the SQL editor **from a local copy — do not
   commit the filled-in version, the service role key must never reach
   this public repo.**

Until all six steps are done, the trigger will fire and the function
will run, but step 4 not being deployed means the `net.http_post` call
fails silently (pg_net logs the failure server-side; it doesn't block
the notification row itself), and step 2/5 missing means the function
returns a real, logged 500 rather than sending anything.

### 2. Error monitoring — needs a Sentry account

`casa-monitoring.js` (loaded on all 32 real pages, after the Sentry CDN
bundle) is genuinely wired up and was verified live: the SDK loads
(confirmed 200 on `browser.sentry-cdn.com`), and `casa-monitoring.js`
correctly detects that `CASA_SENTRY_DSN` is still the placeholder string
and skips `Sentry.init()` — logging one clear console line instead of
silently pretending to work. **What Harry needs to do:** create a free
Sentry account, create a JavaScript project, copy its DSN, and paste it
in as `CASA_SENTRY_DSN` at the top of `casa-monitoring.js`. That one-line
edit is the entire remaining step — no redeploy of anything else needed.

### 3. Accessibility pass — done, no external dependency

- **Alt text**: audited every static `<img>` and every JS template
  string across the site. `property.html`'s gallery and `browse.html`'s
  cards already had real, descriptive alt text
  (`"{title}, {loc}"`/`"{title}, {loc} — photo N"`) from earlier work —
  the one real gap found was `feed.html`'s post-attachment photos
  (`<img class="casa-photo-img" src="${u}" loading="lazy">`, no `alt` at
  all), now fixed to `"Photo N from {author}'s post"`.
- **Keyboard focus states**: added one global rule to `casa.css`
  (loaded on every page) — `a:focus-visible, button:focus-visible,
  input:focus-visible, select:focus-visible, textarea:focus-visible,
  summary:focus-visible, [tabindex]:focus-visible { outline: 2px solid
  var(--brick); outline-offset: 2px; border-radius: 4px; }`. Before this,
  only form inputs had any focus treatment at all (`.field input:focus`)
  — nav links, buttons, and every card type relied entirely on whatever
  the browser's unstyled default happened to be. `:focus-visible` (not
  `:focus`) so it only shows for keyboard navigation, not mouse clicks.
- **Contrast check** (computed, not eyeballed): `--brick` (#B05533) on
  `--paper` (#F4EFE5) is **4.37:1** — passes WCAG AA for large text/UI
  components (needs 3:1) but is a hair under AA for normal body text
  (needs 4.5:1). On `--surface` (#FBFAF6, the card background) it's
  **4.80:1**, a clean pass. The palette already has a dedicated
  higher-contrast variant for exactly this situation — `--brick-text`
  (#7A3920) is **7.53:1** on paper. Not changed site-wide here: `--brick`
  is a deliberate, load-bearing brand device (used dozens of times as
  large italic-serif emphasis, which passes outright), and blanket-
  swapping it would be a colour-usage decision, not an accessibility
  bug fix. The one place this is a real, measurable near-miss is small
  (11px mono) eyebrow labels that override the default `--ink-3` color
  to `--brick` — if Harry wants those swapped to `--brick-text`, it's a
  one-line-per-instance change, flagged here rather than done silently.

### 4. Real map tiles — already done, tracker was stale

`map.html` already loads real Leaflet (`leaflet@1.9.4`) with a real
`L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', ...)`
and marker clustering (`casa-map-page.js`) — confirmed live (25 real
OSM tiles loaded, `casaMapInstance` a genuine `L.map` instance, region
polygon overlays, working search/filter sidebar). No "static pin layer"
exists on this page. Nothing changed here; the launch tracker's item was
out of date, not the code — per `CASA_PROJECT_BRIEF.md`'s own rule to
verify code before trusting a tracker.

### 5. Analytics — code is live now, needs a Plausible account to show data

`<script defer data-domain="casa.co.uk" src="https://plausible.io/js/script.js"></script>`
added to all 32 real pages (confirmed loading, 200 OK). Unlike the other
two, this needs no secret key baked into the code — Plausible's script
just needs a Plausible account with `casa.co.uk` added as a tracked
site, which **Harry needs to create**; the moment that exists, this
script starts reporting to it with zero further code changes. If the
site launches on a different domain first (no CNAME is committed yet —
see the repo-hygiene phase), the `data-domain` value here needs to match
whatever the real deployed domain is.

## Phase 12 — Backend foundation: last known gaps

Three things: sync real email confirmation automatically instead of
Harry re-confirming it by hand, a real security pass now that real user
data exists in these tables, and actively hunting for anything else
still stubbed rather than just confirming the known list.

### Real email verification sync (`email-verification-sync.sql`)

`profiles.email_verified` used to require Harry manually flipping it,
even though Supabase Auth already tracks real confirmation for certain
(`auth.users.email_confirmed_at`). Now: `handle_new_user()` seeds it at
profile-creation time from that real value, a new trigger
(`on_auth_user_email_confirmed`) syncs it the moment a user completes
the real magic-link/6-digit-code flow, and a one-time backfill catches
accounts confirmed before this migration existed. `phone_verified` /
`gov_id_verified` / `background_check` are untouched — still genuinely
manual, exactly as `VERIFICATION-POLICY.md` documents, since no
automated source of truth exists for those yet.

### Real security pass (`rls-hardening.sql`)

Spot-checked policies directly rather than trusting schema.sql's
original comments — found four real, exploitable gaps, all reachable
today from nothing more than a browser console and a real session. Row
Level Security only controls *which rows* a policy lets through; none
of these had a column-level guard, so an "own row" policy on a table
with a privileged column let a user touch that column too:

1. **profiles** — any signed-in user could self-set
   `gov_id_verified`/`background_check`/`phone_verified` to `true` and
   forge their own "Verified+" badge. This is the one that matters
   most: the entire point of the manual-review process in
   `VERIFICATION-POLICY.md`, bypassable in a single API call.
2. **community_members** — any user could set their own `role` to
   `'admin'` (including on first join, no prior membership needed) and
   gain moderator powers over any community — ban other users, edit the
   community, flip `is_official`.
3. **messages** — "participants mark messages read" let any participant
   rewrite *any* column on *any* message in a shared conversation, not
   just their own `read_at` — including `body` and `sender_id`.
4. **enquiries** — the guest could update the same row the host is
   supposed to confirm/decline, including self-setting
   `status: 'confirmed'` on their own booking, or silently changing
   `check_in`/`check_out`/`total_price` after submitting.

Fixed with a `BEFORE UPDATE` trigger guard on each (resets protected
columns to their prior value for `auth.role() = 'authenticated'`
requests — real end-user sessions, not Harry's Dashboard table editor,
which connects as service-role and is untouched), plus tightening
`enquiries`' UPDATE policy to host-only. `create_conversation_for_enquiry`
(SECURITY DEFINER, called by the guest) is explicitly still allowed to
set `conversation_id` — SECURITY DEFINER bypasses RLS row checks but
not triggers, so this needed an explicit exception, not just RLS.
Moderator promotion for `community_members` now has to go through
Harry's table editor too, same as verification — there's no other
legitimate write path for it today.

### Actively hunting, not just confirming the known list

Found and fixed one more, bigger than either of the above in user-
facing terms: **property.html's entire reviews section was static,
fabricated HTML** — 4 fake reviews ("Marcus J.", "Laura P.", "Hannah &
Tom", "Daniel R.", all referencing a specific Windermere cottage) shown
identically on *every* listing regardless of which property you're
viewing, plus a permanently-stuck "4.9 · 23 reviews" header. A guest's
real review (`profile.html` → the real `reviews` table) never rendered
anywhere — it only nudged the small aggregate rating badge near the
title. Compounding it: `profile.html`'s `submitReview()` also dual-wrote
every review to `localStorage['casa:reviews']` *before* attempting the
real Supabase insert, and property.html re-rendered that local copy on
top of the fake static list — so a failed real insert still looked
like a successful post to the one person who'd notice, and a
successful one could show up twice on the submitter's own browser.
Both fixed: `property.html` now fetches and renders real reviews
(honest "No reviews yet" empty state when there are none, which is
every listing right now — the `reviews` table is genuinely empty), and
the `localStorage` dual-write in `profile.html` is gone entirely. The
fabricated per-category breakdown bars (Cleanliness/Communication/etc)
were removed rather than backed with real numbers — the schema only
ever stored one `stars` value per review, there's no real per-category
data to show.

Also flagged, not fixed here (out of scope for a backend/security
session — a real UI feature, not a data-integrity issue):
`property.html`'s "All 12 photos" gallery button just calls
`alert('Open gallery (12 photos)')` — a real dead end for anyone
who clicks it expecting a photo lightbox.

## Phase 13 — Concierge data model (`concierge.sql`) — SCOPING ONLY, NOT APPLIED

Unlike every other phase above, this one is **not live**. It's a real
migration file, written and reviewed, deliberately not run against the
project yet — Concierge's actual value (drafting replies over a real
WhatsApp/email channel) depends on two external accounts only Harry can
create: a Meta-verified WhatsApp Business API setup, and a
Concierge-specific Resend sending domain distinct from the transactional
one already live. See `CONCIERGE-INTEGRATION.md` at the repo root for
exactly what each of those requires outside of code, with realistic
timelines (Meta business verification in particular commonly takes
weeks, not days).

What the schema adds, once applied: `concierge_settings` (the real,
server-side home for what's currently only in the browser's
`casa:concierge` localStorage key — needed because a server-side process
drafting a reply to an inbound WhatsApp message can't read a browser
tab's localStorage), `concierge_channels` (a host's connected WhatsApp
number / Concierge email address, starting `pending_verification` and
never client-settable to `active`), `concierge_threads` (one per
external conversation, optionally bridging to a real `conversations` row
when the same guest also has one — nullable, since an external contact
may never have used Casa's own enquiry flow), and `concierge_messages`
(inbound/draft/sent/discarded, with no UPDATE policy at all for
signed-in users and a `SECURITY DEFINER` function,
`casa_send_concierge_message()`, as the *only* path from draft to sent —
the actual data-level mechanism making "Concierge only ever drafts,
never auto-sends" true, not just an app-level promise). Full reasoning
for each design choice, including why this doesn't duplicate
`conversations`/`messages`, is in the file's own comments.

**Found while scoping this, not fixed here** (a copy fix, not a schema
issue — out of scope for this pass): `how-it-works.html` and `list.html`
both still advertise Concierge at "£24/month or 2% on AI-confirmed
bookings," contradicting the flat-fee-only guardrail `host.html` and
`casa-concierge.js` already correctly state elsewhere. Flagged in
`CONCIERGE-INTEGRATION.md` for a separate follow-up.

**Do not run `concierge.sql` yet** — review it and
`CONCIERGE-INTEGRATION.md` together first. No UI reads or writes these
tables; `host-concierge.html`'s rules simulator is unchanged.

## Recommended next phase (deferred, not urgent)

Real image upload for feed posts (the "Photo" post type has no working
upload path yet — a post can be that type, it just won't have any
images), and a real calendar UI (using `casa_get_confirmed_ranges`) so
unavailable dates are greyed out in the booking form itself.
