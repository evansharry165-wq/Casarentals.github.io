# Casa — Supabase setup (Phase 06)

## Order of operations

1. **Create/reactivate the Supabase project** (supabase.com dashboard) — not
   something I can do; needs your login.
2. **Run `schema.sql`** in the SQL editor. Creates all tables + RLS policies.
3. **Create the 5 demo host accounts** (Auth → Users → Add user) with the
   exact emails listed at the top of `seed.sql`. Passwords don't matter —
   these aren't real logins, just anchors for the seed data's `host_id`
   foreign keys.
4. **Run `seed.sql`** — migrates the 36 demo properties from
   `casa-properties.js` and the 5 host profiles from `casa-hosts.js`.
5. **Get the project URL + anon (public) key** from Settings → API. Needed
   for the next step. Do not share the `service_role` key — that one
   bypasses RLS entirely and should never end up in frontend code or chat.

## What's not done yet

This is schema + seed data only — the frontend still runs entirely on
localStorage (`casa.js`'s `casaGetUser`, `casaSaveEnquiry`,
`casaToggleFollow`, etc.). Wiring the actual `supabase-js` client into
those functions is the next real step once the project URL/anon key are
available, roughly in this order (matches what's already load-bearing):

1. Auth — replace `casaGetUser`/`casaSetUser` with real
   `supabase.auth.signUp` / `signInWithPassword` (signup.html already has
   the exact call shape commented in).
2. `list.html`'s listing wizard — insert into `properties` for real
   (already has the call shape commented in) instead of showing a fake
   success screen.
3. `booking.html`'s enquiry flow — insert into `enquiries` (call shape
   already commented in) instead of `casa:enquiries` localStorage.
4. Everything built this session against `casa:local-*` keys (follows,
   reports, mutes, feed replies, reviews, blocked conversations) — each
   has a 1:1 table in `schema.sql` already.
5. `messages.html` — real-time via Supabase Realtime (or polling as a
   simpler first pass) instead of the simulated host-reply timer.
