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

## What this does *not* cover yet

- **How** each check is actually performed (which ID/background-check
  provider, retry/appeal process, re-verification cadence) is a Phase 06
  decision — it depends on which provider (Stripe Identity, Onfido, Persona,
  etc.) gets integrated with the real backend. Today, `emailVerified` /
  `phoneVerified` / `govIdVerified` / `backgroundCheck` are seed-data booleans
  on `CASA_HOSTS`, not the result of a real check.
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
