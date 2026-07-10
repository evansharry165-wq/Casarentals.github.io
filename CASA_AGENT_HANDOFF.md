# Casa — agent handoff (Claude / Cursor)

Use this file to sync any AI assistant with the **current** Casa state.
`CASA_PROJECT_BRIEF.md` is the vision/conventions doc; **this file** is
the operational snapshot after the July 2026 review-tier integration.

---

## Repository

- **GitHub:** `evansharry165-wq/Casarentals.github.io`
- **Live preview:** https://evansharry165-wq.github.io/Casarentals.github.io/
- **Target domain:** `casa.co.uk` (not DNS-pointed yet)
- **Stack:** Static HTML/CSS/JS + Supabase (`casa-supabase.js` + `casa.js`)
- **No build step** for local dev; GitHub Actions runs `scripts/build-site.sh` → `_site/`

---

## What changed in the review-tier pass

### Tier 1 — Trust & security (code)

| Change | Files |
|--------|-------|
| Homepage hashtag counts from **real feed posts** only (no fake 214/198…) | `casa-tags.js`, `index.html` |
| Preview banner **only on localhost**; deployed site is `CASA_CONFIG.mode = 'live'` | `casa.js` |
| Removed fabricated notification seed (no more fake “3” badge) | `casa.js` |
| Concierge pricing: flat £24/mo only on `host-resources.html` | `host-resources.html` |

### Tier 1 — Trust & security (manual — Harry)

| Action | File |
|--------|------|
| **Apply RLS hardening** | `supabase/rls-hardening.sql` |

### Tier 2 — UX (code)

| Change | Files |
|--------|-------|
| Hero hides “Avg. rating” until real reviews exist | `index.html` |
| Map overview prompt when UK-wide (pins need a region) | `map.html`, `casa-map-page.js`, `casa-pages/map.css` |
| `#glamping`, `#cottage`, `#scottishhighlands` tag matching | `casa-tags.js` |
| Booking shows confirmed blocked ranges + validates before submit | `booking.html`, `casa-availability.js` |
| Browse filter count no longer hardcodes “8 stays” | `browse.html` |

### Tier 3 — Infra (documented, not automated)

See `MIGRATIONS_CHECKLIST.md` for SQL apply order and Resend/Sentry/Plausible/DNS.

### Tier 4 — Deferred (not in this pass)

- Feed photo uploads
- Full `community.sql` UI (voting/spaces) — helpers exist in `casa-community.js`
- Cold-start editorial feed content strategy

---

## Current product state (accurate)

**Live in Supabase + frontend:** auth, listings publish, enquiries, messaging
(Realtime), saved, follows, reviews, reports, mutes, notifications table,
feed posts/replies, guest discovery (`casaRefreshProperties`), host confirm/
decline enquiries, property gallery lightbox, real reviews on property page.

**Empty by design:** `reviews` table (no ratings on cards yet), feed started
from zero after fake seed posts were deleted — grows from real posts only.

**localStorage** remains for drafts/UI cache only (`casa:feed-draft`,
`casa:listing-draft`, `casa:availability` host calendar demo, etc.).

---

## Conventions (do not break)

1. Script load order: Supabase CDN → `casa-supabase.js` → shared modules → `casa.js` → page inline
2. `casaRefreshProperties()` replaces `CASA_PROPERTIES` with published Supabase rows
3. Never commit service-role keys; never re-add fabricated social proof numbers
4. Verify visible difference on named pages before marking UX tasks done
5. Commit in small increments; report commit hash at session end

---

## Copy-paste prompt for Claude

```
You are continuing work on Casa (casa.co.uk) — UK zero-fee holiday rentals + community feed.

Read these files first (in order):
1. CASA_PROJECT_BRIEF.md — vision & conventions
2. CASA_AGENT_HANDOFF.md — current state snapshot
3. MIGRATIONS_CHECKLIST.md — Supabase migrations still to apply
4. supabase/README.md — what's wired to real Supabase calls

Repo: evansharry165-wq/Casarentals.github.io
Live: https://evansharry165-wq.github.io/Casarentals.github.io/

Recent work (July 2026 review tiers):
- Real hashtag counts on homepage; no fake notification seed; preview banner localhost-only
- Map overview prompt; booking blocked-date ranges; tag fixes (#glamping, #scottishhighlands)
- host-resources Concierge copy fixed to flat £24/mo

Your top manual task if not done: apply supabase/rls-hardening.sql (URGENT).

Do NOT trust casa-audit.md or launch-plan.md — they are stale.

Before changing anything, check git/main and the actual code. Match existing patterns in casa-*.js. No build tooling. End sessions with a pushed commit hash.
```

---

_Update this file when migrations are applied or major features ship._
