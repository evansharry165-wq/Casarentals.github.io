/** Render property cards on marketing / info pages */
function casaRenderInfoStays(containerId, filterFn, limit) {
  const el = document.getElementById(containerId);
  if (!el || typeof CASA_PROPERTIES === 'undefined') return;
  const items = CASA_PROPERTIES.filter(filterFn).slice(0, limit || 4);
  el.innerHTML = items.map(p => `
    <a class="info-stay" href="property.html?id=${p.id}">
      ${casaPhotoImg(p, { width: 640, className: 'is-img casa-photo-img' })}
      <div class="is-body">
        <div class="is-title">${p.title}, <i>${p.loc}</i></div>
        <div class="is-meta">${p.rLabel} · Sleeps ${p.sleeps} · ★ ${p.rating}</div>
        <div class="is-price"><i>£${p.price}</i> / night</div>
      </div>
    </a>`).join('');
}

window.casaRenderInfoStays = casaRenderInfoStays;
