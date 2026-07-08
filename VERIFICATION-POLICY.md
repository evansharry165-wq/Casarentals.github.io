# Casa "Verified Host" badge — criteria

Previously the badge was a bare `verified: true` flag with no defined
meaning behind it. This documents what it actually checks, matching
`casaHostVerifiedTier()` in `casa-hosts.js`.

## Verified

All three required:

- **Email verified** — confirmed ownership of the account email address.
- **Phone verified** — confirmed ownership of a contact phone number.
- **Government ID confirmed** — identity confirmed against a government-issued
  photo ID.

## Verified+

Everything in Verified, plus:

- **Background check passed** — a third-party criminal record / right-to-let
  check. Optional and host-initiated, not required to list or to reach the
  base Verified tier.

## How verification actually happens during the pilot (manual)

`casaHostVerifiedTier()` and the underlying `profiles.email_verified` /
`phone_verified` / `gov_id_verified` / `background_check` columns are real
and already work correctly — a host's badge on `host-profile.html` and
`property.html` reflects exactly what's in those four columns. What was
missing was the *process* that sets them. For the pilot (20–30
manually-recruited hosts), that process is entirely manual — no ID-upload
UI, document storage, or third-party verification service (e.g. Stripe
Identity) yet. That's a deliberate later-phase decision, made once the
pilot is past manual review capacity, and it would naturally pair with
the eventual Stripe Connect payment migration rather than being built
separately now.

**The process:**

1. A host sends Harry a photo/scan of a government-issued photo ID
   through Casa's existing real messaging system (`messages.html`) — the
   same channel every other host/guest conversation uses. No dedicated
   upload form.
2. Harry reviews it personally against the name on the account and the
   photo, then flips the relevant column(s) directly in the Supabase
   table editor (`profiles` row for that host). No app code runs this —
   it's a direct, manual database edit.
3. **The document is reviewed once and not retained** — Harry doesn't
   download, forward, or store a copy anywhere beyond that one-time
   check in the message thread itself. This is a data-minimisation
   choice, not an oversight: Casa holds no ID document library for
   pilot hosts to worry about securing or eventually deleting.

**What Harry actually confirms per field:**

- `email_verified` — confirmed ownership of the account email. Supabase
  Auth already tracks real email confirmation (`signup.html`'s
  magic-link/6-digit-code flow sets `auth.users.email_confirmed_at` for
  real) — Harry can treat that as sufficient evidence and flip this
  column to match, since nothing currently syncs the two automatically.
- `phone_verified` — confirmed ownership of a contact phone number. No
  OTP-based phone flow exists yet, so for the pilot this means Harry
  personally confirms a real, reachable number (e.g. a call or text
  exchanged during onboarding), not an automated check.
- `gov_id_verified` — the ID document (step 1 above) genuinely matches
  the name and photo on the account, and looks like a real, unaltered
  government-issued document. If anything looks off, don't flip it —
  ask for a clearer copy or a different document instead.
- `background_check` (Verified+ only) — a real, passed third-party
  criminal record / right-to-let check the host has independently
  obtained and shown Harry, not something Casa runs itself for the
  pilot. Optional; a host can be fully "Verified" without ever pursuing
  this.

All four are manual today, including email/phone — there's no
automated sync from Supabase Auth's own state into these `profiles`
columns yet, so even a real, confirmed email or phone still needs
Harry's column edit to actually surface as "Verified" in the UI.

## What this does *not* cover yet

- **How** each check would be performed at real scale (which ID/
  background-check provider, retry/appeal process, re-verification
  cadence) is a later-phase decision — it depends on which provider
  (Stripe Identity, Onfido, Persona, etc.) eventually gets integrated,
  replacing manual review once volume outgrows it. Not needed for the pilot.
- **Guest** verification uses the same three core fields for consistency
  (`casa-hosts.js`'s `james-h` entry), but guest-side verification badging
  hasn't been designed as its own product surface yet.
- Property-level badges (`badge: 'verified'` in `casa-properties.js`, shown
  on browse/search cards) are a separate, listing-quality concept — not
  changed by this policy. They're about the *listing*, not the *host's*
  identity checks.

## Where it's shown

- `host-profile.html` — host's own public profile page.
- `property.html` — "hosted by" section on a listing.

Both call `casaHostVerifiedTier(host)`, returning `'verified'`,
`'verified-plus'`, or `null` — never read a raw `verified` flag directly.
