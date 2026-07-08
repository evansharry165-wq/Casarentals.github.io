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
data.

The Supabase backend is live (Phase 06) — auth, listing creation,
enquiries, saved properties, follows, reviews, reports, and messaging all
write to real tables now, not just `localStorage`. Guest-facing discovery
(browse, map, property detail, host profile) now also reconciles with
real Supabase data, so a host's real published listing is actually
findable and correctly displayed — this also fixed a real bug where
`property.html` silently rendered the wrong listing for any id outside
the hardcoded seed set. See `supabase/README.md` for exactly what's
wired vs. what's still local-only and why (short version: feed replies
and the feed post composer are blocked on migrating the 21 seed
community posts into real tables — a genuine content-migration task, not
a quick wire).

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
- **Verification standard — applies to everything, especially visual/
  subjective work.** A task isn't done because code exists that *could*
  satisfy it — it's done when there's a specific, visible, or testable
  difference someone could actually go check. Concrete case this bit the
  project: a "make it feel more high-tech" prompt led to a full 266-line
  material system (`casa-tech.css` — ambient glow, `.glass`/`.depth`
  card treatments, scroll-reveal) being built, then applied to real page
  content in exactly zero places, while the ambient effect itself was
  tuned so subtly (3–14% opacity) it was invisible. The system existed;
  the site looked unchanged. Before marking anything done — especially
  design/UX work — describe in plain English the specific visible
  difference on the specific named page(s). If that description can't be
  written with real specificity, treat the task as not done, regardless
  of what code exists.
- **Report the commit hash at the end of every session, always, not just
  on request.** A separate real incident: a full round of verified,
  working changes was described in detail as complete, but never actually
  committed — it existed only in-session and never reached `origin/main`,
  which wasn't discovered until three separate fresh exports of the repo
  all failed to show any of the claimed work. End every session-completion
  report with the actual pushed commit hash (e.g. "pushed as `c6c94da`"),
  confirmed via `git log` / `git status` against `origin/main`, not
  assumed. This is the cheapest possible check and would have caught the
  gap immediately instead of several rounds later.
- **Verify before trusting docs/trackers.** Tracker files and planning
  docs go stale fast. Before redoing or "fixing" something a tracker
  flags, check the actual current code/git history first.
- **localStorage keys, and which are wired to real Supabase tables** —
  see `supabase/README.md` for the full picture. Corrected against direct
  code inspection (the previous version of this list was stale — always
  verify against the actual code, not this document, per the rule above):
  - `casa:user` — **live**, synced from the real session (`profiles` +
    `auth.users`), read-through cache, not the source of truth anymore
  - `casa:saved` — **live** (`saved_properties`)
  - `casa:follows` — **live** (`follows`, via `CASA_HOSTS[key].supabaseId`)
  - `casa:enquiries` — **live** (`enquiries`), and enquiry → conversation
    linking is real too, via the `create_conversation_for_enquiry` RPC
  - `casa:reviews` — **live** (`reviews`)
  - `casa:reports` — **live** (`reports`)
  - `casa:muted-users` — **live** (`muted_users`)
  - `casa:notifications` — **live** (`notifications`), read-through cache
    like `casa:user` above — corrected from an earlier stale note in this
    file that called it local-only; it isn't
  - Community feed (`feed_posts`, `feed_replies`) — **live**. The 21
    fabricated seed posts were deleted rather than migrated (no real
    accounts behind their invented authors); the feed starts empty and
    grows from real posts only
  - Conversation blocking — **live** (`conversation_participants.blocked`)
  - Remaining local-only keys are genuinely fine to stay that way — they're
    transient UI/draft state, not core data needing to sync across users:
    `casa:feed-draft`, `casa:listing-draft`, `casa:host-listings`,
    `casa:availability`, `casa:map-feed`, `casa:recent`,
    `casa:pending-oauth-role`, `casa:concierge`
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
- **Payments for the pilot**: bank transfer, direct between guest and
  host, off-platform — Casa never touches, stores, or sees a bank account
  number. Not permanent: Stripe Connect is the planned graduation path
  once real volume justifies the integration effort, not needed now.
  Guidance is surfaced at the moment a host confirms a booking (a real
  message posted into that enquiry's conversation, plus a status banner
  in `messages.html`) — see `supabase/README.md` Phase 10.
- **Cancellation policy**: host-set, per listing (`properties
  .cancellation_policy`, sensible default "free cancellation up to 7 days
  before check-in", editable in `list.html`). Casa can't hold funds, so it
  can't enforce a refund — the field's job is visibility before a guest
  enquires (`property.html`, `booking.html`), not enforcement.
- **Host verification for the pilot**: manual, no new integration yet. A
  host sends ID through the existing real messaging system, Harry reviews
  it personally and flips the Supabase column directly — no document
  storage beyond that one-time review. Documented in
  `VERIFICATION-POLICY.md`. An ID-verification integration (e.g. Stripe
  Identity) is deliberately deferred to a later phase, pairing naturally
  with the eventual Stripe Connect migration rather than being built
  separately now.
- **PWA / native app**: pocketed until the Supabase backend lands. A PWA
  manifest + service worker is the recommended first step when revisited
  (cheap, and the mobile-responsive groundwork is already done); a real
  App Store listing via Capacitor/TWA would be a bigger follow-up, not
  needed for launch.
