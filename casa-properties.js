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

function getCasaPropertyIdByTitle(title) {
  if (!title) return 1;
  const norm = title.toLowerCase().trim();
  const exact = CASA_PROPERTIES.find(p => p.title.toLowerCase() === norm);
  if (exact) return exact.id;
  const partial = CASA_PROPERTIES.find(p =>
    norm.includes(p.title.toLowerCase()) || p.title.toLowerCase().includes(norm)
  );
  return partial ? partial.id : 1;
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

CASA_PROPERTIES.forEach(p => {
  const centre = CASA_REGION_COORDS[p.region] || CASA_REGION_COORDS['lake-district'];
  p.lat = casaSpreadCoord(centre.lat, p.id, 0);
  p.lng = casaSpreadCoord(centre.lng, p.id, 1);
  p.cleaningFee = Math.max(35, Math.round(p.price * 0.28));
  p.instantBook = p.rating >= 4.8 && (p.badge === 'verified' || p.reviews >= 20);
  p.minNights = p.type === 'glamping' ? 2 : p.price > 300 ? 3 : 2;
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
  // Leave undefined (not []) when there are no real uploads yet — property.html's
  // `listing.photos || casaGetPropertyGallery(...)` fallback treats an empty
  // array as truthy, so an empty list would skip the stock-photo fallback.
  const photos = photoRows.length ? photoRows : undefined;
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
    photos,
    cleaningFee: row.cleaning_fee || Math.max(35, Math.round(row.price_per_night * 0.28)),
    minNights: row.min_stay || 1,
    instantBook: !!row.instant_book,
  };
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
