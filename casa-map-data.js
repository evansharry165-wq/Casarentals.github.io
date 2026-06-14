/**
 * Casa map — regions, bounds, feed activity, county tree
 * Used by map.html (Leaflet UK explorer)
 */

/** UK overview — full country visible, street-map style */
const CASA_MAP_COUNTRY_VIEW = { center: [54.55, -3.8], zoom: 6 };
const CASA_MAP_UK_BOUNDS = [[49.5, -8.85], [60.95, 2.15]];

/** Map region id aligns with casa-properties `region` field */
const CASA_MAP_REGIONS = {
  'lake-district': {
    id: 'lake-district',
    label: 'Lake District',
    italic: 'Lake District',
    country: 'england',
    county: 'Cumbria',
    emoji: '🏔️',
    bounds: [[54.08, -3.45], [54.72, -2.42]],
    polygon: [
      [54.62, -3.35], [54.68, -2.85], [54.55, -2.45], [54.35, -2.55],
      [54.22, -2.95], [54.28, -3.42], [54.48, -3.48],
    ],
    feedCounty: 'cumbria',
    browseUrl: 'browse.html?region=lake-district',
    feedUrl: 'feed.html?county=cumbria',
    blurb: 'Fells, lakes, and direct-booking cottages across Cumbria.',
    activity: "Sarah R. posted a last-minute opening at Stone Cottage. Hannah F.'s Coniston walk tip has 128 likes.",
  },
  cornwall: {
    id: 'cornwall', label: 'Cornwall', italic: 'Cornwall', country: 'england', county: 'Cornwall', emoji: '🌊',
    bounds: [[49.95, -5.75], [50.55, -4.15]],
    polygon: [[50.52, -5.7], [50.48, -4.2], [50.05, -4.15], [49.98, -5.5], [50.25, -5.75]],
    feedCounty: 'cornwall',
    browseUrl: 'browse.html?region=cornwall',
    feedUrl: 'feed.html?county=cornwall',
    blurb: 'Two coastlines, harbour villages, and fee-free bookings.',
    activity: 'Rachel B. has a last-minute week at Harbour Cottage, Mousehole.',
  },
  norfolk: {
    id: 'norfolk', label: 'Norfolk', italic: 'Norfolk', country: 'england', county: 'Norfolk', emoji: '🌾',
    bounds: [[52.45, 0.15], [53.05, 1.35]],
    polygon: [[52.98, 0.2], [52.95, 1.3], [52.55, 1.25], [52.48, 0.85], [52.55, 0.25]],
    feedCounty: 'norfolk',
    browseUrl: 'browse.html?region=norfolk',
    feedUrl: 'feed.html?county=norfolk',
    blurb: 'Salt marshes, big skies, and Wells-next-the-Sea.',
    activity: "Bridget H. has September wide open at Burnham Overy Barn.",
  },
  yorkshire: {
    id: 'yorkshire', label: 'Yorkshire', italic: 'Yorkshire', country: 'england', county: 'Yorkshire', emoji: '🐑',
    bounds: [[53.65, -2.65], [54.55, -0.35]],
    polygon: [[54.45, -2.5], [54.35, -0.5], [53.85, -0.4], [53.7, -1.2], [53.75, -2.4], [54.1, -2.65]],
    feedCounty: 'yorkshire',
    browseUrl: 'browse.html?region=yorkshire',
    feedUrl: 'feed.html?county=yorkshire',
    blurb: 'Dales, moors, and the Whitby coast.',
    activity: 'Graham & Kate posted from Wharfedale — 56 likes this morning.',
  },
  cotswolds: {
    id: 'cotswolds', label: 'Cotswolds', italic: 'Cotswolds', country: 'england', county: 'Gloucestershire', emoji: '🌿',
    bounds: [[51.65, -2.25], [52.15, -1.35]],
    polygon: [[52.1, -2.2], [52.05, -1.4], [51.75, -1.45], [51.68, -1.95], [51.85, -2.22]],
    feedCounty: 'cotswolds',
    browseUrl: 'browse.html?region=cotswolds',
    feedUrl: 'feed.html?county=cotswolds',
    blurb: 'Honey stone villages and manor houses.',
    activity: 'Honeysuckle Cottage and Chipping Manor have summer availability.',
  },
  highlands: {
    id: 'highlands', label: 'Scottish Highlands', italic: 'Highlands', country: 'scotland', county: 'Highlands', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    bounds: [[56.75, -6.2], [58.2, -3.8]],
    polygon: [[57.95, -6.1], [57.8, -4.0], [57.2, -3.9], [56.85, -4.8], [56.9, -5.8], [57.5, -6.15]],
    feedCounty: 'highlands',
    browseUrl: 'browse.html?region=highlands',
    feedUrl: 'feed.html?county=highlands',
    blurb: 'Glens, lochs, bothies, and lodges.',
    activity: "Callum D. has two weeks free at Glen Coe Bothy in August.",
  },
  skye: {
    id: 'skye', label: 'Isle of Skye', italic: 'Isle of Skye', country: 'scotland', county: 'Skye', emoji: '⛵',
    bounds: [[57.05, -6.85], [57.75, -5.55]],
    polygon: [[57.65, -6.75], [57.55, -5.65], [57.15, -5.75], [57.05, -6.5], [57.35, -6.82]],
    feedCounty: 'highlands',
    browseUrl: 'browse.html?region=skye',
    feedUrl: 'feed.html?county=highlands',
    blurb: 'Trotternish, Portree, and off-grid hideaways.',
    activity: "Fiona M.'s Storr sunrise post is the most liked this week.",
  },
  snowdonia: {
    id: 'snowdonia', label: 'Snowdonia', italic: 'Snowdonia', country: 'wales', county: 'Gwynedd', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    bounds: [[52.75, -4.35], [53.25, -3.55]],
    polygon: [[53.18, -4.28], [53.15, -3.6], [52.85, -3.65], [52.78, -4.15], [53.0, -4.32]],
    feedCounty: 'snowdonia',
    browseUrl: 'browse.html?region=snowdonia',
    feedUrl: 'feed.html?county=snowdonia',
    blurb: 'Y Wyddfa, lakes, and Welsh farmhouses.',
    activity: 'Llyn Padarn Cabin has late July availability.',
  },
  pembrokeshire: {
    id: 'pembrokeshire', label: 'Pembrokeshire', italic: 'Pembrokeshire', country: 'wales', county: 'Pembrokeshire', emoji: '🌊',
    bounds: [[51.55, -5.35], [52.05, -4.45]],
    polygon: [[51.98, -5.3], [51.95, -4.5], [51.65, -4.55], [51.58, -5.1], [51.78, -5.32]],
    feedCounty: 'pembrokeshire',
    browseUrl: 'browse.html?region=pembrokeshire',
    feedUrl: 'feed.html?county=pembrokeshire',
    blurb: 'Coast path, St Davids, and cliffside cottages.',
    activity: 'Pembroke Cliffside just dropped September pricing.',
  },
  causeway: {
    id: 'causeway', label: 'Causeway Coast', italic: 'Causeway Coast', country: 'ni', county: 'Antrim', emoji: '🇬🇧',
    bounds: [[54.75, -6.75], [55.35, -5.85]],
    polygon: [[55.25, -6.7], [55.2, -6.0], [54.85, -5.95], [54.78, -6.45], [55.05, -6.72]],
    feedCounty: 'causeway',
    browseUrl: 'browse.html?region=causeway',
    feedUrl: 'feed.html?county=causeway',
    blurb: "Giant's Causeway, Bushmills, and the Dark Hedges.",
    activity: "Fiona's sunrise tip at the Causeway is trending.",
  },
};

const CASA_MAP_TREE = [
  {
    id: 'england', label: 'England', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    regions: ['lake-district', 'cornwall', 'norfolk', 'yorkshire', 'cotswolds'],
  },
  {
    id: 'scotland', label: 'Scotland', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    regions: ['highlands', 'skye'],
  },
  {
    id: 'wales', label: 'Wales', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    regions: ['snowdonia', 'pembrokeshire'],
  },
  {
    id: 'ni', label: 'Northern Ireland', emoji: '🇬🇧',
    regions: ['causeway'],
  },
];

/** Feed pins on the map — lat/lng derived from linked property or region centre */
const CASA_MAP_FEED = [
  { id: 'f1', region: 'lake-district', type: 'tip', name: 'Hannah F.', text: 'Old Man of Coniston from Walna Scar — magic before 8am.', loc: 'Coniston', when: '2 days ago', emoji: '🥾', propertyId: 3, feedPostId: 5, subarea: 'coniston' },
  { id: 'f2', region: 'lake-district', type: 'avail', name: 'Sarah R.', text: '12–19 July now open at Stone Cottage. Sleeps 6, dogs welcome.', loc: 'Windermere', when: '2 hrs ago', emoji: '🏡', propertyId: 1, feedPostId: 1, subarea: 'windermere' },
  { id: 'f3', region: 'lake-district', type: 'review', name: 'Marcus J.', text: 'Week at The Granary — easiest host we have booked with.', loc: 'Hawkshead', when: 'Yesterday', emoji: '⭐', propertyId: 7, feedPostId: 3, subarea: 'coniston' },
  { id: 'f4', region: 'lake-district', type: 'photo', name: 'Tom & Anna', text: 'Buttermere this morning — fells in cloud, empty lake.', loc: 'Buttermere', when: 'Yesterday', emoji: '📸', propertyId: 5, feedPostId: 4, subarea: 'buttermere' },
  { id: 'f5', region: 'cornwall', type: 'tip', name: 'Alice M.', text: 'Zennor to St Ives coast path — utterly empty mornings.', loc: 'Zennor', when: 'Yesterday', emoji: '🌊', propertyId: 14, feedPostId: 9, subarea: 'far-west' },
  { id: 'f6', region: 'cornwall', type: 'avail', name: 'Rachel B.', text: '20–27 July free at Harbour Cottage, Mousehole.', loc: 'Mousehole', when: '4 hrs ago', emoji: '⚓', propertyId: 11, feedPostId: 8, subarea: 'far-west' },
  { id: 'f7', region: 'cornwall', type: 'review', name: 'James T.', text: 'Cliffside Cottage — sea view from the bedroom is extraordinary.', loc: 'Porthcurno', when: '1 hr ago', emoji: '⭐', propertyId: 9, feedPostId: 7, subarea: 'far-west' },
  { id: 'f8', region: 'highlands', type: 'tip', name: 'Neil F.', text: "Lairig Ghru — Scotland's most dramatic pass. 27 miles wild camp.", loc: 'Cairngorms', when: 'Yesterday', emoji: '🏔️', propertyId: 17, feedPostId: 14, subarea: 'cairngorms' },
  { id: 'f9', region: 'highlands', type: 'avail', name: 'Callum D.', text: 'Two weeks free in August at Glen Coe Bothy.', loc: 'Glencoe', when: '3 hrs ago', emoji: '🏕️', propertyId: 16, feedPostId: 13, subarea: 'glencoe' },
  { id: 'f10', region: 'norfolk', type: 'tip', name: 'Charlie R.', text: 'Wells at 7am — empty beach, £3.50 bacon rolls.', loc: 'Wells-next-the-Sea', when: 'Yesterday', emoji: '🌅', propertyId: 21, feedPostId: 17, subarea: 'coast' },
  { id: 'f11', region: 'yorkshire', type: 'photo', name: 'Graham & Kate', text: 'Dales at their finest — buttercups and silence.', loc: 'Wharfedale', when: '2 hrs ago', emoji: '🌿', propertyId: 25, feedPostId: 19, subarea: 'dales' },
  { id: 'f12', region: 'cornwall', type: 'avail', name: 'Martin & Sue', text: 'August availability at Tregothnan Lodge.', loc: 'Truro', when: '2 days ago', emoji: '🌹', propertyId: 10, feedPostId: 10, subarea: 'truro' },
  { id: 'f13', region: 'causeway', type: 'tip', name: 'Fiona', text: "Giant's Causeway at sunrise — alone for 20 minutes.", loc: 'Bushmills', when: '3 days ago', emoji: '🪨', propertyId: 35, feedPostId: null, subarea: 'causeway' },
  { id: 'f14', region: 'highlands', type: 'review', name: 'Sophie W.', text: 'Croft House — remote, beautiful, exceptional host.', loc: 'Torridon', when: '2 days ago', emoji: '⭐', propertyId: 18, feedPostId: 15, subarea: 'torridon' },
  { id: 'f15', region: 'skye', type: 'photo', name: 'Fiona M.', text: 'Old Man of Storr at 6am — whole ridge to ourselves.', loc: 'Portree', when: 'Just now', emoji: '📸', propertyId: 19, feedPostId: 12, subarea: 'trotternish' },
  { id: 'f16', region: 'snowdonia', type: 'avail', name: 'Host', text: 'Late July at Llyn Padarn Cabin.', loc: 'Llanberis', when: '5 hrs ago', emoji: '🏔️', propertyId: 34, feedPostId: null, subarea: 'llanberis' },
  { id: 'f17', region: 'pembrokeshire', type: 'review', name: 'Guest', text: 'Coast path glamping — stars and silence.', loc: 'Marloes', when: '1 day ago', emoji: '⭐', propertyId: 32, feedPostId: null, subarea: 'south' },
  { id: 'f18', region: 'cotswolds', type: 'tip', name: 'Visitor', text: 'Bourton-on-the-Water before the coaches arrive — 7am.', loc: 'Cotswolds', when: '3 days ago', emoji: '🌿', propertyId: 27, feedPostId: null, subarea: 'central' },
];

const CASA_FEED_TYPE_LABELS = {
  tip: 'Local tip', avail: 'Availability', review: 'Review', photo: 'Photo', looking: 'Looking',
};

function casaMapFeedCoords(item) {
  const props = casaMapAllProperties();
  const prop = item.propertyId ? props.find(p => p.id === item.propertyId) : null;
  if (prop?.lat && prop?.lng) {
    const o = ((item.id.charCodeAt(1) || 0) % 5) * 0.012 - 0.024;
    return [prop.lat + o, prop.lng + o * 1.4];
  }
  const region = CASA_MAP_REGIONS[item.region];
  if (!region) return [54.5, -3.5];
  const c = region.bounds;
  return [(c[0][0] + c[1][0]) / 2, (c[0][1] + c[1][1]) / 2];
}

function casaMapAllProperties() {
  return typeof casaMapGetProperties === 'function' ? casaMapGetProperties() : (typeof CASA_PROPERTIES !== 'undefined' ? CASA_PROPERTIES : []);
}

function casaMapAllFeed() {
  return typeof casaMapGetFeed === 'function' ? casaMapGetFeed() : (typeof CASA_MAP_FEED !== 'undefined' ? CASA_MAP_FEED : []);
}

function casaMapItemInSubarea(item, regionId, subareaId) {
  if (!subareaId) return true;
  const sa = typeof casaMapGetSubarea === 'function' ? casaMapGetSubarea(regionId, subareaId) : null;
  if (!sa?.towns) return false;
  const loc = String(item.loc || item.where || '').toLowerCase();
  if (sa.towns.some(t => loc.includes(String(t).toLowerCase()))) return true;
  if (item.subarea === subareaId) return true;
  if (item.propertyId) {
    const prop = casaMapAllProperties().find(p => p.id === item.propertyId);
    if (prop && sa.towns.some(t => String(prop.loc || '').toLowerCase().includes(String(t).toLowerCase()))) return true;
  }
  return typeof casaMapResolveSubarea === 'function' && casaMapResolveSubarea(item) === subareaId;
}

function casaMapCountForRegion(regionId) {
  const props = casaMapAllProperties();
  const feed = casaMapAllFeed();
  return {
    stays: props.filter(p => p.region === regionId).length,
    feed: feed.filter(f => f.region === regionId).length,
  };
}

function casaMapCountForCountry(countryId) {
  const node = CASA_MAP_TREE.find(c => c.id === countryId);
  if (!node) return { stays: 0, feed: 0 };
  return node.regions.reduce((acc, rid) => {
    const c = casaMapCountForRegion(rid);
    return { stays: acc.stays + c.stays, feed: acc.feed + c.feed };
  }, { stays: 0, feed: 0 });
}

function casaMapTotalCounts() {
  const props = casaMapAllProperties();
  const feed = casaMapAllFeed();
  return { stays: props.length, feed: feed.length };
}

function casaMapFeedByPostId(postId) {
  return casaMapAllFeed().find(f => String(f.feedPostId) === String(postId));
}

if (typeof casaMapApplyGeo === 'function') casaMapApplyGeo();

window.casaMapFeedByPostId = casaMapFeedByPostId;
