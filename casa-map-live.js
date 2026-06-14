/**
 * Casa map live data layer — merges static catalogue with localStorage (Supabase-ready)
 */
const CASA_MAP_LIVE_KEY = 'casa:map-feed';
const CASA_MAP_HOST_LISTINGS_KEY = 'casa:host-listings';

/** County slug from feed → map region id */
const CASA_FEED_COUNTY_TO_REGION = {
  cumbria: 'lake-district',
  cornwall: 'cornwall',
  norfolk: 'norfolk',
  yorkshire: 'yorkshire',
  cotswolds: 'cotswolds',
  highlands: 'highlands',
  snowdonia: 'snowdonia',
  pembrokeshire: 'pembrokeshire',
  causeway: 'causeway',
  devon: 'cornwall',
  kent: 'norfolk',
};

function casaMapNormalizeRegion(input) {
  if (!input || input === 'all') return 'all';
  const lc = String(input).toLowerCase();
  if (CASA_MAP_REGIONS[lc]) return lc;
  if (CASA_FEED_COUNTY_TO_REGION[lc]) return CASA_FEED_COUNTY_TO_REGION[lc];
  if (lc === 'cumbria' || lc.includes('lake')) return 'lake-district';
  if (lc.includes('skye')) return 'skye';
  return lc;
}

function casaMapGetProperties() {
  const list = typeof CASA_PROPERTIES !== 'undefined' ? [...CASA_PROPERTIES] : [];
  try {
    const hostListings = JSON.parse(localStorage.getItem(CASA_MAP_HOST_LISTINGS_KEY) || '[]');
    hostListings.forEach((h, i) => {
      if (!h?.title) return;
      list.push({
        id: h.id || 9000 + i,
        title: h.title,
        loc: h.town || h.loc || 'UK',
        region: h.region || 'lake-district',
        rLabel: h.rLabel || h.region || 'UK',
        type: h.type || 'cottage',
        price: Number(h.price) || 120,
        rating: 4.8,
        reviews: 0,
        sleeps: Number(h.sleeps) || 4,
        beds: Number(h.beds) || 2,
        tags: h.tags || [],
        badge: 'new',
        col: h.col || '#C8A882',
        live: true,
      });
    });
    const draft = JSON.parse(localStorage.getItem('casa:listing-draft') || 'null');
    if (draft?.title && draft?.town) {
      const exists = list.some(p => p.title === draft.title && p.loc === draft.town);
      if (!exists) {
        list.push({
          id: 9999,
          title: draft.title,
          loc: draft.town,
          region: draft.region || 'lake-district',
          rLabel: 'Draft listing',
          type: draft.type || 'cottage',
          price: Number(draft.price) || 150,
          rating: 0,
          reviews: 0,
          sleeps: parseInt(draft.sleeps, 10) || 4,
          beds: parseInt(draft.beds, 10) || 2,
          tags: [],
          badge: 'new',
          col: '#8DA88A',
          draft: true,
        });
      }
    }
  } catch { /* ignore */ }
  if (typeof casaEnrichProperties === 'function') {
    list.filter(p => !p.lat).forEach(p => {
      const base = CASA_PROPERTIES.find(x => x.id === p.id);
      if (base?.lat) { p.lat = base.lat; p.lng = base.lng; }
      else if (CASA_REGION_COORDS?.[p.region]) {
        const c = CASA_REGION_COORDS[p.region];
        p.lat = c.lat + (p.id % 7) * 0.02;
        p.lng = c.lng + (p.id % 5) * 0.02;
      }
    });
  }
  return list;
}

function casaMapGetFeed() {
  const list = typeof CASA_MAP_FEED !== 'undefined' ? [...CASA_MAP_FEED] : [];
  try {
    const extra = JSON.parse(localStorage.getItem(CASA_MAP_LIVE_KEY) || '[]');
    extra.forEach((e, i) => list.unshift({
      id: e.id || `live-${i}`,
      region: e.region || 'lake-district',
      type: e.type || 'tip',
      name: e.name || 'You',
      text: e.text || '',
      loc: e.loc || 'UK',
      when: e.when || 'Just now',
      emoji: e.emoji || '💬',
      propertyId: e.propertyId,
      feedPostId: e.feedPostId,
      subarea: e.subarea,
      live: true,
    }));
  } catch { /* ignore */ }
  return list;
}

function casaMapUrl(opts = {}) {
  const p = new URLSearchParams();
  if (opts.region && opts.region !== 'all') p.set('region', opts.region);
  if (opts.subarea) p.set('subarea', opts.subarea);
  if (opts.pin) p.set('pin', opts.pin);
  if (opts.property) p.set('property', opts.property);
  if (opts.post) p.set('post', opts.post);
  if (opts.q) p.set('q', opts.q);
  const q = p.toString();
  return `map.html${q ? '?' + q : ''}`;
}

function casaMapUrlForFeedPost(postId, county) {
  const feed = casaMapGetFeed();
  const match = feed.find(f => String(f.feedPostId) === String(postId));
  if (match) return casaMapUrl({ region: match.region, pin: match.id });
  const region = CASA_FEED_COUNTY_TO_REGION[county] || 'all';
  return casaMapUrl({ region, post: postId });
}

function casaMapPersistFeedPost(post) {
  try {
    const list = JSON.parse(localStorage.getItem(CASA_MAP_LIVE_KEY) || '[]');
    const regionId = CASA_FEED_COUNTY_TO_REGION[post.county] || post.region || 'lake-district';
    list.unshift({
      id: `user-${Date.now()}`,
      region: regionId,
      type: post.type || 'tip',
      name: post.name || 'You',
      text: (post.body || '').replace(/<[^>]+>/g, '').slice(0, 200),
      loc: post.where || 'UK',
      when: 'Just now',
      emoji: { avail: '🏡', tip: '🥾', review: '⭐', photo: '📸', looking: '🔍' }[post.type] || '💬',
      feedPostId: post.id,
      subarea: typeof casaMapResolveSubarea === 'function'
        ? casaMapResolveSubarea({ loc: post.where, region: regionId })
        : null,
      live: true,
    });
    localStorage.setItem(CASA_MAP_LIVE_KEY, JSON.stringify(list.slice(0, 40)));
  } catch { /* ignore */ }
}

window.casaMapGetProperties = casaMapGetProperties;
window.casaMapGetFeed = casaMapGetFeed;
window.casaMapUrl = casaMapUrl;
window.casaMapUrlForFeedPost = casaMapUrlForFeedPost;
window.casaMapNormalizeRegion = casaMapNormalizeRegion;
window.casaMapPersistFeedPost = casaMapPersistFeedPost;
