-- ═══════════════════════════════════════════════════════════════
-- Casa — backfill real seed-listing descriptions into Supabase (Phase 15)
--
-- NOT APPLIED YET — review before running, same status as
-- supabase/concierge.sql and supabase/homepage-preferences.sql.
--
-- THE GAP THIS CLOSES:
-- Real, distinct descriptive copy was written for all 36 seed listings
-- into casa-properties.js's local CASA_PROPERTY_DESCRIPTIONS object (see
-- that file's comment above the object) — verified live on property.html
-- at the time. But that work only ever touched the local JS fallback
-- array. It was never written into the real `properties.description`
-- column in Supabase for those same 36 rows (which supabase/seed.sql
-- inserted with no `description` value at all, per that file's own
-- insert column list — description was never a seeded field).
--
-- The practical effect: property.html still shows the real descriptions
-- correctly for a seed listing, because it only calls
-- casaRefreshProperties() (which replaces the whole CASA_PROPERTIES
-- array with live Supabase rows) for an id it *doesn't* recognise
-- locally — for ids 1–36 it never runs, so the local array's rich text
-- is what actually renders. But every OTHER page that calls
-- casaRefreshProperties() unconditionally (browse.html, index.html,
-- search.html, saved.html, profile.html, map.html, feed.html,
-- host-profile.html) overwrites those same 36 local entries with the
-- real Supabase row — whose `description` column is empty, since it was
-- never written there. Confirmed live while building homepage
-- personalization: `CASA_PROPERTIES.find(p =>
-- p.title.includes('Boathouse')).description` returns `""` immediately
-- after casaRefreshProperties() runs.
--
-- This file writes the exact same text already in casa-properties.js's
-- CASA_PROPERTY_DESCRIPTIONS object into the real `properties.description`
-- column for ids 1–36, so it survives a real Supabase read the same way
-- it already does on property.html's local-fallback path. Content is
-- copied verbatim — this is a data backfill, not new or rewritten copy.
--
-- Dollar-quoted string literals ($desc$...$desc$), not '...' — the
-- descriptions contain plain English apostrophes (Windermere's, don't,
-- there's) that would otherwise need manual '' escaping throughout;
-- dollar-quoting also allows the literal paragraph-break newlines in
-- each entry to be written directly, matching casa-properties.js's own
-- template-literal formatting exactly.
--
-- Only touches rows where description is currently null/empty, so this
-- can never clobber a real edit made through list.html in the meantime
-- — additive and idempotent, safe to re-run, consistent with every
-- other migration in this directory.
-- ═══════════════════════════════════════════════════════════════

update properties set description = v.description
from (values
  (1, $desc$A 300-year-old stone cottage on the edge of Windermere, five minutes' walk from the water and close enough to the village that you don't need the car once you've unpacked.
The wood burner is the heart of the place — lit most evenings from October through to April. Dogs are properly welcome, not just tolerated, and there's off-street parking for two cars right outside.$desc$),
  (2, $desc$A converted slate barn above Ambleside, kept deliberately spare inside so the exposed beams and the fellside view through the gable window do the talking.
The hot tub sits on a private deck facing Wetherlam, and there's a proper cedar sauna built into the old hay loft — this one's for a weekend of doing very little, on purpose.$desc$),
  (3, $desc$A timber cabin on the shore at Coniston, built for two and not pretending otherwise — one bedroom, a wood-burning stove, and a jetty you can fish or swim from.
Requested most for anniversaries and quiet escapes. The Old Man of Coniston fills the window from the bed, and the nearest neighbour is a fifteen-minute walk away.$desc$),
  (4, $desc$A tall Georgian townhouse a few streets back from Keswick's market square, with a walled garden that catches the afternoon sun and a driveway that fits two cars without any awkward manoeuvring.
Eight can sleep across four proper bedrooms, not box rooms. Derwentwater and the Theatre by the Lake are both a level ten-minute walk, no fell-walking boots required.$desc$),
  (5, $desc$A single shepherd's hut in a field above Buttermere, off-grid and off the beaten track — solar power, a wood stove, and no signal worth mentioning.
Built for two who actually want quiet: no WiFi to speak of, no passing traffic, just the fells and whatever's cooking on the two-ring stove. Bring a book you've been meaning to finish.$desc$),
  (6, $desc$A low, dark-beamed cottage on a lane in Grasmere, close enough to Dove Cottage to walk to but tucked away from the coach-tour crush of the village centre.
The wood burner draws well and heats the whole ground floor within the hour. Two proper bedrooms upstairs under the eaves — mind your head on the beam by the bathroom door.$desc$),
  (7, $desc$A converted 18th-century granary at the edge of Hawkshead, all exposed stone and old oak, with the kind of kitchen that ends up being where everyone sits.
Dogs are welcome without a supplement, and the wood burner in the sitting room keeps five people warm through a proper Lakeland downpour. Hawkshead's pubs are a flat ten-minute walk, headtorch recommended after dark.$desc$),
  (8, $desc$A big, sprawling farmhouse above Grizedale Forest, built for the kind of family gathering that needs five real bedrooms and somewhere for everyone to actually spread out.
Sleeps ten without anyone on a sofa bed. The hot tub looks straight down the valley, and the garden — walled, half an acre — is where this one earns its keep on a warm evening.$desc$),
  (9, $desc$A whitewashed cottage on the cliffs above Porthcurno, close enough to hear the sea from the bedroom and a short walk from the beach the Minack Theatre looks down on.
The wood burner takes the edge off once the sun's gone, and the view from the sitting-room window is the sort that makes people go quiet for a minute when they first walk in.$desc$),
  (10, $desc$A cedar-clad lodge outside Truro, deliberately private — long drive, no overlooking neighbours, a garden that backs onto woodland.
The hot tub is the main event here, usually booked for that reason alone. Pets are genuinely welcome (there's a stable-door and boot room built for muddy dogs), and it sleeps eight across four bedrooms without anyone feeling short-changed.$desc$),
  (11, $desc$A fisherman's cottage two minutes from Mousehole harbour, small and proper — thick walls, low doorways, a window seat that looks straight out over the boats.
Built for three, not stretched to fit more. This one's booked again and again by the same guests; ask the host and she'll tell you which table at the harbourside café to get.$desc$),
  (12, $desc$A working farmhouse outside St Agnes, still with a working farm around it, five minutes' drive from the coast path and the beach at Chapel Porth.
Dogs are welcome to run properly here — there's a fenced paddock as well as the garden. The wood burner in the snug is lit from the first cold evening in September through to Easter.$desc$),
  (13, $desc$A converted boathouse on Fowey's waterfront, built out over the water on the original pilings, with a private mooring most guests never actually use because the view alone is the point.
Two people, one proper bedroom, tide-level windows on three sides. Booked overwhelmingly for anniversaries — ask about the sunset side of the estuary if you want to know which way to face the bed.$desc$),
  (14, $desc$A single shepherd's hut on the coast path above Zennor, off-grid and close enough to hear the sea from the bed — solar-powered, wood-stove heated, no signal.
Built for two, deliberately spartan. The nearest thing to noise is the foghorn on a bad night. Zennor's one pub, the Tinners Arms, is a fifteen-minute walk along the cliff path.$desc$),
  (15, $desc$A blackhouse on the Trotternish peninsula, rebuilt from a ruin with the original stone walls and a turf-effect roof, looking straight across to the Old Man of Storr.
Off-grid, solar-powered, and properly remote — the hot tub sits outside the back door for exactly this reason. Sleeps four. Most guests come back having barely used the car once they arrive.$desc$),
  (16, $desc$A one-room bothy-style cabin at the foot of the Glencoe mountains, built simply and heated by a wood stove that's usually lit before you've finished unpacking.
Off-grid, no WiFi, and closer to the hills than anywhere else on Casa in Scotland — this is booked by walkers first and everyone else second. Three can sleep here, snugly.$desc$),
  (17, $desc$A timber lodge above Loch Ness at Drumnadrochit, with a wall of glass along the loch-facing side and a hot tub on the deck for watching the water without actually being in it.
Sleeps six across three bedrooms. Urquhart Castle is a ten-minute drive; the loch itself is close enough that the view doesn't change whether you're in the kitchen or the bath.$desc$),
  (18, $desc$A traditional croft house at Torridon, under the mountains rather than merely near them, with a wood burner that's genuinely needed most of the year here.
Dogs are welcome, and the porch is built for wet boots and wetter dogs coming off the hills. Sleeps four. This is a walkers' base first — the sofa is secondary to the boot room.$desc$),
  (19, $desc$A small cottage above Portree harbour, close enough to walk down for dinner and back up without needing the car, with the town's coloured houses visible from the front step.
Off-grid solar power keeps it self-sufficient, and the sea view from the one bedroom is the reason this one gets booked out first every summer. Built for two.$desc$),
  (20, $desc$A converted barn on the edge of Burnham Overy Staithe, a short walk from the marshes and the boardwalk out to the beach at Gun Hill.
Sleeps six. Dogs are welcome and the boot room by the back door is built for it — sandy paws and marsh mud both. The barn's original hay doors still open onto the garden.$desc$),
  (21, $desc$A brick-and-flint farmhouse a few minutes outside Wells-next-the-Sea, with a proper wood burner and a garden that catches the low Norfolk light in the evening.
Sleeps four. Close enough to walk to Wells' quay and the beach huts, far enough out that the lanes are quiet after dark — this one's booked mostly by couples wanting a slower pace.$desc$),
  (22, $desc$A single-storey cabin on the edge of the saltmarsh at Blakeney, off-grid and built low so it doesn't interrupt the view across the reedbeds to the sea.
Sleeps two. The seal-watching boats leave from Blakeney quay a short walk away, and the light out here — especially early and late in the day — is most of what people come back for.$desc$),
  (23, $desc$A genuine manor house at Brancaster, big enough for the kind of family gathering that needs six real bedrooms and a garden with somewhere for children to actually disappear into.
Sleeps twelve. The hot tub is tucked into a walled corner of the garden, and Brancaster's beach — one of the best on this coast — is a level ten-minute walk from the front door.$desc$),
  (24, $desc$A stone cottage in Goathland, the North York Moors village the steam railway runs through, with a wood burner and low beamed ceilings that mean what they say about mind your head.
Dogs are genuinely welcome. Sleeps four. The moors start at the garden gate — this is a walking base as much as a place to stay, with the railway a five-minute stroll away.$desc$),
  (25, $desc$A big stone farmhouse in Wharfedale, deep in the Yorkshire Dales, with a hot tub looking straight up the valley and a garden that runs down towards the river.
Sleeps eight across four bedrooms. Dogs are welcome without a supplement. This one's booked by walking groups and multi-generation family holidays about equally — it's built to absorb a full house comfortably.$desc$),
  (26, $desc$A fisherman's cottage on a steep lane above Whitby harbour, close enough to the abbey steps to hear the gulls properly, with a wood burner for the sea-facing evenings.
Sleeps three. The view from the top-floor bedroom takes in the harbour and the abbey ruin both — this is the one detail almost every review mentions first.$desc$),
  (27, $desc$A honey-stone cottage in Bourton-on-the-Water, a few minutes' walk from the river and the low bridges the village is known for, with a wood burner and a proper cottage garden out back.
Sleeps four. Booked heavily in summer for the village itself, but the garden — walled, quiet, roses along the fence — is what brings people back outside the busy months.$desc$),
  (28, $desc$A genuine manor house in Chipping Campden, one of the best-preserved high streets in the Cotswolds, set back from the road behind its own gates.
Sleeps fourteen across seven bedrooms — built for weddings, reunions, and the kind of family occasion that needs real space. The hot tub sits in a walled garden away from the house, and there's parking for six cars.$desc$),
  (29, $desc$A converted watermill outside Bourton-on-the-Hill, with the original mill race still running past the garden and a wood burner in what used to be the grain store.
Sleeps five. Dogs are welcome. The sound of the water is more or less constant and most guests say it's the thing they missed most once they got home.$desc$),
  (30, $desc$A whitewashed cottage on the cliffs above St Davids, Britain's smallest city, with the coast path running past the end of the garden and the sea visible from the kitchen window.
Sleeps four. The wood burner is lit most nights even in summer once the sea mist rolls in. St Davids Cathedral and the harbour at St Justinian's are both a short drive.$desc$),
  (31, $desc$A converted boathouse on Solva's inner harbour, built out over the water and reachable down a set of stone steps that catch the tide at the bottom.
Sleeps two. Solva's working harbour fills and empties with the tide right outside the window, which is either the most romantic thing about this place or the reason you should check the tide table first.$desc$),
  (32, $desc$A single geodesic dome on the coast path near Marloes Sands, off-grid and solar-powered, with a clear-panel roof section over the bed for watching the sky without leaving it.
Sleeps two. Marloes Sands, regularly rated among the best beaches in Wales, is a fifteen-minute walk. No WiFi, and deliberately so — this is one of the quietest listings on Casa.$desc$),
  (33, $desc$A stone cottage in Betws-y-Coed, the gateway village into Snowdonia, with a wood burner and a garden backing onto the woodland the village is named for.
Dogs are welcome. Sleeps four. Swallow Falls and the Conwy valley walks both start within a mile — this is booked overwhelmingly by walkers and cyclists using it as a base for the mountains proper.$desc$),
  (34, $desc$A timber cabin above Llyn Padarn at Llanberis, with Snowdon itself visible from the hot tub on the deck and the lake a two-minute walk down through the trees.
Sleeps four. The Snowdon Mountain Railway starts in the village, a genuine alternative to the walk up for anyone travelling with kids or knees that have had enough for the day.$desc$),
  (35, $desc$A stone cottage in Bushmills, a short drive from the Giant's Causeway itself and closer still to the distillery the village is named for.
Sleeps four. The wood burner and the sea view both do real work here — this coast gets proper weather off the Atlantic, and the cottage is built thick-walled for exactly that. Dogs are welcome.$desc$),
  (36, $desc$A working farmhouse near Armoy in the Antrim glens, a short drive from the Dark Hedges beech avenue, with a wood burner and a working farm still operating around it.
Sleeps six. Dogs are properly welcome — this is a real farm, not a converted one dressed up as a holiday let. Booked mostly by families wanting the Causeway coast without staying directly on it.$desc$)
) as v(id, description)
where properties.id = v.id
  and (properties.description is null or properties.description = '');
