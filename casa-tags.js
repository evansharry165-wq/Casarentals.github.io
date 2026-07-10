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
  pembrokeshire: { label: 'Pembrokeshire', regions: ['pembrokeshire'], tags: ['seaview'] },
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

// ─── Homepage personalization support ───
// Keyword synonyms per existing amenity tag, checked against a listing's
// real description text (the hand-written per-listing copy, not the old
// auto-generated fallback — see property.html's applyListingToPage) so a
// genuinely good match for a chosen lifestyle tag isn't missed just
// because a host ticked the box for a related-but-different amenity, or
// didn't tick anything at all. Every key here is an EXISTING tag already
// in CASA_TAG_MAP/casa-properties.js's tags array — this adds a second
// signal for matching an existing tag, never a new tag of its own.
const CASA_TAG_KEYWORDS = {
  pets: ['dog', 'dogs', 'pet'],
  woodburner: ['wood burner', 'log fire', 'open fire', 'fireplace', 'stove'],
  hottub: ['hot tub'],
  seaview: ['sea view', 'coast', 'coastal', 'beach', 'estuary', 'harbour', 'cliff'],
  offgrid: ['off-grid', 'off grid', 'remote', 'solar', 'no wifi', 'no signal'],
  romantic: ['romantic', 'anniversary', 'honeymoon', 'couple'],
  garden: ['garden'],
  sauna: ['sauna'],
  accessible: ['wheelchair', 'step-free', 'accessible'],
};

function casaPropertyMatchesTagKeyword(p, tag) {
  const words = CASA_TAG_KEYWORDS[tag];
  if (!words || !p.description) return false;
  const desc = p.description.toLowerCase();
  return words.some(w => desc.includes(w));
}
window.casaPropertyMatchesTagKeyword = casaPropertyMatchesTagKeyword;

// A NEW, additive function for the homepage personalization "your
// styles" carousel only — deliberately not folded into
// casaMatchPropertiesForTag above, which tag.html's regional pages and
// the previous task's default homepage carousels already depend on
// unchanged (no changes to existing search/browse matching behaviour).
// Matches on ANY of a user's chosen tags (OR, not AND — a stricter AND
// would shrink to near-nothing fast once someone picks 2-3 styles), each
// checked against both the real tags array and the description-keyword
// fallback above.
function casaMatchPropertiesForPreferredTags(tagList) {
  if (!Array.isArray(tagList) || !tagList.length || typeof CASA_PROPERTIES === 'undefined') return [];
  return CASA_PROPERTIES.filter(p =>
    tagList.some(t => (p.tags || []).includes(t) || casaPropertyMatchesTagKeyword(p, t))
  );
}
window.casaMatchPropertiesForPreferredTags = casaMatchPropertiesForPreferredTags;
