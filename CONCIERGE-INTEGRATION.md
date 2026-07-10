# Casa Concierge — WhatsApp/email integration: what's real, what Harry needs to do

This is a **scoping document**, written alongside `supabase/concierge.sql`
(a real migration file, **not yet applied** — see its header). Nothing in
this pass connects to a live WhatsApp Business account or a
Concierge-specific email domain. Both require Harry to create/verify
real external accounts first, the same category of work as the
Resend/Sentry setup in `supabase/README.md` Phase 11 — this document is
the equivalent write-up for Concierge.

## What Concierge is today (before either integration exists)

`casa-concierge.js` + `host-concierge.html` are a real, working **rules
simulator**: a host sets minimum stay / max guests / price floor / pets
policy / tone, and can test how an enquiry would be evaluated
(`casaConciergeEvaluate()`). It's genuinely useful today for a host
deciding whether Concierge's rules would suit them. It does **not**
currently touch WhatsApp, email, or even Casa's own real enquiries —
settings live only in the browser's `localStorage`
(`casa:concierge`), and nothing calls `casaConciergeEvaluate()` against a
real incoming enquiry yet.

## The two hard guardrails (unchanged, re-confirmed here)

1. **Flat monthly pricing only for Concierge — never a % of bookings.**
   `casa-concierge.js` already states this in a comment
   (`casaConciergePriceLabel()`: "Flat fee only — never a % of booking
   value, which would contradict Casa's 0% commission claim even as an
   'optional' add-on") and `host.html`'s dashboard copy says the same
   ("£24/mo flat, never a % of your bookings"). **`supabase/concierge.sql`
   has no column anywhere that stores or derives a booking-value-linked
   charge** — there's nothing to enforce here at the schema level because
   the schema simply never represents that concept. Billing for
   Concierge itself (however it eventually gets charged) is out of scope
   for this file entirely, same as the rest of Casa's billing.

   **Found while scoping this in an earlier pass, since fixed**:
   `how-it-works.html` and `list.html` (and, found in the same sweep,
   `terms.html`) briefly advertised Concierge as "£24/month per listing
   or 2% on AI-confirmed bookings" — a live contradiction of this exact
   guardrail. All three now read "£24/month per listing, flat — never a
   % of your bookings", matching `host.html` exactly (pushed as
   `455adc6`). Re-confirmed still true as of this pass — no page
   advertises a %-of-bookings fee for Concierge anywhere on the site.

2. **Concierge only ever drafts — it must never auto-send a WhatsApp
   message or email to a guest without a human reading and sending it.**
   This is where the schema does real, active work, not just a promise:

   - `concierge_messages` has **no UPDATE policy at all** for signed-in
     users. With Postgres RLS enabled and zero matching policies, every
     direct `UPDATE` is denied outright — there is no client code path,
     buggy or malicious, that can flip a row's `status` by itself.
   - The only way a row is even created with `status = 'draft'` from the
     client side requires `direction = 'outbound' and status = 'draft'`
     in the INSERT policy's `WITH CHECK` clause — a database-enforced
     constraint, not just a UI default that could be bypassed by calling
     the API directly.
   - The **only** path from `draft` to `sent` is
     `casa_send_concierge_message(message_id)` — a `SECURITY DEFINER`
     Postgres function that a real, authenticated host must call
     themselves (it checks the calling user owns the thread, and that
     the message is currently a pending outbound draft, before doing
     anything). Nothing else — no trigger, no default, no scheduled job —
     can produce `status = 'sent'`.
   - Critically: **this function does not call WhatsApp's API or Resend
     itself.** It only marks a draft as sent by a real human action. The
     actual external dispatch is a separate integration (an Edge
     Function, not built yet) that would run *after* a host's real send
     action — meaning even once that Edge Function exists, the human
     decision point (calling this function) still has to happen first.
     There is no code path today, and none designed here, where an AI
     draft reaches a guest without that step.
   - Inbound messages (a guest's real reply) can only ever be inserted
     with `status = 'received'` (enforced by a `CHECK` constraint tying
     `direction`/`status` together) and, in practice, only via a
     service-role Edge Function processing a real webhook — not
     reachable by a normal signed-in client at all.

## What Harry needs to do outside of code

### WhatsApp Business API (via Meta)

This is a real, multi-step external process — budget **weeks, not
days**, especially for a first-time business verification.

1. **Create a Meta Business Account** (business.facebook.com / Meta
   Business Suite), if Casa doesn't already have one separate from any
   personal Facebook/Instagram accounts.
2. **Complete Meta Business Verification** inside Meta Business Manager:
   submit real business documents (UK business registration / Companies
   House details, a proof-of-address document such as a utility bill or
   bank statement, and matching contact details). Meta's own stated
   turnaround is often "1–2 business days" for straightforward cases, but
   real-world timelines commonly stretch to **1–4+ weeks**, especially if
   Meta requests additional documents or a first submission gets
   bounced back — plan around the slow case, not the fast one.
3. **Choose an onboarding route** for the WhatsApp Business Platform
   itself:
   - **Meta's own Cloud API directly** — no extra platform fee beyond
     Meta's own per-conversation pricing, but Casa has to build and host
     the webhook receiver itself (a Supabase Edge Function is a
     reasonable fit, since that infrastructure already exists for
     `email-notifications.sql`).
   - **A Business Solution Provider (BSP)** — e.g. Twilio, 360dialog,
     MessageBird/Bird, Vonage. Usually faster/simpler onboarding (the BSP
     has an existing relationship with Meta and often pre-verified
     infrastructure), at the cost of the BSP's own platform fee on top
     of Meta's messaging costs. For a 20–30-host pilot, a BSP is likely
     the more realistic near-term route — less new infrastructure to
     stand up for a small volume.
4. **A dedicated phone number** for the WhatsApp Business Account (WABA)
   — it cannot be a number already registered on regular WhatsApp or the
   consumer WhatsApp Business app, and needs to receive an SMS or voice
   call to verify.
5. **WhatsApp Business Profile display name review** — a separate Meta
   review from business verification itself, can take a further few
   days and is sometimes rejected on the first attempt (commonly for
   names Meta considers too generic or not matching the verified
   business name closely enough), requiring resubmission.
6. **Costs**: Meta's business verification itself has no fee. Messaging
   costs are per-conversation (a 24-hour message window), varying by
   country and conversation category (utility/service conversations are
   typically cheaper than marketing ones) — check Meta's and any chosen
   BSP's current pricing pages directly before committing, since these
   rates change and this document shouldn't be the source of truth for
   them. If going via a BSP, expect an additional monthly platform
   and/or per-number fee on top.

**Bottom line**: this is not a same-week integration. Realistic planning
is "start the Meta verification early, in parallel with other work,
expect it to take real calendar weeks" — not something to begin the week
Concierge is meant to go live.

### A Concierge-specific Resend sending domain

Resend is already set up for Casa's transactional notification emails
(`supabase/README.md` Phase 11 — enquiry/reply/status-change emails).
Concierge needs something meaningfully different from that setup, for
two separate reasons:

1. **Volume and reputation isolation.** Transactional notification email
   (a handful of emails per real enquiry/reply) and Concierge email
   threads (potentially many guest back-and-forth messages) have very
   different sending patterns. Mixing them on the same sending domain
   risks a deliverability problem in one affecting the other — a
   dedicated subdomain (e.g. `concierge.casa.co.uk`, distinct from
   whatever domain sends `notifications@casa.co.uk`) keeps them
   independently reputable.
2. **Concierge email needs to *receive* replies, not just send them** —
   a guest replying to a Concierge email needs that reply to land back
   in a `concierge_threads`/`concierge_messages` row, which is a
   fundamentally different capability from Resend's core sending API.
   **This document does not assert Resend's current inbound-email
   feature set meets this need** — Resend has been actively expanding
   its product and this may have changed since; before building
   anything, confirm directly against Resend's current docs whether
   their inbound/receiving support (if any) fits a two-way conversation
   thread, or whether a dedicated inbound email service is needed
   alongside Resend-for-sending. Don't take this document's word for it
   either way.

**What Harry needs to do, once ready to proceed:**
0. **Own and DNS-point `casa.co.uk` itself, first.** Every step below —
   and, it turns out, the *existing* transactional Resend setup in
   Phase 11 too — assumes `casa.co.uk` is a real domain Casa controls
   the DNS for. As of this pass, it isn't: the live site is still served
   from GitHub Pages' default domain, no CNAME is committed to this
   repo, and `supabase/README.md` Phase 11 flags this as an outstanding
   item, not a done one. This isn't Concierge-specific — it's a
   prerequisite for the transactional Resend domain, the Sentry
   `environment` check in `casa-monitoring.js`, and the notification
   email's own guest-facing links, all of which already reference
   `casa.co.uk` as if it were live. Concierge's dedicated subdomain
   (step 2 below) can't be verified in Resend before this is done,
   since a subdomain verification is meaningless without the parent
   domain existing and being DNS-controlled by Casa. Realistic
   timeline: domain registration itself is same-day; DNS propagation
   for the records Resend/GitHub Pages need is typically minutes to a
   few hours, rarely more than 24–48 hours worst case — the slow part
   of "going live on casa.co.uk" is deciding to do it and updating
   every place that currently points at the GitHub Pages URL, not the
   DNS mechanics themselves.
1. Decide on the Concierge sending subdomain/address (e.g.
   `concierge@mail.casa.co.uk` or similar — distinct from the
   transactional `FROM_EMAIL` already configured).
2. Verify that subdomain in Resend (same DNS-record process as the
   original domain verification in Phase 11, a separate DNS TXT/CNAME
   set).
3. Confirm, directly against Resend's current documentation, whether
   their inbound-email feature covers a real two-way thread for this use
   case — if not, evaluate a dedicated inbound email provider instead
   (this is a real decision point, not a foregone conclusion baked into
   this document).
4. Only once both directions (send + receive) are confirmed working
   should `concierge_channels` gain a real `channel_type = 'email'` row
   with `status` moved to `'active'` — and per the schema design above,
   that status change is deliberately not something a host (or a stray
   client-side bug) can do themselves; it has to be a genuine backend/
   Harry action once the channel is real, mirroring exactly how
   `VERIFICATION-POLICY.md`'s host ID checks are Harry's own manual
   action today, not a self-service toggle.

## Separately: are Resend and Sentry (already built) actually ready?

Re-verified this pass, not assumed — full detail in `supabase/README.md`
Phase 11's new addendum, summarised plainly here:

- **Sentry**: yes, code-ready, re-confirmed live in the browser this
  session. The SDK loads on every page and correctly stays inert (logs
  one clear console line, initialises nothing) because
  `CASA_SENTRY_DSN` in `casa-monitoring.js` is still the placeholder
  string. The **entire** remaining step is Harry creating a Sentry
  account and pasting a real DSN into that one constant — no other code
  changes needed.
- **Resend**: yes, code-ready — re-read `send-notification-email/
  index.ts` and `email-notifications.sql` in full; both match their
  original description exactly, the two SQL placeholders are still
  genuinely unfilled, and nothing regressed. **One dependency worth
  surfacing, not previously called out as sharply**: both this existing
  transactional setup *and* everything in this document about a
  Concierge-specific domain assume `casa.co.uk` is a real, DNS-pointed
  domain. It isn't yet — see the step-0 prerequisite above. This doesn't
  block creating the Resend account or deploying the function today
  (Resend's shared test domain covers a small pilot fine in the
  meantime), but going fully live on real guest-facing email — with
  working "Open on Casa" links — needs the domain step done too, not
  just the Resend account.

## What this pass deliberately did not do

- No connection to a real WhatsApp Business account or Resend Concierge
  domain — both require accounts/verification only Harry can create.
- No UI — `host-concierge.html`/`messages.html` are unchanged; the
  rules simulator still runs entirely off `localStorage`, same as
  before this pass.
- No Edge Function that would actually call the WhatsApp API or Resend —
  that's real integration work for once the accounts above exist, and
  belongs in its own session against `supabase/concierge.sql`'s tables.
- No change to Concierge pricing (the £24/mo-vs-2% copy inconsistency
  found in an earlier pass is already fixed — see above — and this pass
  made no further pricing changes).
