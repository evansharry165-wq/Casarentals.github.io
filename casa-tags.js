/* ──────────────────────────────────────────────────────────
   CASA · shared tag/region collection map
   Single source of truth for what a tag/region hashtag actually means
   in terms of real CASA_PROPERTIES data — previously only lived inline
   in tag.html. Pulled out here so index.html's homepage carousels use
   the exact same vocabulary and matching rules instead of a second,
   parallel one. tag.html loads this file and reads CASA_TAG_MAP instead
   of its own local copy.
   Requires CASA_PROPERTIES (casa-properties.js) loaded first.
   ────────────────────────────────────────────────────────── */
const CASA_TAG_MAP = {
  lakedistrict: { label: 'Lake District', regions: ['lake-district'], tags: ['woodburner'] },
  cornwall: { label: 'Cornwall', regions: ['cornwall'], tags: ['seaview'] },
  highlands: { label: 'Scottish Highlands', regions: ['highlands', 'skye'], tags: ['offgrid'] },
  norfolk: { label: 'Norfolk', regions: ['norfolk'], tags: ['seaview'] },
  cotswolds: { label: 'The Cotswolds', regions: ['cotswolds'], tags: ['woodburner'] },
  snowdonia: { label: 'Snowdonia', regions: ['snowdonia'], tags: ['offgrid'] },
  causeway: { label: 'Causeway Coast', regions: ['causeway'], tags: ['seaview'] },
  yorkshire: { label: 'Yorkshire', regions: ['yorkshire'], tags: ['woodburner'] },
  petfriendly: { label: 'Pet friendly', regions: [], tags: ['pets'] },
  woodburner: { label: 'Wood burner', regions: [], tags: ['woodburner'] },
  seaview: { label: 'Sea view', regions: [], tags: ['seaview'] },
  lastminute: { label: 'Last minute', regions: [], tags: [] },
  hottub: { label: 'Hot tub', regions: [], tags: ['hottub'] },
  romantic: { label: 'Romantic getaways', regions: [], tags: ['romantic'] },
  garden: { label: 'Garden stays', regions: [], tags: ['garden'] },
  sauna: { label: 'Sauna', regions: [], tags: ['sauna'] },
};

// Same matching semantics tag.html's own matchProps() already used:
// region-scoped entries (regions.length > 0) match by exact region,
// never by the tags list (a nationwide amenity tag applied to a region
// page would match every woodburner property in the UK, not just that
// region's) — plus a title/loc substring fallback either way.
// `metaOverride` lets a caller (tag.html) match against a tag that isn't
// in CASA_TAG_MAP at all — an arbitrary hashtag from a real feed post —
// using the same fallback shape tag.html already builds
// ({ label: rawTag, regions: [], tags: [rawTag] }) rather than this
// file needing to know about every possible tag in advance.
function casaMatchPropertiesForTag(tagSlug, metaOverride) {
  const meta = metaOverride || CASA_TAG_MAP[tagSlug];
  if (!meta || typeof CASA_PROPERTIES === 'undefined') return [];
  return CASA_PROPERTIES.filter(p => {
    if (meta.regions.length) {
      return meta.regions.includes(p.region) ||
        p.title.toLowerCase().includes(tagSlug) ||
        p.loc.toLowerCase().includes(tagSlug);
    }
    return meta.tags.some(t => (p.tags || []).includes(t)) ||
      p.title.toLowerCase().includes(tagSlug) ||
      p.loc.toLowerCase().includes(tagSlug);
  });
}

window.CASA_TAG_MAP = CASA_TAG_MAP;
window.casaMatchPropertiesForTag = casaMatchPropertiesForTag;
