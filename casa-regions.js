/** Unified region / county taxonomy — browse, map, and feed */
const CASA_REGIONS = {
  all: {
    key: 'all',
    browseKey: 'all',
    mapKey: 'all',
    feedKey: 'all',
    label: 'All UK',
    browseLabel: 'All UK stays',
    italic: 'All UK',
    mapTitle: 'The whole <i>UK</i>',
    mapSub: '4,202 stays nationwide',
    from: '£85',
    avg: '£195',
    stays: 4202,
    feedPosts: 94,
    members: 1847,
  },
  'lake-district': {
    key: 'lake-district',
    browseKey: 'lake-district',
    mapKey: 'lake-district',
    feedKey: 'cumbria',
    label: 'Lake District',
    browseLabel: 'The Lake District',
    italic: 'Lake District',
    mapTitle: 'The <i>Lake District</i>',
    mapSub: '214 stays · Cumbria',
    from: '£85',
    avg: '£175',
    stays: 214,
    feedPosts: 18,
    members: 312,
    searchTerms: ['lake district', 'lakes', 'cumbria', 'windermere', 'keswick', 'ambleside', 'coniston', 'grasmere', 'hawkshead', 'buttermere'],
    mapCenter: { x: 135, y: 228, scale: 2.2 },
    activity: "Sarah R. just posted a last-minute opening at Stone Cottage, Windermere. Hannah F. shared a Coniston walk tip that's been liked 128 times.",
  },
  cornwall: {
    key: 'cornwall',
    browseKey: 'cornwall',
    mapKey: 'cornwall',
    feedKey: 'cornwall',
    label: 'Cornwall',
    browseLabel: 'Cornwall',
    italic: 'Cornwall',
    mapTitle: '<i>Cornwall</i>',
    mapSub: '198 stays',
    from: '£90',
    avg: '£185',
    stays: 198,
    feedPosts: 22,
    members: 287,
    searchTerms: ['cornwall', 'mousehole', 'porthcurno', 'fowey', 'truro', 'zennor', 'st ives'],
    mapCenter: { x: 100, y: 440, scale: 2.4 },
    activity: "Rachel B. just posted a last-minute cancellation at Harbour Cottage, Mousehole. James T. left a 5-star review for Cliffside Cottage.",
  },
  highlands: {
    key: 'highlands',
    browseKey: 'highlands',
    mapKey: 'highlands',
    feedKey: 'highlands',
    label: 'Scottish Highlands',
    browseLabel: 'Scottish Highlands',
    italic: 'Scottish Highlands',
    mapTitle: 'The <i>Highlands</i>',
    mapSub: '145 stays · Scotland',
    from: '£110',
    avg: '£195',
    stays: 145,
    feedPosts: 14,
    members: 198,
    searchTerms: ['highlands', 'highland', 'scotland', 'glencoe', 'torridon', 'loch ness', 'drumnadrochit', 'cairngorms'],
    mapCenter: { x: 130, y: 70, scale: 2.0 },
    activity: "Callum D. has two weeks free at Glen Coe Bothy in August. Neil F.'s Lairig Ghru tip has 88 likes and 34 replies.",
  },
  norfolk: {
    key: 'norfolk',
    browseKey: 'norfolk',
    mapKey: 'norfolk',
    feedKey: 'norfolk',
    label: 'Norfolk',
    browseLabel: 'Norfolk',
    italic: 'Norfolk',
    mapTitle: '<i>Norfolk</i>',
    mapSub: '112 stays · East Anglia',
    from: '£95',
    avg: '£165',
    stays: 112,
    feedPosts: 11,
    members: 167,
    searchTerms: ['norfolk', 'wells', 'blakeney', 'brancaster', 'burnham'],
    mapCenter: { x: 222, y: 280, scale: 2.5 },
    activity: "Bridget H. at Burnham Overy Barn has September wide open. Charlie R.'s Wells sunrise post is trending today.",
  },
  yorkshire: {
    key: 'yorkshire',
    browseKey: 'yorkshire',
    mapKey: 'yorkshire',
    feedKey: 'yorkshire',
    label: 'Yorkshire',
    browseLabel: 'Yorkshire',
    italic: 'Yorkshire',
    mapTitle: '<i>Yorkshire</i>',
    mapSub: '98 stays',
    from: '£100',
    avg: '£170',
    stays: 98,
    feedPosts: 9,
    members: 143,
    searchTerms: ['yorkshire', 'dales', 'whitby', 'goathland', 'wharfedale', 'moors'],
    mapCenter: { x: 185, y: 245, scale: 2.3 },
    activity: "Graham & Kate posted a beautiful Dales photo this morning — already 56 likes. August availability still open at Dales Farmhouse.",
  },
  cotswolds: {
    key: 'cotswolds',
    browseKey: 'cotswolds',
    mapKey: 'cotswolds',
    feedKey: 'cotswolds',
    label: 'Cotswolds',
    browseLabel: 'Cotswolds',
    italic: 'Cotswolds',
    mapTitle: 'The <i>Cotswolds</i>',
    mapSub: '87 stays · Gloucestershire',
    from: '£140',
    avg: '£195',
    stays: 87,
    feedPosts: 8,
    members: 121,
    searchTerms: ['cotswolds', 'bourton', 'chipping campden', 'gloucestershire'],
    mapCenter: { x: 176, y: 338, scale: 2.5 },
    activity: 'Honeysuckle Cottage and Chipping Manor both have summer availability. Quiet week on the feed — a good time to post.',
  },
  skye: {
    key: 'skye',
    browseKey: 'skye',
    mapKey: 'skye',
    feedKey: 'highlands',
    label: 'Isle of Skye',
    browseLabel: 'Isle of Skye',
    italic: 'Isle of Skye',
    mapTitle: '<i>Isle of Skye</i>',
    mapSub: '67 stays · Scotland',
    from: '£110',
    avg: '£210',
    stays: 67,
    feedPosts: 6,
    members: 89,
    searchTerms: ['skye', 'isle of skye', 'portree', 'trotternish', 'storr'],
    mapCenter: { x: 95, y: 72, scale: 2.8 },
    activity: "Fiona M.'s Storr sunrise photo from the Blackhouse is the most liked post this week — 112 likes.",
  },
  snowdonia: {
    key: 'snowdonia',
    browseKey: 'snowdonia',
    mapKey: 'snowdonia',
    feedKey: 'snowdonia',
    label: 'Snowdonia',
    browseLabel: 'Snowdonia',
    italic: 'Snowdonia',
    mapTitle: '<i>Snowdonia</i>',
    mapSub: '54 stays · Wales',
    from: '£95',
    avg: '£165',
    stays: 54,
    feedPosts: 6,
    members: 89,
    searchTerms: ['snowdonia', 'wales', 'betws', 'llanberis', 'y wyddfa'],
    mapCenter: { x: 118, y: 296, scale: 2.4 },
    activity: 'Llyn Padarn Cabin has late July availability. Hafod Cottage just received a 5-star review from a returning guest.',
  },
  pembrokeshire: {
    key: 'pembrokeshire',
    browseKey: 'pembrokeshire',
    mapKey: 'pembrokeshire',
    feedKey: 'pembrokeshire',
    label: 'Pembrokeshire',
    browseLabel: 'Pembrokeshire',
    italic: 'Pembrokeshire',
    mapTitle: '<i>Pembrokeshire</i>',
    mapSub: '48 stays · Wales',
    from: '£85',
    avg: '£155',
    stays: 48,
    feedPosts: 5,
    members: 78,
    searchTerms: ['pembrokeshire', 'st davids', 'solva', 'marloes'],
    mapCenter: { x: 88, y: 345, scale: 2.6 },
    activity: 'Pembroke Cliffside just dropped their September price. Three new reviews posted this week.',
  },
  causeway: {
    key: 'causeway',
    browseKey: 'causeway',
    mapKey: 'causeway',
    feedKey: 'causeway',
    label: 'Causeway Coast',
    browseLabel: 'Causeway Coast',
    italic: 'Causeway Coast',
    mapTitle: '<i>Causeway Coast</i>',
    mapSub: '29 stays · N. Ireland',
    from: '£110',
    avg: '£175',
    stays: 29,
    feedPosts: 3,
    members: 44,
    searchTerms: ['causeway', 'antrim', 'bushmills', 'giant\'s causeway', 'dark hedges'],
    mapCenter: { x: 86, y: 150, scale: 2.8 },
    activity: "Fiona's sunrise tip at the Causeway is getting traction — 3 new bookings this week.",
  },
};

function getCasaRegion(key) {
  if (!key) return CASA_REGIONS.all;
  const norm = String(key).toLowerCase().replace(/\s+/g, '-');
  if (CASA_REGIONS[norm]) return CASA_REGIONS[norm];
  const byFeed = Object.values(CASA_REGIONS).find(r => r.feedKey === norm);
  if (byFeed) return byFeed;
  const byTerm = Object.values(CASA_REGIONS).find(r =>
    (r.searchTerms || []).some(t => norm.includes(t.replace(/\s+/g, '-')) || t.includes(norm.replace(/-/g, ' ')))
  );
  return byTerm || CASA_REGIONS.all;
}

function resolveCasaRegionFromQuery(query) {
  if (!query) return null;
  const lc = query.toLowerCase().trim();
  for (const region of Object.values(CASA_REGIONS)) {
    if (region.key === 'all') continue;
    if (region.label.toLowerCase() === lc) return region;
    if ((region.searchTerms || []).some(t => lc.includes(t) || t.includes(lc))) return region;
  }
  const prop = typeof CASA_PROPERTIES !== 'undefined'
    ? CASA_PROPERTIES.find(p => p.loc.toLowerCase().includes(lc) || p.title.toLowerCase().includes(lc))
    : null;
  return prop ? getCasaRegion(prop.region) : null;
}

function casaBrowseRegionUrl(regionKey) {
  return regionKey && regionKey !== 'all' ? `browse.html?region=${regionKey}` : 'browse.html';
}

function casaMapRegionUrl(regionKey) {
  return regionKey && regionKey !== 'all' ? `map.html?county=${regionKey}` : 'map.html';
}

function casaFeedCountyUrl(feedKey) {
  return feedKey && feedKey !== 'all' ? `feed.html?county=${feedKey}` : 'feed.html';
}
