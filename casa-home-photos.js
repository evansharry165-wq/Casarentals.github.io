/** Homepage — region counts & property card photos */

function casaCountByRegion() {
  if (typeof CASA_PROPERTIES === 'undefined') return {};
  return CASA_PROPERTIES.reduce((acc, p) => {
    acc[p.region] = (acc[p.region] || 0) + 1;
    return acc;
  }, {});
}

function casaMinPriceByRegion(region) {
  if (typeof CASA_PROPERTIES === 'undefined') return null;
  const prices = CASA_PROPERTIES.filter(p => p.region === region).map(p => p.price);
  return prices.length ? Math.min(...prices) : null;
}

function casaUpdateHomeListingCounts() {
  const counts = casaCountByRegion();
  const total = typeof CASA_PROPERTIES !== 'undefined' ? CASA_PROPERTIES.length : 0;

  document.querySelectorAll('.dest-card .sub[data-region]').forEach(el => {
    const region = el.dataset.region;
    const n = counts[region] || 0;
    const min = casaMinPriceByRegion(region);
    if (n && min) {
      el.textContent = `${n} preview ${n === 1 ? 'stay' : 'stays'} · from £${min}/night`;
    } else if (n) {
      el.textContent = `${n} preview ${n === 1 ? 'stay' : 'stays'}`;
    }
  });

  const browseLink = document.getElementById('browse-all-link');
  if (browseLink && total) {
    for (const node of browseLink.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = `Browse ${total} preview listings `;
        break;
      }
    }
  }
}

function casaApplyCardPhotos(root) {
  if (typeof getCasaProperty !== 'function' || typeof casaGetPropertyPhoto !== 'function') return;
  (root || document).querySelectorAll('a.pc[href*="id="]').forEach(a => {
    const id = new URL(a.href, location.href).searchParams.get('id');
    const p = getCasaProperty(id);
    if (!p) return;
    const wrap = a.querySelector('.pc-image');
    if (!wrap) return;
    const existing = wrap.querySelector('img.casa-photo-img');
    const url = casaGetPropertyPhoto(p, 800);
    const alt = `${p.title}, ${p.loc}`;
    if (existing) {
      existing.src = url;
      existing.alt = alt;
      return;
    }
    const ph = wrap.querySelector('.ph');
    const img = document.createElement('img');
    img.className = 'casa-photo-img';
    img.src = url;
    img.alt = alt;
    img.loading = 'lazy';
    if (ph) ph.replaceWith(img);
    else wrap.insertBefore(img, wrap.firstChild);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  casaUpdateHomeListingCounts();
  casaApplyCardPhotos();
});
