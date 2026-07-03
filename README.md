# Casa (casa.co.uk)

A zero-fee UK holiday rental marketplace with a community feed as a core
feature, not a bolt-on. Hosts pay a flat monthly listing fee (0% commission);
guests pay nothing. See `CASA_PROJECT_BRIEF.md` for the full vision, current
state, and conventions.

Static site — no build tooling required to run it locally (open any `.html`
file, or serve the directory with any static file server). Currently backed
by `localStorage` for all user data; migrating to Supabase is in progress
(see `supabase/`).

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Homepage — hero search, destinations, community preview |
| `browse.html` | Search results — real filtering against `CASA_PROPERTIES` |
| `property.html` | Listing detail — gallery, booking widget, reviews, community mentions |
| `booking.html` | Enquiry form — validation, availability check, submits to `casaSaveEnquiry` |
| `map.html` | Full map explorer — regions, stays, and feed activity pins |
| `feed.html` | Community feed — availability posts, reviews, tips, photos, replies |
| `attractions.html` | Local attractions/tips directory, sourced from feed `#tip` posts |
| `messages.html` | Guest/host inbox — threads, quick replies, report/block |
| `saved.html` | Saved listings, grouped into collections |
| `list.html` | Host listing wizard (multi-step) |
| `host.html` | Host dashboard — enquiries, calendar, listings, earnings, feed comments |
| `host-profile.html` | Public host profile — verification tier, stats, listings |
| `host-concierge.html` | Casa Concierge settings (AI auto-reply, prototype) |
| `host-resources.html` | Host help/resources marketing page |
| `profile.html` | Guest/host account settings, stays, review flow |
| `signup.html` | Sign up / sign in |
| `community.html`, `how-it-works.html`, `about.html`, `press.html`, `careers.html`, `help.html`, `gift-cards.html`, `waitlist.html`, `last-minute.html`, `long-stays.html` | Marketing / info pages |
| `privacy.html`, `terms.html` | Legal (draft — needs real legal review before launch) |
| `brand.html`, `icons.html` | Internal design-system reference, not linked from site nav |

## Shared modules

**Data catalogues** (the closest thing to a database right now):
- `casa-properties.js` — the 36 seed listings + `searchCasaProperties()`, `getSimilarProperties()`
- `casa-hosts.js` — the 5 demo host profiles + `casaHostVerifiedTier()` (see `VERIFICATION-POLICY.md`)
- `casa-feed-posts.js` — feed `POSTS`/`REPLIES` + local-reply merge helpers
- `casa-region-meta.js` — region codes/labels, honest per-region listing counts
- `casa-availability.js` — per-property calendar state (booked/blocked/synced)
- `casa-images.js` — property photo resolution (Unsplash + Wikimedia, width-safe)
- `casa-home-photos.js`, `casa-info-stays.js` — homepage/marketing page photo & card rendering
- `casa-concierge.js` — Casa Concierge settings (prototype)

**Map** (`map.html`, and the browse-page mini-map):
- `casa-map-data.js`, `casa-map-geo.js`, `casa-map-live.js`, `casa-map-page.js`, `casa-browse-map.js`

**Cross-page infrastructure**:
- `casa.js` — loaded on every page. Auth stub, saved properties, follows,
  notifications, enquiries, reporting/moderation — all `localStorage`-backed
  today, each with a matching table already designed in `supabase/schema.sql`.
- `casa.css`, `casa-components.css`, `casa-info.css` — shared styles.
  `casa-pages/*.css` — page-specific styles for larger pages (browse, home,
  how-it-works, map) kept out of the page's own `<style>` block.

## Backend (in progress)

`supabase/` has the full schema (15 tables + RLS), seed data for the demo
properties/hosts, and a setup guide. Nothing is wired to a live project yet —
see `supabase/README.md` for the current step.

## Deployment

GitHub Pages, deployed via `.github/workflows/deploy-pages.yml` on every
push to `main`. The workflow runs `scripts/build-site.sh`, which copies the
public site files into `_site/` (excluding internal docs, `supabase/`,
`scripts/`, and `design-canvas.jsx`) — that's what actually gets published.
`scripts/health-check.sh` runs the same build plus basic sanity checks
(JS syntax, viewport tags, local asset links resolve).
