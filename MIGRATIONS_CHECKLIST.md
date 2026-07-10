# Casa — Supabase migrations checklist

Apply these **in order** in the Supabase SQL editor for project
`ktxhkoxjrgkjxrszmbii`. The frontend is already wired for all of them;
until applied, related features fail open or no-op gracefully.

**Status key:** ✅ applied · ⬜ not yet confirmed · 🔴 urgent

| # | File | Status | What it unlocks |
|---|------|--------|-------------------|
| 1 | `supabase/schema.sql` | ✅ (baseline) | Core tables, RLS, seed properties |
| 2 | `supabase/storage.sql` | ⬜ | Host photo uploads on publish |
| 3 | `supabase/rls-hardening.sql` | 🔴 **urgent** | Blocks forged Verified+ badges, self-confirmed bookings, message tampering |
| 4 | `supabase/availability.sql` | ⬜ | `casa_check_date_conflict` + `casa_get_confirmed_ranges` (booking form now uses the latter) |
| 5 | `supabase/notifications.sql` | ⬜ | Cross-user notification triggers |
| 6 | `supabase/email-notifications.sql` | ⬜ | Email on enquiry/message (needs Resend + Edge Function deploy) |
| 7 | `supabase/email-verification-sync.sql` | ⬜ | Auto-sync `profiles.email_verified` from Auth |
| 8 | `supabase/cancellation-policy.sql` | ⬜ | Per-listing cancellation policy column |
| 9 | `supabase/community.sql` | ⬜ | Voting, spaces, hot-rank view, threaded replies |
| 10 | `supabase/homepage-preferences.sql` | ⬜ | Profile → “Personalize your homepage” saves |
| 11 | `supabase/concierge.sql` | ⬜ **scoped only** | Do not apply until WhatsApp/Resend accounts exist — see `CONCIERGE-INTEGRATION.md` |

## After applying `rls-hardening.sql`

Smoke-test in browser console (signed in as a normal user, not service role):

- Cannot `update profiles` set `gov_id_verified = true` on own row
- Cannot `update enquiries` set `status = 'confirmed'` as guest
- Host can still confirm/decline enquiries from `host.html`

## External setup (not SQL)

| Item | Owner | Notes |
|------|-------|-------|
| Resend account + `send-notification-email` deploy | Harry | See `supabase/README.md` Phase 11 §1 |
| Sentry DSN in `casa-monitoring.js` | Harry | Replace `REPLACE_WITH_REAL_SENTRY_DSN` |
| Plausible site | Harry | Add **both** `casa.co.uk` and your GitHub Pages hostname |
| `casa.co.uk` DNS → GitHub Pages | Harry | Email links and analytics assume this domain |

## Code-only changes (July 2026 review tiers)

These ship in the frontend without SQL:

- Homepage hashtag wall → real post counts (`casaRenderHomeTagWall`)
- Preview banner only on localhost (`CASA_CONFIG.mode`)
- Fake notification seed removed
- Map overview prompt when no region selected
- Booking form shows confirmed blocked ranges + validates overlap
- Concierge copy aligned on `host-resources.html`

_Last updated: July 2026 — branch `cursor/casa-review-tiers-e92e`_
