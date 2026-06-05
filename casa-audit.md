# Casa.co.uk — Full Site Audit
_Generated May 2026_

---

## Pages Inventory

| File | Title | Status | Notes |
|---|---|---|---|
| `index.html` | Homepage | ✅ Complete | Hero, fee comparison, community preview, dual CTAs — strong |
| `browse.html` | Browse stays | 🟡 Mostly complete | 8 hardcoded property cards (Lake District only), map sidebar works, filter UI present but not wired to data |
| `feed.html` | Community feed | 🟡 Mostly complete | Cumbria-only, 6 posts hardcoded, compose box posts locally (JS), county bar is decorative only |
| `property.html` | Property listing | ✅ Complete | Stone Cottage, Windermere — full detail, calendar, reviews, booking CTA |
| `booking.html` | Enquiry/booking | ✅ Complete | Two versions exist (one older Playfair/DM Sans, one current Instrument Serif) — needs consolidating |
| `messages.html` | Inbox | ✅ Complete | 3-panel layout, thread view, property card sidebar — very well built |
| `profile.html` | User profile | ✅ Complete | Editable name, feed tab, stays tab, reviews, host properties — comprehensive |
| `host.html` | Host dashboard | ✅ Complete | KPIs, calendar, enquiries, property management — solid |
| `list.html` | List a property | ✅ Complete | Multi-step form, well structured |
| `saved.html` | Saved stays | ✅ Complete | Collections, grid of saved cards |
| `signup.html` | Sign in / Join | ✅ Complete | Split layout, role picker (host/guest) |
| `map.html` | Map view | 🟡 Partial | Uses old Playfair/DM Sans design system (not Instrument Serif), static pins, no real map tile |
| `brand.html` | Brand guide | ✅ Complete | Logos, palette, type — reference doc |
| `icons.html` | Icon set | ✅ Complete | Internal reference |
| `Main_2.html` | Alt homepage | 🔴 Orphan | Old Playfair/DM Sans version — not linked from anywhere, superseded by index.html |
| `casa.js` | Shared JS | 🟡 Partial | Good foundations: search routing, save/localStorage, feed posting, auth stub — no real data layer |
| `casa.css` | Shared stylesheet | ⚠️ Missing from project | Every Instrument Serif page references `casa.css` — exists on GitHub but not in repo files |
| `how-it-works.html` | How it works | 🔴 Missing | Linked from `browse.html` nav — 404 |

---

## Critical Issues

### 1. Design System Split (High Priority)
Two competing design systems exist across the site:

**System A — Current** (most pages): `Instrument Serif` + `Instrument Sans` + `JetBrains Mono`, warm ink/paper/brick palette, via `casa.css`

**System B — Old** (`map.html`, `booking.html` partial, `Main_2.html`): `Playfair Display` + `DM Sans`, terracotta/sand palette, all inline styles

`map.html` needs rebuilding to match System A. `booking.html` has a duplicate old version that should be removed.

### 2. `casa.css` Not in Repo
All System A pages load `<link rel="stylesheet" href="casa.css">` — this file isn't in the project folder. Everything works on GitHub Pages because the file is deployed there, but it can't be edited locally without it.

### 3. `how-it-works.html` — Dead Link (404)
`browse.html` nav links to `how-it-works.html`. It doesn't exist. **Built below.**

### 4. Browse Has No Multi-Region Data
`browse.html` shows only Lake District properties. The filter UI (region, amenities, type) and map pins are all Lake District hardcoded. No way to browse Cornwall, Skye, Norfolk, etc.

### 5. Feed is Single-County
`feed.html` defaults to Cumbria. The county-bar tabs are decorative — clicking them triggers a toast but doesn't change the feed content. A national "All UK" feed doesn't exist.

---

## What's Working Well

- **Design language** (System A) is genuinely distinctive and consistent — italic serif, warm earth palette, mono accents
- **Property page** is production-quality — calendar, breakdown, reviews, host bio
- **Messages page** is excellent — 3-panel layout rivals real products
- **Host dashboard** is comprehensive — KPIs, calendar, enquiry management
- **casa.js** has smart patterns: search routing via URL params, localStorage saves, toast system
- **Brand/icons** — proper design system documentation exists
- **Content writing** throughout is warm and on-brand

---

## Build Priority Order

| Priority | Task | Impact |
|---|---|---|
| 🔴 1 | Build `how-it-works.html` | Fixes dead link, explains product to new users |
| 🔴 2 | Rebuild `map.html` to System A | Design consistency, live map is a key feature |
| 🟠 3 | Add multi-region property data to `browse.html` | Core product — guests can only see the Lakes right now |
| 🟠 4 | Wire feed county tabs to actual content | Core social feature — feed feels broken |
| 🟡 5 | Extract/document `casa.css` into project | Developer experience, local editing |
| 🟡 6 | Remove `Main_2.html` and old `booking.html` duplicate | Housekeeping |
| 🟢 7 | Add `search.html` / dedicated search results page | UX improvement |
| 🟢 8 | Add `attraction.html` / local tips detail page | Expands social/forum dimension |
| 🟢 9 | Mobile nav (hamburger) across all pages | Not responsive yet |
| 🟢 10 | `how-it-works.html` for hosts specifically | Conversion optimisation |

---

## Feature Gaps vs. Vision

The vision is a **forum/social platform that doubles as a booking site**. Here's what's missing from that vision:

- **Hashtag pages** — `#lakedistrict` is shown everywhere but clicking it doesn't go to a dedicated hashtag feed page
- **Public host profiles** — `profile.html` is a self-view; there's no `/host/sarah` public page guests can visit
- **Attraction/local tip posts** — feed has "Local pick" post type but no dedicated attractions directory
- **Notifications** — no notification centre (new enquiry, new reply, follow, etc.)
- **Following feed** — profile has a "Following" tab concept but no dedicated feed of followed people/places
- **Search within feed** — no way to search posts, only browse by county
- **Reviews as standalone content** — reviews live on property pages but aren't surfaced in the feed or searchable

---

_Audit complete. Building `how-it-works.html` next._
