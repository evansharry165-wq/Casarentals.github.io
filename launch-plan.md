# Casa launch plan

_Last updated: June 2026_

## Where the product is today

### Strengths (launch-ready surface)
- **Distinctive brand** — Instrument Serif design system is cohesive across 16 live pages
- **Core guest loop works** — search → browse (36 listings, 11 regions) → property detail → booking enquiry
- **Community layer** — multi-county feed, compose, hashtags, likes
- **Host tooling** — dashboard, calendar blocking, enquiry accept/decline, listing wizard
- **Technical stability** — shared `casa.js` / `casa-properties.js`; no global JS crashes

### Gaps before public beta
| Area | Status | Launch blocker? |
|------|--------|-----------------|
| Real auth & payments | Demo / localStorage | Yes — for full launch |
| Legal pages | Stub → now added | Was blocker |
| Unique property copy per listing | Template only | Medium — OK for beta |
| Mobile nav | Scroll/wrap only | Medium |
| Email / notifications | None | Yes — for production |
| Analytics & error monitoring | None | Medium |

### Recommended launch phases

**Phase A — Credibility (this sprint)** ✅ in progress
- Privacy & terms pages
- Favicon, footer links fixed
- **Casa Concierge** host add-on (prototype + pricing story)
- Waitlist as primary pre-launch CTA

**Phase B — Closed beta (4–6 weeks engineering)**
- Supabase auth (signup/signin for real)
- Host listing persistence
- Enquiry → message thread wiring
- Email notifications (Resend / Postmark)

**Phase C — Regional opening (Lake District first)**
- 20–30 real host listings (manual onboarding)
- Concierge pilot with 3–5 hosts
- Guest waitlist → invite waves

**Phase D — Full UK**
- Payments guidance (Stripe Connect or bank-details flow)
- Map tiles (Leaflet)
- Public host profiles

## Casa Concierge (AI host assistant)

**Concept:** Optional paid add-on for hosts who want “middleman admin” without platform commission.

- Host sets **rules** (min nights, pets, price floor, auto-decline windows, tone)
- AI handles **first-line** messages, availability checks, quote summaries, booking holds
- Host gets **digest + override** — escalations for edge cases, deposits, disputes
- **Pricing (proposed):** £24/month per listing *or* 2% on AI-confirmed bookings (host chooses)

**Why it fits Casa:** Keeps direct booking and £0 guest fees while monetising host-side value — the thing OTAs actually sell (admin relief).

**Risks to manage:** Transparency (guest must know they’re talking to Casa Concierge), UK consumer law on automated decisions, deposit/payment still host-direct.

Prototype: `host-concierge.html` + dashboard card + inbox badges.
