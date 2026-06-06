/** Homepage photography — hero strip & destination cards */
function casaInitHomePhotos() {
  const strip = document.querySelector('.hero-strip');
  if (strip && typeof CASA_HERO_STRIP !== 'undefined') {
    const scenes = strip.querySelectorAll('.prop-scene');
    CASA_HERO_STRIP.forEach((item, i) => {
      const el = scenes[i];
      if (!el) return;
      let url;
      if (typeof getCasaProperty === 'function') {
        const prop = getCasaProperty(item.id);
        url = prop ? casaGetPropertyPhoto(prop, 720) : casaGetRegionPhoto('lake-district', 720);
      } else {
        url = casaGetRegionPhoto('lake-district', 720);
      }
      el.innerHTML = '';
      el.className = 'ph prop-scene hero-photo';
      const img = document.createElement('img');
      img.className = 'casa-photo-img';
      img.src = url;
      img.alt = `${item.label}, ${item.sub}`;
      img.loading = i === 0 ? 'eager' : 'lazy';
      el.appendChild(img);
      const cap = document.createElement('div');
      cap.style.cssText = 'position:absolute;left:0;right:0;bottom:0;padding:14px 12px 12px;background:linear-gradient(to top,rgba(22,20,15,.78),transparent);color:#fff;z-index:2';
      cap.innerHTML = `<div style="font-family:var(--mono);font-size:8px;letter-spacing:.14em;text-transform:uppercase;opacity:.9">${item.label.toUpperCase()}</div><div style="font-family:var(--mono);font-size:7px;letter-spacing:.12em;opacity:.65;margin-top:4px">${item.sub.toUpperCase()}</div>`;
      el.appendChild(cap);
    });
  }

  document.querySelectorAll('.dest-card[href*="region="]').forEach(card => {
    const region = new URL(card.href, location.href).searchParams.get('region');
    if (!region || typeof casaGetRegionPhoto !== 'function') return;
    const url = casaGetRegionPhoto(region, 1000);
    card.querySelectorAll('svg').forEach(s => { s.style.display = 'none'; });
    if (!card.querySelector('.dest-bg-img')) {
      const img = document.createElement('img');
      img.className = 'dest-bg-img casa-photo-img';
      img.src = url;
      img.alt = region.replace(/-/g, ' ');
      img.loading = 'lazy';
      card.insertBefore(img, card.firstChild);
    } else {
      card.querySelector('.dest-bg-img').src = url;
    }
  });
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
  if (document.querySelector('.hero-strip') || document.querySelector('.dest-card')) {
    casaInitHomePhotos();
  }
  casaApplyCardPhotos();
});
