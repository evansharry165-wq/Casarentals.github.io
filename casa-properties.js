/** Shared property catalogue — used by browse, map, property, feed, saved */
const CASA_PROPERTIES = [
  {id:1,title:'Stone Cottage',loc:'Windermere',region:'lake-district',rLabel:'Lake District',type:'cottage',price:175,rating:4.9,reviews:23,sleeps:6,beds:3,tags:['woodburner','pets','parking'],badge:'verified',col:'#C8A882'},
  {id:2,title:'Slate Barn',loc:'Ambleside',region:'lake-district',rLabel:'Lake District',type:'barn',price:215,rating:4.8,reviews:11,sleeps:4,beds:2,tags:['hottub','sauna'],badge:'new',col:'#8DA88A'},
  {id:3,title:'Lakeside Cabin',loc:'Coniston',region:'lake-district',rLabel:'Lake District',type:'cabin',price:145,rating:5.0,reviews:34,sleeps:2,beds:1,tags:['romantic'],col:'#8A7DB0'},
  {id:4,title:'Georgian House',loc:'Keswick',region:'lake-district',rLabel:'Lake District',type:'cottage',price:240,rating:4.9,reviews:47,sleeps:8,beds:4,tags:['garden','parking'],badge:'verified',col:'#A8B4C0'},
  {id:5,title:"Shepherd's Hut",loc:'Buttermere',region:'lake-district',rLabel:'Lake District',type:'glamping',price:95,rating:4.7,reviews:8,sleeps:2,beds:1,tags:['offgrid'],col:'#7BA0B4'},
  {id:6,title:"Miller's Cottage",loc:'Grasmere',region:'lake-district',rLabel:'Lake District',type:'cottage',price:165,rating:4.8,reviews:19,sleeps:4,beds:2,tags:['woodburner'],col:'#3C3830'},
  {id:7,title:'The Granary',loc:'Hawkshead',region:'lake-district',rLabel:'Lake District',type:'farmhouse',price:195,rating:4.9,reviews:56,sleeps:5,beds:3,tags:['pets','woodburner'],badge:'editors',col:'#B05533'},
  {id:8,title:'Hillside Farmhouse',loc:'Grizedale',region:'lake-district',rLabel:'Lake District',type:'farmhouse',price:385,rating:4.6,reviews:14,sleeps:10,beds:5,tags:['hottub','garden'],col:'#C8A882'},
  {id:9,title:'Cliffside Cottage',loc:'Porthcurno',region:'cornwall',rLabel:'Cornwall',type:'cottage',price:210,rating:4.9,reviews:41,sleeps:4,beds:2,tags:['seaview','woodburner'],badge:'verified',col:'#8A7DB0'},
  {id:10,title:'Tregothnan Lodge',loc:'Truro',region:'cornwall',rLabel:'Cornwall',type:'cabin',price:320,rating:4.8,reviews:22,sleeps:8,beds:4,tags:['hottub','garden','pets'],col:'#8DA88A'},
  {id:11,title:'Harbour Cottage',loc:'Mousehole',region:'cornwall',rLabel:'Cornwall',type:'cottage',price:155,rating:4.9,reviews:63,sleeps:3,beds:2,tags:['seaview'],badge:'editors',col:'#7BA0B4'},
  {id:12,title:'St Agnes Farmhouse',loc:'St Agnes',region:'cornwall',rLabel:'Cornwall',type:'farmhouse',price:185,rating:4.7,reviews:18,sleeps:6,beds:3,tags:['woodburner','pets'],col:'#C8A882'},
  {id:13,title:'The Boathouse',loc:'Fowey',region:'cornwall',rLabel:'Cornwall',type:'houseboat',price:175,rating:5.0,reviews:29,sleeps:2,beds:1,tags:['seaview','romantic'],badge:'verified',col:'#A8B4C0'},
  {id:14,title:'Mizen Shepherd Hut',loc:'Zennor',region:'cornwall',rLabel:'Cornwall',type:'glamping',price:115,rating:4.8,reviews:12,sleeps:2,beds:1,tags:['offgrid','seaview'],col:'#8A7DB0'},
  {id:15,title:'Restored Blackhouse',loc:'Trotternish',region:'highlands',rLabel:'Isle of Skye',type:'cottage',price:195,rating:4.9,reviews:31,sleeps:4,beds:2,tags:['offgrid','hottub','seaview'],badge:'verified',col:'#7BA0B4'},
  {id:16,title:'Glen Coe Bothy',loc:'Glencoe',region:'highlands',rLabel:'Highlands',type:'cabin',price:130,rating:4.7,reviews:15,sleeps:3,beds:2,tags:['woodburner','offgrid'],col:'#A8B4C0'},
  {id:17,title:'Loch Ness Lodge',loc:'Drumnadrochit',region:'highlands',rLabel:'Highlands',type:'cabin',price:280,rating:4.8,reviews:44,sleeps:6,beds:3,tags:['seaview','hottub'],col:'#8DA88A'},
  {id:18,title:'Croft House',loc:'Torridon',region:'highlands',rLabel:'Highlands',type:'farmhouse',price:165,rating:4.9,reviews:27,sleeps:4,beds:2,tags:['woodburner','pets'],badge:'verified',col:'#C8A882'},
  {id:19,title:'Isle of Skye Hideaway',loc:'Portree',region:'skye',rLabel:'Isle of Skye',type:'cottage',price:220,rating:5.0,reviews:38,sleeps:2,beds:1,tags:['seaview','offgrid'],badge:'editors',col:'#8A7DB0'},
  {id:20,title:'Burnham Overy Barn',loc:'Burnham Overy',region:'norfolk',rLabel:'Norfolk',type:'barn',price:195,rating:4.8,reviews:33,sleeps:6,beds:3,tags:['seaview','pets'],badge:'verified',col:'#C8A882'},
  {id:21,title:'The Granary',loc:'Wells-next-the-Sea',region:'norfolk',rLabel:'Norfolk',type:'farmhouse',price:145,rating:4.7,reviews:21,sleeps:4,beds:2,tags:['woodburner','garden'],col:'#8DA88A'},
  {id:22,title:'Saltmarsh Cabin',loc:'Blakeney',region:'norfolk',rLabel:'Norfolk',type:'cabin',price:110,rating:4.6,reviews:9,sleeps:2,beds:1,tags:['seaview','offgrid'],col:'#7BA0B4'},
  {id:23,title:'Brancaster Hall',loc:'Brancaster',region:'norfolk',rLabel:'Norfolk',type:'manor',price:450,rating:4.9,reviews:17,sleeps:12,beds:6,tags:['garden','hottub'],badge:'editors',col:'#3C3830'},
  {id:24,title:'Moorland Cottage',loc:'Goathland',region:'yorkshire',rLabel:'N. Yorkshire',type:'cottage',price:160,rating:4.8,reviews:28,sleeps:4,beds:2,tags:['woodburner','pets'],badge:'verified',col:'#C8A882'},
  {id:25,title:'Dales Farmhouse',loc:'Wharfedale',region:'yorkshire',rLabel:'Yorkshire Dales',type:'farmhouse',price:225,rating:4.9,reviews:52,sleeps:8,beds:4,tags:['hottub','garden','pets'],badge:'editors',col:'#8A7DB0'},
  {id:26,title:'The Old Forge',loc:'Whitby',region:'yorkshire',rLabel:'N. Yorkshire',type:'cottage',price:135,rating:4.7,reviews:14,sleeps:3,beds:2,tags:['seaview','woodburner'],col:'#A8B4C0'},
  {id:27,title:'Honeysuckle Cottage',loc:'Bourton-on-the-Water',region:'cotswolds',rLabel:'Cotswolds',type:'cottage',price:195,rating:4.9,reviews:44,sleeps:4,beds:2,tags:['woodburner','garden'],badge:'verified',col:'#C8A882'},
  {id:28,title:'Chipping Manor',loc:'Chipping Campden',region:'cotswolds',rLabel:'Cotswolds',type:'manor',price:550,rating:5.0,reviews:19,sleeps:14,beds:7,tags:['garden','hottub'],badge:'editors',col:'#8DA88A'},
  {id:29,title:'The Old Mill',loc:'Bourton-on-the-Hill',region:'cotswolds',rLabel:'Cotswolds',type:'farmhouse',price:175,rating:4.8,reviews:31,sleeps:5,beds:3,tags:['woodburner','pets'],col:'#8A7DB0'},
  {id:30,title:'Pembroke Cliffside',loc:'St Davids',region:'pembrokeshire',rLabel:'Pembrokeshire',type:'cottage',price:175,rating:4.9,reviews:36,sleeps:4,beds:2,tags:['seaview','woodburner'],badge:'verified',col:'#7BA0B4'},
  {id:31,title:'The Boathouse',loc:'Solva',region:'pembrokeshire',rLabel:'Pembrokeshire',type:'houseboat',price:155,rating:4.8,reviews:18,sleeps:2,beds:1,tags:['seaview','romantic'],col:'#8A7DB0'},
  {id:32,title:'Coast Path Glamping',loc:'Marloes',region:'pembrokeshire',rLabel:'Pembrokeshire',type:'glamping',price:90,rating:4.7,reviews:11,sleeps:2,beds:1,tags:['seaview','offgrid'],col:'#8DA88A'},
  {id:33,title:'Hafod Cottage',loc:'Betws-y-Coed',region:'snowdonia',rLabel:'Snowdonia',type:'cottage',price:145,rating:4.8,reviews:24,sleeps:4,beds:2,tags:['woodburner','pets'],badge:'verified',col:'#C8A882'},
  {id:34,title:'Llyn Padarn Cabin',loc:'Llanberis',region:'snowdonia',rLabel:'Snowdonia',type:'cabin',price:185,rating:4.9,reviews:39,sleeps:4,beds:2,tags:['seaview','hottub'],badge:'editors',col:'#7BA0B4'},
  {id:35,title:"Giant's Causeway Cottage",loc:'Bushmills',region:'causeway',rLabel:'Causeway Coast',type:'cottage',price:165,rating:4.9,reviews:22,sleeps:4,beds:2,tags:['seaview','woodburner'],badge:'verified',col:'#A8B4C0'},
  {id:36,title:'Dark Hedges Farmhouse',loc:'Armoy',region:'causeway',rLabel:'Antrim',type:'farmhouse',price:190,rating:4.8,reviews:15,sleeps:6,beds:3,tags:['woodburner','pets'],col:'#C8A882'},
];

function getCasaProperty(id) {
  const num = parseInt(id, 10);
  return CASA_PROPERTIES.find(p => p.id === num) || CASA_PROPERTIES[0];
}

// Shared amenity key -> label/icon lookup. Keys match both the seed
// data's `tags` arrays and list.html's am-pill data-am values, so a
// real host's chosen amenities render the same way as seed listings.
const CASA_AMENITY_META = {
  woodburner: { label: 'Wood burner & open fire', icon: '<path d="M12 22c-4 0-7-3-7-7 0-3 2-5 4-7 0 3 2 4 3 2 1-3-1-5 2-8 0 4 3 5 4 9 1 4-2 11-6 11z"/>' },
  wifi:       { label: 'Fast WiFi', icon: '<path d="M2 9a15 15 0 0 1 20 0"/><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1"/>' },
  pets:       { label: 'Pets welcome', icon: '<circle cx="6" cy="9" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><path d="M8 18c0-3 2-5 4-5s4 2 4 5c0 2-2 3-4 3s-4-1-4-3z"/>' },
  parking:    { label: 'Off-street parking', icon: '<path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>' },
  hottub:     { label: 'Hot tub', icon: '<path d="M4 12V8a4 4 0 0 1 8 0v4"/><path d="M2 16h20"/><path d="M4 18h16l-1 4H5z"/>' },
  garden:     { label: 'Garden', icon: '<path d="M5 9a7 7 0 0 1 14 0v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/>' },
  ev:         { label: 'EV charging', icon: '<path d="M7 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/><path d="M9 17l3 3 3-3"/>' },
  offgrid:    { label: 'Off-grid / solar', icon: '<path d="M12 3 6 12h3v3h6v-3h3z"/><path d="M12 15v6"/>' },
  accessible: { label: 'Wheelchair access', icon: '<circle cx="12" cy="5" r="2"/><path d="M5 22l3.5-7H8a4 4 0 0 1-4-4h14a4 4 0 0 1-4 4h-.5L17 22"/>' },
  tv:         { label: 'Smart TV', icon: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>' },
  seaview:    { label: 'Sea view', icon: '<path d="M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>' },
  sauna:      { label: 'Sauna', icon: '<path d="M4 21V9l8-6 8 6v12"/><path d="M9 21v-6h6v6"/>' },
  romantic:   { label: 'Romantic setup', icon: '<path d="M12 20s-7-4.5-9.5-9c-1.5-2.8.4-6 3.5-6 1.8 0 3.2 1 4 2.5C10.8 6 12.2 5 14 5c3.1 0 5 3.2 3.5 6C15 15.5 12 20 12 20z"/>' },
};
function casaAmenityMeta(tag) {
  return CASA_AMENITY_META[tag] || { label: tag.charAt(0).toUpperCase() + tag.slice(1), icon: '<circle cx="12" cy="12" r="3"/>' };
}

function casaPropertyUrl(id) {
  return `property.html?id=${id}`;
}

const CASA_TYPE_LABELS = {
  cottage: 'Cottage', barn: 'Barn', cabin: 'Cabin', glamping: 'Glamping',
  farmhouse: 'Farmhouse', houseboat: 'Houseboat', manor: 'Manor',
};

/** Region centres for map pins (lat, lng) */
const CASA_REGION_COORDS = {
  'lake-district': { lat: 54.45, lng: -3.0 },
  cornwall: { lat: 50.25, lng: -5.1 },
  highlands: { lat: 57.3, lng: -4.5 },
  skye: { lat: 57.3, lng: -6.2 },
  norfolk: { lat: 52.8, lng: 0.9 },
  yorkshire: { lat: 54.2, lng: -1.8 },
  cotswolds: { lat: 51.9, lng: -1.7 },
  pembrokeshire: { lat: 51.8, lng: -5.0 },
  snowdonia: { lat: 53.0, lng: -4.0 },
  causeway: { lat: 55.2, lng: -6.5 },
};

function casaSpreadCoord(base, id, axis) {
  const spread = ((id * 17 + axis * 31) % 100) / 100 - 0.5;
  return base + spread * (axis === 0 ? 0.35 : 0.55);
}

// Real, distinct copy per seed listing — replaces the auto-generated
// "A {type} in {loc}, {rLabel}. Sleeps N... Featuring {tags}." fallback
// that used to render identically-structured text for all 36 (still used
// for any real host listing that hasn't written a description yet — see
// applyListingToPage() in property.html). Two paragraphs each: a hook
// grounded in the actual place, then specifics pulled from the listing's
// real type/tags rather than reworded templates.
const CASA_PROPERTY_DESCRIPTIONS = {
  1: `A 300-year-old stone cottage on the edge of Windermere, five minutes' walk from the water and close enough to the village that you don't need the car once you've unpacked.
The wood burner is the heart of the place — lit most evenings from October through to April. Dogs are properly welcome, not just tolerated, and there's off-street parking for two cars right outside.`,
  2: `A converted slate barn above Ambleside, kept deliberately spare inside so the exposed beams and the fellside view through the gable window do the talking.
The hot tub sits on a private deck facing Wetherlam, and there's a proper cedar sauna built into the old hay loft — this one's for a weekend of doing very little, on purpose.`,
  3: `A timber cabin on the shore at Coniston, built for two and not pretending otherwise — one bedroom, a wood-burning stove, and a jetty you can fish or swim from.
Requested most for anniversaries and quiet escapes. The Old Man of Coniston fills the window from the bed, and the nearest neighbour is a fifteen-minute walk away.`,
  4: `A tall Georgian townhouse a few streets back from Keswick's market square, with a walled garden that catches the afternoon sun and a driveway that fits two cars without any awkward manoeuvring.
Eight can sleep across four proper bedrooms, not box rooms. Derwentwater and the Theatre by the Lake are both a level ten-minute walk, no fell-walking boots required.`,
  5: `A single shepherd's hut in a field above Buttermere, off-grid and off the beaten track — solar power, a wood stove, and no signal worth mentioning.
Built for two who actually want quiet: no WiFi to speak of, no passing traffic, just the fells and whatever's cooking on the two-ring stove. Bring a book you've been meaning to finish.`,
  6: `A low, dark-beamed cottage on a lane in Grasmere, close enough to Dove Cottage to walk to but tucked away from the coach-tour crush of the village centre.
The wood burner draws well and heats the whole ground floor within the hour. Two proper bedrooms upstairs under the eaves — mind your head on the beam by the bathroom door.`,
  7: `A converted 18th-century granary at the edge of Hawkshead, all exposed stone and old oak, with the kind of kitchen that ends up being where everyone sits.
Dogs are welcome without a supplement, and the wood burner in the sitting room keeps five people warm through a proper Lakeland downpour. Hawkshead's pubs are a flat ten-minute walk, headtorch recommended after dark.`,
  8: `A big, sprawling farmhouse above Grizedale Forest, built for the kind of family gathering that needs five real bedrooms and somewhere for everyone to actually spread out.
Sleeps ten without anyone on a sofa bed. The hot tub looks straight down the valley, and the garden — walled, half an acre — is where this one earns its keep on a warm evening.`,
  9: `A whitewashed cottage on the cliffs above Porthcurno, close enough to hear the sea from the bedroom and a short walk from the beach the Minack Theatre looks down on.
The wood burner takes the edge off once the sun's gone, and the view from the sitting-room window is the sort that makes people go quiet for a minute when they first walk in.`,
  10: `A cedar-clad lodge outside Truro, deliberately private — long drive, no overlooking neighbours, a garden that backs onto woodland.
The hot tub is the main event here, usually booked for that reason alone. Pets are genuinely welcome (there's a stable-door and boot room built for muddy dogs), and it sleeps eight across four bedrooms without anyone feeling short-changed.`,
  11: `A fisherman's cottage two minutes from Mousehole harbour, small and proper — thick walls, low doorways, a window seat that looks straight out over the boats.
Built for three, not stretched to fit more. This one's booked again and again by the same guests; ask the host and she'll tell you which table at the harbourside café to get.`,
  12: `A working farmhouse outside St Agnes, still with a working farm around it, five minutes' drive from the coast path and the beach at Chapel Porth.
Dogs are welcome to run properly here — there's a fenced paddock as well as the garden. The wood burner in the snug is lit from the first cold evening in September through to Easter.`,
  13: `A converted boathouse on Fowey's waterfront, built out over the water on the original pilings, with a private mooring most guests never actually use because the view alone is the point.
Two people, one proper bedroom, tide-level windows on three sides. Booked overwhelmingly for anniversaries — ask about the sunset side of the estuary if you want to know which way to face the bed.`,
  14: `A single shepherd's hut on the coast path above Zennor, off-grid and close enough to hear the sea from the bed — solar-powered, wood-stove heated, no signal.
Built for two, deliberately spartan. The nearest thing to noise is the foghorn on a bad night. Zennor's one pub, the Tinners Arms, is a fifteen-minute walk along the cliff path.`,
  15: `A blackhouse on the Trotternish peninsula, rebuilt from a ruin with the original stone walls and a turf-effect roof, looking straight across to the Old Man of Storr.
Off-grid, solar-powered, and properly remote — the hot tub sits outside the back door for exactly this reason. Sleeps four. Most guests come back having barely used the car once they arrive.`,
  16: `A one-room bothy-style cabin at the foot of the Glencoe mountains, built simply and heated by a wood stove that's usually lit before you've finished unpacking.
Off-grid, no WiFi, and closer to the hills than anywhere else on Casa in Scotland — this is booked by walkers first and everyone else second. Three can sleep here, snugly.`,
  17: `A timber lodge above Loch Ness at Drumnadrochit, with a wall of glass along the loch-facing side and a hot tub on the deck for watching the water without actually being in it.
Sleeps six across three bedrooms. Urquhart Castle is a ten-minute drive; the loch itself is close enough that the view doesn't change whether you're in the kitchen or the bath.`,
  18: `A traditional croft house at Torridon, under the mountains rather than merely near them, with a wood burner that's genuinely needed most of the year here.
Dogs are welcome, and the porch is built for wet boots and wetter dogs coming off the hills. Sleeps four. This is a walkers' base first — the sofa is secondary to the boot room.`,
  19: `A small cottage above Portree harbour, close enough to walk down for dinner and back up without needing the car, with the town's coloured houses visible from the front step.
Off-grid solar power keeps it self-sufficient, and the sea view from the one bedroom is the reason this one gets booked out first every summer. Built for two.`,
  20: `A converted barn on the edge of Burnham Overy Staithe, a short walk from the marshes and the boardwalk out to the beach at Gun Hill.
Sleeps six. Dogs are welcome and the boot room by the back door is built for it — sandy paws and marsh mud both. The barn's original hay doors still open onto the garden.`,
  21: `A brick-and-flint farmhouse a few minutes outside Wells-next-the-Sea, with a proper wood burner and a garden that catches the low Norfolk light in the evening.
Sleeps four. Close enough to walk to Wells' quay and the beach huts, far enough out that the lanes are quiet after dark — this one's booked mostly by couples wanting a slower pace.`,
  22: `A single-storey cabin on the edge of the saltmarsh at Blakeney, off-grid and built low so it doesn't interrupt the view across the reedbeds to the sea.
Sleeps two. The seal-watching boats leave from Blakeney quay a short walk away, and the light out here — especially early and late in the day — is most of what people come back for.`,
  23: `A genuine manor house at Brancaster, big enough for the kind of family gathering that needs six real bedrooms and a garden with somewhere for children to actually disappear into.
Sleeps twelve. The hot tub is tucked into a walled corner of the garden, and Brancaster's beach — one of the best on this coast — is a level ten-minute walk from the front door.`,
  24: `A stone cottage in Goathland, the North York Moors village the steam railway runs through, with a wood burner and low beamed ceilings that mean what they say about mind your head.
Dogs are genuinely welcome. Sleeps four. The moors start at the garden gate — this is a walking base as much as a place to stay, with the railway a five-minute stroll away.`,
  25: `A big stone farmhouse in Wharfedale, deep in the Yorkshire Dales, with a hot tub looking straight up the valley and a garden that runs down towards the river.
Sleeps eight across four bedrooms. Dogs are welcome without a supplement. This one's booked by walking groups and multi-generation family holidays about equally — it's built to absorb a full house comfortably.`,
  26: `A fisherman's cottage on a steep lane above Whitby harbour, close enough to the abbey steps to hear the gulls properly, with a wood burner for the sea-facing evenings.
Sleeps three. The view from the top-floor bedroom takes in the harbour and the abbey ruin both — this is the one detail almost every review mentions first.`,
  27: `A honey-stone cottage in Bourton-on-the-Water, a few minutes' walk from the river and the low bridges the village is known for, with a wood burner and a proper cottage garden out back.
Sleeps four. Booked heavily in summer for the village itself, but the garden — walled, quiet, roses along the fence — is what brings people back outside the busy months.`,
  28: `A genuine manor house in Chipping Campden, one of the best-preserved high streets in the Cotswolds, set back from the road behind its own gates.
Sleeps fourteen across seven bedrooms — built for weddings, reunions, and the kind of family occasion that needs real space. The hot tub sits in a walled garden away from the house, and there's parking for six cars.`,
  29: `A converted watermill outside Bourton-on-the-Hill, with the original mill race still running past the garden and a wood burner in what used to be the grain store.
Sleeps five. Dogs are welcome. The sound of the water is more or less constant and most guests say it's the thing they missed most once they got home.`,
  30: `A whitewashed cottage on the cliffs above St Davids, Britain's smallest city, with the coast path running past the end of the garden and the sea visible from the kitchen window.
Sleeps four. The wood burner is lit most nights even in summer once the sea mist rolls in. St Davids Cathedral and the harbour at St Justinian's are both a short drive.`,
  31: `A converted boathouse on Solva's inner harbour, built out over the water and reachable down a set of stone steps that catch the tide at the bottom.
Sleeps two. Solva's working harbour fills and empties with the tide right outside the window, which is either the most romantic thing about this place or the reason you should check the tide table first.`,
  32: `A single geodesic dome on the coast path near Marloes Sands, off-grid and solar-powered, with a clear-panel roof section over the bed for watching the sky without leaving it.
Sleeps two. Marloes Sands, regularly rated among the best beaches in Wales, is a fifteen-minute walk. No WiFi, and deliberately so — this is one of the quietest listings on Casa.`,
  33: `A stone cottage in Betws-y-Coed, the gateway village into Snowdonia, with a wood burner and a garden backing onto the woodland the village is named for.
Dogs are welcome. Sleeps four. Swallow Falls and the Conwy valley walks both start within a mile — this is booked overwhelmingly by walkers and cyclists using it as a base for the mountains proper.`,
  34: `A timber cabin above Llyn Padarn at Llanberis, with Snowdon itself visible from the hot tub on the deck and the lake a two-minute walk down through the trees.
Sleeps four. The Snowdon Mountain Railway starts in the village, a genuine alternative to the walk up for anyone travelling with kids or knees that have had enough for the day.`,
  35: `A stone cottage in Bushmills, a short drive from the Giant's Causeway itself and closer still to the distillery the village is named for.
Sleeps four. The wood burner and the sea view both do real work here — this coast gets proper weather off the Atlantic, and the cottage is built thick-walled for exactly that. Dogs are welcome.`,
  36: `A working farmhouse near Armoy in the Antrim glens, a short drive from the Dark Hedges beech avenue, with a wood burner and a working farm still operating around it.
Sleeps six. Dogs are properly welcome — this is a real farm, not a converted one dressed up as a holiday let. Booked mostly by families wanting the Causeway coast without staying directly on it.`,
};

CASA_PROPERTIES.forEach(p => {
  const centre = CASA_REGION_COORDS[p.region] || CASA_REGION_COORDS['lake-district'];
  p.lat = casaSpreadCoord(centre.lat, p.id, 0);
  p.lng = casaSpreadCoord(centre.lng, p.id, 1);
  p.cleaningFee = Math.max(35, Math.round(p.price * 0.28));
  p.instantBook = p.rating >= 4.8 && (p.badge === 'verified' || p.reviews >= 20);
  p.minNights = p.type === 'glamping' ? 2 : p.price > 300 ? 3 : 2;
  p.cancellationPolicy = 'Free cancellation up to 7 days before check-in.';
  p.description = CASA_PROPERTY_DESCRIPTIONS[p.id] || '';
});

function casaCalcStayTotal(property, nights, opts = {}) {
  const n = Math.max(1, nights || 1);
  const stay = property.price * n;
  const cleaning = opts.skipCleaning ? 0 : (property.cleaningFee || Math.max(35, Math.round(property.price * 0.28)));
  const serviceFee = 0;
  return { nights: n, stay, cleaning, serviceFee, total: stay + cleaning + serviceFee };
}

function casaAirbnbEquivalent(total) {
  return Math.round(total * 0.147);
}

function getSimilarProperties(id, limit = 4) {
  const current = getCasaProperty(id);
  return CASA_PROPERTIES
    .filter(p => p.id !== current.id && (p.region === current.region || p.type === current.type))
    .sort((a, b) => Math.abs(a.price - current.price) - Math.abs(b.price - current.price))
    .slice(0, limit);
}

function searchCasaProperties(query) {
  const q = (query || '').toLowerCase().replace(/^#/, '');
  if (!q) return CASA_PROPERTIES.slice();
  return CASA_PROPERTIES.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.loc.toLowerCase().includes(q) ||
    p.region.includes(q) ||
    p.rLabel.toLowerCase().includes(q) ||
    p.tags.some(t => t.includes(q))
  );
}

/* ─── Live Supabase data (Phase 06c) ───
   CASA_PROPERTIES started as 36 hardcoded seed listings, but those same
   36 rows are also real rows in Supabase now (see supabase/seed.sql) —
   and any listing published via list.html only exists in Supabase, not
   here. Every page that lists/searches properties (browse, map,
   host-profile) reads the CASA_PROPERTIES global via closures
   (searchCasaProperties, getCasaProperty, etc.), so rather than
   threading async data through every one of those functions, this
   refreshes CASA_PROPERTIES' *contents* in place from Supabase — same
   reference, so every existing call site starts seeing real listings
   (seed + newly published) the moment this resolves, with zero other
   changes needed. Callers should re-render after awaiting this. */
const CASA_COLOR_PALETTE = ['#C8A882', '#8DA88A', '#8A7DB0', '#A8B4C0', '#7BA0B4', '#3C3830', '#B05533'];
function casaColorForId(id) {
  return CASA_COLOR_PALETTE[Number(id) % CASA_COLOR_PALETTE.length];
}

function casaMapSupabaseRow(row) {
  const reviews = row.reviews || [];
  const reviewCount = reviews.length;
  const rating = reviewCount ? Math.round((reviews.reduce((s, r) => s + r.stars, 0) / reviewCount) * 10) / 10 : 0;
  const host = row.profiles || {};
  const badge = (host.email_verified && host.phone_verified && host.gov_id_verified) ? 'verified' : undefined;
  const photoRows = (row.property_photos || [])
    .slice()
    .sort((a, b) => (b.is_cover - a.is_cover) || (a.sort_order - b.sort_order))
    .map(ph => ph.url);
  const p = {
    id: row.id,
    hostId: row.host_id,
    title: row.title,
    description: row.description || '',
    houseRules: row.house_rules || '',
    loc: row.town,
    region: row.region,
    rLabel: row.region_label,
    type: row.type,
    price: row.price_per_night,
    rating, reviews: reviewCount,
    sleeps: row.sleeps,
    beds: row.bedrooms,
    tags: row.amenities || [],
    badge,
    col: casaColorForId(row.id),
    cleaningFee: row.cleaning_fee || Math.max(35, Math.round(row.price_per_night * 0.28)),
    minNights: row.min_stay || 1,
    cancellationPolicy: row.cancellation_policy || 'Free cancellation up to 7 days before check-in.',
    instantBook: !!row.instant_book,
  };
  // Real host-uploaded photos take priority. Falling back to the curated
  // real-photo library (casa-images.js) rather than leaving `photos`
  // empty — every page that renders a card/gallery checks `p.photos`
  // first, so fixing it once here means every one of them gets real
  // photos instead of a colour placeholder, without touching each page.
  p.photos = photoRows.length ? photoRows
    : (typeof casaGetPropertyGallery === 'function' ? casaGetPropertyGallery(p, 5) : undefined);
  p.img = photoRows[0] || (typeof casaGetPropertyPhoto === 'function' ? casaGetPropertyPhoto(p, 1200) : undefined);
  const centre = CASA_REGION_COORDS[p.region] || CASA_REGION_COORDS['lake-district'];
  p.lat = casaSpreadCoord(centre.lat, p.id, 0);
  p.lng = casaSpreadCoord(centre.lng, p.id, 1);
  return p;
}

async function casaRefreshProperties() {
  if (!window.casaSupabase) return CASA_PROPERTIES;
  const { data, error } = await window.casaSupabase
    .from('properties')
    .select('*, reviews(stars), profiles!properties_host_id_fkey(email_verified, phone_verified, gov_id_verified, background_check), property_photos(url, sort_order, is_cover)')
    .eq('published', true);
  if (error || !data) {
    console.error('casaRefreshProperties failed', error);
    return CASA_PROPERTIES;
  }
  const mapped = data.map(casaMapSupabaseRow).sort((a, b) => a.id - b.id);
  CASA_PROPERTIES.length = 0;
  CASA_PROPERTIES.push(...mapped);
  return CASA_PROPERTIES;
}
window.casaRefreshProperties = casaRefreshProperties;
