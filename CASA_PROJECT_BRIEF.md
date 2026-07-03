# Casa — Project Brief

Standing source of truth for the vision, design system, and conventions.
Read this (and `casa-launch-tracker.html` / the latest tracker file in
iCloud) before picking up work.

## Vision

Casa (casa.co.uk / casa.com) is a zero-fee UK holiday rental marketplace
that doubles as a Reddit-style social platform. Hosts pay a flat monthly
subscription (currently £19/month per listing, 0% commission) — guests pay
nothing.

The community feed (hashtags, location/property tagging, direct posting) is
**not a bolt-on** — it's the mechanism that lets hosts and guests find each
other and connect directly, and it's as core to the product as the booking
flow itself. Reviews, connections, locations, properties, and local
attractions should all be discoverable through it.

**Monetisation is deliberately deferred** until the core product is fully
functional for both guests and hosts. Don't build billing/payment logic as
a side effect of anything else.

## Current state (high-level)

Frontend is functionally complete for the core guest and host loops:
search, browse, property detail, booking enquiry, community feed (posting,
replying, following, reporting/moderation), messaging, reviews, a local
attractions directory, and a host dashboard that reflects real submitted
data. Everything currently persists to `localStorage` via shared helpers in
`casa.js` and the other `casa-*.js` catalogue files — there is no live
backend yet. `supabase/` has the schema, seed data, and setup guide for the
migration; see `supabase/README.md` for the exact next step.

Don't trust old planning docs (`casa-audit.md`, `launch-plan.md`) for
current state — they're dated snapshots from earlier in the project and are
demonstrably stale (they reference files and gaps that no longer exist).
When in doubt, check the actual code and git history, not a document.

## Conventions

- **No build step.** Plain HTML/CSS/JS. Shared logic lives in root-level
  `casa-*.js` files, loaded via `<script src="...">` on the pages that need
  them — not bundled.
- **Script load order matters.** Any shared script whose functions are
  called at a page's top-level (synchronous) init — not just from a later
  click handler — must be loaded *before* that page's own inline
  `<script>` block. Loading it after causes a temporal-dead-zone /
  "function is not defined" crash that silently kills the rest of that
  script, with no visible error to the user. This has bitten this project
  multiple times (booking.html, feed.html, messages.html) — always check
  load order when adding a new shared-function dependency to a page.
- **Real functionality over demo polish.** When picking up a task, ask
  whether it makes a real feature work correctly with real (or
  realistic-shape) data, or just makes existing seed data look nicer.
  Prioritise the former. This codebase was originally built demo-first, so
  "looks done but does nothing" patterns are common — decorative buttons,
  filters that don't filter, forms with no real validation. Hunt for these
  actively.
- **Verify before trusting docs/trackers.** Tracker files and planning
  docs go stale fast. Before redoing or "fixing" something a tracker
  flags, check the actual current code/git history first.
- **localStorage keys as the interim data layer** — each one has a direct
  Supabase table already designed in `schema.sql`:
  - `casa:user` — current session (auth stub)
  - `casa:saved` — saved property IDs
  - `casa:follows` — followed host names/ids
  - `casa:enquiries` + `casa:local-convos` — bookings, linked to a message thread
  - `casa:local-replies` — feed reply overlay (merges with seed `REPLIES`)
  - `casa:reviews` + cross-post into `casa:local-feed-posts`
  - `casa:reports`, `casa:muted-users`, `casa:blocked-convos` — moderation
  - `casa:notifications`
- **Commit in small, real increments** and push as each logical piece
  lands, not one giant commit at the end.

## Design system

Instrument Serif (display/headings) + Instrument Sans (body/UI) +
JetBrains Mono (labels/meta), warm paper/ink/brick palette. Defined as CSS
variables in `casa.css`. `brand.html` is the internal reference (not
linked from site nav). Avoid the old Playfair Display / DM Sans system
referenced in stale docs — it's gone from the live site.

## Key product decisions made this project

- **"Verified Host" badge** — email + phone + government ID confirmed
  (base tier), plus a passed background check for "Verified+". Documented
  in `VERIFICATION-POLICY.md`, computed by `casaHostVerifiedTier()` in
  `casa-hosts.js`. Not a bare flag.
- **Pilot region**: Lake District, per the launch plan — 20–30 real hosts
  to be manually onboarded once listing creation is real (Supabase-backed).
- **Payments at launch**: not yet decided (bank transfer vs. Stripe
  Connect) — flagged as a genuine open decision, not a coding task.
- **PWA / native app**: pocketed until the Supabase backend lands. A PWA
  manifest + service worker is the recommended first step when revisited
  (cheap, and the mobile-responsive groundwork is already done); a real
  App Store listing via Capacitor/TWA would be a bigger follow-up, not
  needed for launch.
