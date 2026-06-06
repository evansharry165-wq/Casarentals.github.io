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
        url = prop ? casaGetPropertyPhoto(prop, 640) : casaGetRegionPhoto('lake-district', 640);
      } else {
        url = casaGetRegionPhoto('lake-district', 640);
      }
      el.innerHTML = '';
      el.className = 'ph prop-scene casa-photo hero-photo';
      el.style.backgroundImage = `url('${url}')`;
      el.style.position = 'relative';
      const cap = document.createElement('div');
      cap.style.cssText = 'position:absolute;left:0;right:0;bottom:0;padding:14px 12px 12px;background:linear-gradient(to top,rgba(22,20,15,.75),transparent);color:#fff;z-index:2';
      cap.innerHTML = `<div style="font-family:var(--mono);font-size:8px;letter-spacing:.14em;text-transform:uppercase;opacity:.9">${item.label.toUpperCase()}</div><div style="font-family:var(--mono);font-size:7px;letter-spacing:.12em;opacity:.65;margin-top:4px">${item.sub.toUpperCase()}</div>`;
      el.appendChild(cap);
    });
  }

  document.querySelectorAll('.dest-card[href*="region="]').forEach(card => {
    const region = new URL(card.href, location.href).searchParams.get('region');
    if (!region || typeof casaGetRegionPhoto !== 'function') return;
    const url = casaGetRegionPhoto(region, 1000);
    card.querySelectorAll('svg').forEach(s => { s.style.display = 'none'; });
    card.classList.add('dest-photo');
    card.style.backgroundImage = `url('${url}')`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
  });
}

function casaApplyCardPhotos(root) {
  if (typeof getCasaProperty !== 'function' || typeof casaGetPropertyPhoto !== 'function') return;
  (root || document).querySelectorAll('a.pc[href*="id="]').forEach(a => {
    const id = new URL(a.href, location.href).searchParams.get('id');
    const p = getCasaProperty(id);
    if (!p) return;
    const ph = a.querySelector('.pc-image .ph, .pc-image > div[style*="background"]');
    const target = ph || a.querySelector('.pc-image');
    if (!target) return;
    if (target.classList.contains('ph')) {
      target.className = 'ph casa-photo';
      target.style.background = '';
      target.style.backgroundImage = `url('${casaGetPropertyPhoto(p, 800)}')`;
      target.removeAttribute('data-label');
    } else if (target === a.querySelector('.pc-image') && target.firstElementChild?.style?.background?.includes('linear')) {
      target.innerHTML = `<div class="casa-photo-wrap casa-photo" style="${casaPhotoStyle(p, 800)}"></div>` + target.innerHTML.replace(/^[\s\S]*?(?=<button|<div class="badge|<div class="img-nav)/,'');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.hero-strip') || document.querySelector('.dest-card')) {
    casaInitHomePhotos();
  }
  casaApplyCardPhotos();
});
