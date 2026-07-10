/**
 * Casa full map page — region explorer, stays + feed pins
 */
const CASA_MAP_TAG_LABELS = {
  woodburner: 'Wood burner',
  hottub: 'Hot tub',
  pets: 'Pets welcome',
  seaview: 'Sea view',
  offgrid: 'Off-grid',
};

let casaMapInstance;
let casaPolygonLayer;
let casaSubareaLayer;
let casaMarkerLayer;
let casaClusterGroup;
let casaUkBounds;
let casaMarkerRegistry;

const casaMapState = {
  region: 'all',
  subarea: null,
  layer: 'both',
  sort: 'curated',
  search: '',
  expandedCountries: new Set(['england']),
  expandedRegions: new Set(),
  activePin: null,
  openPopup: null,
  mobileTab: 'areas',
  _refreshToken: 0,
};

function casaMapFormatRegionName(label) {
  const parts = label.split(' ');
  if (parts.length === 1) return `<i>${label}</i>`;
  return parts.slice(0, -1).join(' ') + ' <i>' + parts[parts.length - 1] + '</i>';
}

function casaMapAllProperties() {
  return typeof window.casaMapGetProperties === 'function'
    ? window.casaMapGetProperties()
    : (typeof CASA_PROPERTIES !== 'undefined' ? CASA_PROPERTIES : []);
}

function casaMapAllFeed() {
  return typeof window.casaMapGetFeed === 'function'
    ? window.casaMapGetFeed()
    : (typeof CASA_MAP_FEED !== 'undefined' ? CASA_MAP_FEED : []);
}

function casaMapInit() {
  casaUkBounds = L.latLngBounds(CASA_MAP_UK_BOUNDS);

  casaMapInstance = L.map('casaMap', {
    zoomControl: false,
    minZoom: 5,
    maxZoom: 18,
    zoomAnimation: true,
    fadeAnimation: true,
  }).setView(CASA_MAP_COUNTRY_VIEW.center, CASA_MAP_COUNTRY_VIEW.zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(casaMapInstance);

  casaMapInstance.setMaxBounds(casaUkBounds.pad(0.08));
  L.control.zoom({ position: 'bottomright' }).addTo(casaMapInstance);

  casaPolygonLayer = L.layerGroup().addTo(casaMapInstance);
  casaSubareaLayer = L.layerGroup().addTo(casaMapInstance);
  casaMarkerLayer = L.layerGroup().addTo(casaMapInstance);
  casaClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 48,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    disableClusteringAtZoom: 14,
    animate: true,
    zoomToBoundsOnClick: true,
  });

  Object.values(CASA_MAP_REGIONS).forEach(region => {
    const poly = L.polygon(region.polygon, {
      color: '#B05533',
      weight: 2,
      fillColor: '#B05533',
      fillOpacity: 0.04,
      className: 'casa-region-poly',
    });
    poly.regionId = region.id;
    const c = casaMapCountForRegion(region.id);
    poly.bindTooltip(
      `<strong>${region.label}</strong><br><span style="opacity:.85;font-size:11px">${c.stays} stays · ${c.feed} posts · tap to zoom</span>`,
      { sticky: true, direction: 'top', className: 'casa-region-tip', opacity: 1 }
    );
    poly.on('mouseover', () => {
      if (casaMapState.region === 'all') {
        poly.setStyle({ fillOpacity: 0.18, weight: 2.5, color: '#8E4326' });
      }
    });
    poly.on('mouseout', () => {
      if (casaMapState.region === 'all') {
        poly.setStyle({ fillOpacity: 0.04, weight: 2, color: '#B05533' });
      }
    });
    poly.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      casaMapEnterRegion(region.id);
    });
    casaPolygonLayer.addLayer(poly);
  });

  casaMapInstance.on('click', () => {
    if (casaMapState.openPopup) {
      casaMapInstance.closePopup();
      casaMapState.openPopup = null;
    }
  });

  casaMapInstance.on('moveend', () => {
    requestAnimationFrame(() => casaMapInstance.invalidateSize({ pan: false }));
  });

  window.addEventListener('resize', casaMapOnResize);
  casaMapUpdateModeUi();
}

function casaMapOnResize() {
  if (!casaMapInstance) return;
  requestAnimationFrame(() => casaMapInstance.invalidateSize({ pan: false }));
}

function casaMapUpdateModeUi() {
  const canvas = document.querySelector('.map-canvas');
  const backBtn = document.getElementById('btnBackUk');
  const badge = document.getElementById('mapModeBadge');
  const isOverview = casaMapState.region === 'all';
  canvas?.classList.toggle('is-overview', isOverview);
  backBtn?.classList.toggle('hidden', isOverview);
  badge?.classList.toggle('hidden', isOverview);
  if (!isOverview) {
    badge.textContent = CASA_MAP_REGIONS[casaMapState.region]?.label || 'Region view';
  }
}

function casaMapFlyToUk() {
  casaMapInstance.setMaxBounds(casaUkBounds.pad(0.08));
  casaMapInstance.flyTo(CASA_MAP_COUNTRY_VIEW.center, CASA_MAP_COUNTRY_VIEW.zoom, {
    duration: 0.9,
    easeLinearity: 0.25,
  });
}

function casaMapFlyToRegionBounds(regionId, subareaId) {
  const r = CASA_MAP_REGIONS[regionId];
  if (!r) return;
  let bounds;
  if (subareaId && r.subareas?.[subareaId]?.bounds) {
    bounds = L.latLngBounds(r.subareas[subareaId].bounds);
  } else {
    bounds = L.latLngBounds(r.bounds);
  }
  casaMapInstance.setMaxBounds(bounds.pad(0.25));
  casaMapInstance.flyToBounds(bounds, {
    padding: [72, 72],
    maxZoom: subareaId ? 13 : 12,
    duration: 0.95,
    easeLinearity: 0.25,
  });
}

function casaMapBackToUk() {
  casaMapSelectRegion('all');
}

function casaMapEnterRegion(regionId) {
  casaMapSelectRegion(regionId);
  casaMapSetMobileTab('results');
}

function casaMapStayPopupHtml(p) {
  const img = p.photos && p.photos[0]
    ? `<div class="cp-img" style="background-image:url('${p.photos[0]}');background-size:cover;background-position:center"></div>`
    : `<div class="cp-img" style="background:${p.col || '#C8A882'}"></div>`;
  return `<div class="casa-popup">
    ${img}
    <div class="cp-body">
      <strong>${p.title}</strong>
      <div class="cp-loc"><em>${p.loc}</em> · ${p.rLabel || ''}</div>
      <div class="cp-meta">★ ${p.rating} · Sleeps ${p.sleeps} · <strong>£${p.price}</strong>/night · £0 guest fee</div>
      <div class="cp-actions">
        <a class="cp-btn primary" href="property.html?id=${p.id}">View stay</a>
        <a class="cp-btn outline" href="booking.html?id=${p.id}&prop=${encodeURIComponent(p.title + ', ' + p.loc)}&price=${p.price}">Enquire</a>
      </div>
    </div>
  </div>`;
}

function casaMapFeedPopupHtml(f) {
  const typeLabel = CASA_FEED_TYPE_LABELS[f.type] || f.type;
  const feedLink = f.feedPostId
    ? `feed.html?county=${CASA_MAP_REGIONS[f.region]?.feedCounty || ''}&post=${f.feedPostId}`
    : `feed.html?county=${CASA_MAP_REGIONS[f.region]?.feedCounty || ''}`;
  return `<div class="casa-popup casa-popup-feed">
    <div class="cp-body">
      <div class="cp-type">${typeof casaFeedPinCode === 'function' ? casaFeedPinCode(f) : 'FD'} · ${typeLabel}</div>
      <strong>${f.name}</strong>
      <div class="cp-loc">${f.loc} · ${f.when}</div>
      <div class="cp-text">${f.text}</div>
      <div class="cp-actions">
        <a class="cp-btn primary" href="${feedLink}">Open in feed</a>
      </div>
    </div>
  </div>`;
}

function casaMapOpenMarkerPopup(marker, id) {
  if (casaMapState.openPopup && casaMapState.openPopup !== id) {
    casaMapInstance.closePopup();
  }
  marker.openPopup();
  casaMapState.openPopup = id;
}

function casaMapFilterItems(items) {
  let list = items.filter(x => x.region === casaMapState.region);
  if (casaMapState.subarea) {
    list = list.filter(x => casaMapItemInSubarea(x, casaMapState.region, casaMapState.subarea));
  }
  if (casaMapState.search) {
    const q = casaMapState.search.toLowerCase();
    list = list.filter(x =>
      (x.title && x.title.toLowerCase().includes(q)) ||
      (x.loc && x.loc.toLowerCase().includes(q)) ||
      (x.text && x.text.toLowerCase().includes(q)) ||
      (x.name && x.name.toLowerCase().includes(q))
    );
  }
  return list;
}

function casaMapSearchEverywhere(q) {
  const query = q.trim().toLowerCase();
  if (!query) return { regions: [], subareas: [], stays: [], posts: [] };

  const regions = [];
  const subareas = [];

  Object.entries(CASA_MAP_REGIONS).forEach(([rid, r]) => {
    const hay = `${r.label} ${r.county} ${rid}`.toLowerCase();
    if (hay.includes(query)) {
      regions.push({ type: 'region', regionId: rid, label: r.label, sub: r.county });
    }
    if (r.subareas) {
      Object.entries(r.subareas).forEach(([sid, sa]) => {
        const subHay = `${sa.label} ${(sa.towns || []).join(' ')}`.toLowerCase();
        if (subHay.includes(query)) {
          subareas.push({ type: 'subarea', regionId: rid, subareaId: sid, label: sa.label, sub: r.label });
        }
      });
    }
  });

  const props = casaMapAllProperties().filter(p =>
    (p.title && p.title.toLowerCase().includes(query)) ||
    (p.loc && p.loc.toLowerCase().includes(query))
  ).slice(0, 8);

  const feed = casaMapAllFeed().filter(f =>
    (f.text && f.text.toLowerCase().includes(query)) ||
    (f.loc && f.loc.toLowerCase().includes(query)) ||
    (f.name && f.name.toLowerCase().includes(query))
  ).slice(0, 6);

  return { regions, subareas, stays: props, posts: feed };
}

function casaMapSyncUrl() {
  const opts = {};
  if (casaMapState.region !== 'all') opts.region = casaMapState.region;
  if (casaMapState.subarea) opts.subarea = casaMapState.subarea;
  if (casaMapState.activePin) {
    if (casaMapState.activePin.startsWith('p-')) opts.property = casaMapState.activePin.slice(2);
    else if (casaMapState.activePin.startsWith('f-')) opts.pin = casaMapState.activePin.slice(2);
  }
  const url = typeof casaMapUrl === 'function' ? casaMapUrl(opts) : 'map.html';
  history.replaceState(null, '', url);
}

function casaMapSetMobileTab(tab) {
  casaMapState.mobileTab = tab;
  const sidebar = document.querySelector('.map-sidebar');
  sidebar?.classList.toggle('tab-areas', tab === 'areas');
  sidebar?.classList.toggle('tab-results', tab === 'results');
  document.querySelectorAll('.map-mobile-tabs button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

function casaMapRenderSubareaChips() {
  const wrap = document.getElementById('subareaChips');
  if (!wrap) return;

  const r = CASA_MAP_REGIONS[casaMapState.region];
  const subs = r?.subareas ? Object.entries(r.subareas) : [];

  if (casaMapState.region === 'all' || !subs.length) {
    wrap.classList.add('hidden');
    wrap.innerHTML = '';
    return;
  }

  wrap.classList.remove('hidden');
  let html = `<button type="button" class="subarea-chip${!casaMapState.subarea ? ' active' : ''}" onclick="casaMapSelectSubarea('${casaMapState.region}', null)">All ${r.label}</button>`;
  subs.forEach(([sid, sa]) => {
    const sc = typeof casaMapCountForSubarea === 'function'
      ? casaMapCountForSubarea(casaMapState.region, sid)
      : { stays: 0, feed: 0 };
    html += `<button type="button" class="subarea-chip${casaMapState.subarea === sid ? ' active' : ''}" onclick="casaMapSelectSubarea('${casaMapState.region}', '${sid}')">${sa.label} <span style="opacity:.6;font-size:10px">(${sc.stays + sc.feed})</span></button>`;
  });
  wrap.innerHTML = html;
}

function casaMapRenderTree() {
  const totals = casaMapTotalCounts();
  const tree = document.getElementById('countyTree');
  let html = `
    <button type="button" class="tree-all${casaMapState.region === 'all' ? ' active' : ''}" onclick="casaMapSelectRegion('all')">
      <span class="ta-code">UK</span>
      <span class="ta-label">All <i>UK</i></span>
      <span class="ta-meta">${totals.stays} stays · ${totals.feed} posts</span>
    </button>`;

  CASA_MAP_TREE.forEach(country => {
    const counts = casaMapCountForCountry(country.id);
    const open = casaMapState.expandedCountries.has(country.id);
    html += `
      <div class="tree-country${open ? ' open' : ''}" data-country="${country.id}">
        <button type="button" class="tree-country-btn" onclick="casaMapToggleCountry('${country.id}')">
          <svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
          <span><span class="region-code">${typeof casaCountryCode === 'function' ? casaCountryCode(country.id) : country.id.toUpperCase()}</span> ${country.label}</span>
          <span class="tc-count">${counts.stays} stays</span>
        </button>
        <div class="tree-regions">`;

    country.regions.forEach(rid => {
      const r = CASA_MAP_REGIONS[rid];
      const c = casaMapCountForRegion(rid);
      const subareas = r.subareas ? Object.entries(r.subareas) : [];
      const regionOpen = casaMapState.expandedRegions.has(rid);
      const isActive = casaMapState.region === rid;
      html += `
        <div class="tree-region-wrap${regionOpen ? ' open' : ''}">
          <div class="tree-region-row">
            <button type="button" class="tree-region${isActive ? ' active' : ''}"
                    onclick="casaMapSelectRegion('${rid}')">
              <span class="tr-code">${typeof casaRegionCode === 'function' ? casaRegionCode(rid) : rid.slice(0, 2).toUpperCase()}</span>
              <span class="tr-body">
                <div class="tr-name">${casaMapFormatRegionName(r.label)}</div>
                <div class="tr-sub">${r.county} · ${c.stays} stays · ${c.feed} posts</div>
              </span>
              ${!subareas.length ? '<span class="tr-badge">Explore</span>' : ''}
            </button>
            ${subareas.length ? `<button type="button" class="tree-expand" aria-label="Expand areas" onclick="casaMapToggleRegionTree('${rid}')"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>` : ''}
          </div>`;
      if (subareas.length) {
        html += `<div class="tree-subareas">`;
        subareas.forEach(([sid, sa]) => {
          const sc = typeof casaMapCountForSubarea === 'function'
            ? casaMapCountForSubarea(rid, sid)
            : { stays: 0, feed: 0 };
          html += `
            <button type="button" class="tree-subarea${casaMapState.region === rid && casaMapState.subarea === sid ? ' active' : ''}"
                    onclick="casaMapSelectSubarea('${rid}','${sid}')">
              ${sa.label}
              <span class="ts-count">${sc.stays + sc.feed}</span>
            </button>`;
        });
        html += `</div>`;
      }
      html += `</div>`;
    });

    html += `</div></div>`;
  });

  tree.innerHTML = html;
}

function casaMapToggleRegionTree(id) {
  if (casaMapState.expandedRegions.has(id)) casaMapState.expandedRegions.delete(id);
  else casaMapState.expandedRegions.add(id);
  casaMapRenderTree();
}

function casaMapToggleCountry(id) {
  if (casaMapState.expandedCountries.has(id)) casaMapState.expandedCountries.delete(id);
  else casaMapState.expandedCountries.add(id);
  casaMapRenderTree();
}

function casaMapUpdateBreadcrumb() {
  const el = document.getElementById('mapBreadcrumb');
  if (casaMapState.region === 'all') {
    el.innerHTML = '<span class="now">United Kingdom</span>';
    return;
  }
  const r = CASA_MAP_REGIONS[casaMapState.region];
  const country = CASA_MAP_TREE.find(c => c.regions.includes(casaMapState.region));
  const sa = casaMapState.subarea && r.subareas?.[casaMapState.subarea];
  let html = `
    <a href="#" onclick="casaMapSelectRegion('all');return false">UK</a>
    <span class="sep">/</span>
    <span>${country?.label || ''}</span>
    <span class="sep">/</span>
    <a href="#" onclick="casaMapSelectRegion('${casaMapState.region}');return false">${r.label}</a>`;
  if (sa) {
    html += `<span class="sep">/</span><span class="now">${sa.label}</span>`;
  } else {
    html = html.replace(
      new RegExp(`<a href="#" onclick="casaMapSelectRegion\\('${casaMapState.region}'\\);return false">${r.label}<\\/a>`),
      `<span class="now">${r.label}</span>`
    );
  }
  el.innerHTML = html;
}

function casaMapRegionBlurb(region, subareaLabel, counts) {
  const live = typeof CASA_CONFIG !== 'undefined' && CASA_CONFIG.mode === 'live';
  const staysWord = counts.stays === 1 ? 'stay' : 'stays';
  const previewNote = counts.stays
    ? `${counts.stays} ${live ? staysWord : `preview ${staysWord}`}`
    : (live ? 'No stays' : 'Preview listings');
  const feedNote = counts.feed ? ` · ${counts.feed} feed ${counts.feed === 1 ? 'post' : 'posts'}` : '';
  const place = subareaLabel || region.label;
  const desc = region.blurb || region.activity || '';
  return `${previewNote}${feedNote} in ${place}. ${desc}`;
}

function casaMapUpdateRegionCard() {
  const card = document.getElementById('regionCard');
  const hint = document.getElementById('mapHint');
  const overviewPrompt = document.getElementById('mapOverviewPrompt');
  const canvas = document.querySelector('.map-canvas');
  if (casaMapState.region === 'all') {
    card.classList.add('hidden');
    if (hint) hint.textContent = 'Stays and feed pins appear once you pick a region';
    overviewPrompt?.classList.remove('hidden');
    canvas?.classList.add('is-overview');
    return;
  }
  overviewPrompt?.classList.add('hidden');
  canvas?.classList.remove('is-overview');
  const r = CASA_MAP_REGIONS[casaMapState.region];
  const sa = casaMapState.subarea && r.subareas?.[casaMapState.subarea];
  const c = casaMapState.subarea && typeof casaMapCountForSubarea === 'function'
    ? casaMapCountForSubarea(casaMapState.region, casaMapState.subarea)
    : casaMapCountForRegion(casaMapState.region);
  card.classList.remove('hidden');
  document.getElementById('rcTitle').innerHTML = sa
    ? casaMapFormatRegionName(sa.label)
    : casaMapFormatRegionName(r.label);
  document.getElementById('rcMeta').textContent = sa
    ? `${sa.label} · ${r.county} · ${CASA_MAP_TREE.find(x => x.regions.includes(casaMapState.region))?.label || 'UK'}`
    : `${r.county} · ${CASA_MAP_TREE.find(x => x.regions.includes(casaMapState.region))?.label || 'UK'}`;
  document.getElementById('rcStays').textContent = c.stays;
  document.getElementById('rcFeed').textContent = c.feed;
  document.getElementById('rcBlurb').textContent = casaMapRegionBlurb(r, sa?.label, c);
  document.getElementById('rcBrowse').href = r.browseUrl + (casaMapState.subarea ? `&subarea=${casaMapState.subarea}` : '');
  document.getElementById('rcFeedLink').href = r.feedUrl;
  hint.textContent = sa
    ? `Showing ${sa.label} — tap pins or use the list below`
    : 'Tap a neighbourhood outline, pin, or list item for details';
}

function casaMapHighlightPolygons() {
  const isOverview = casaMapState.region === 'all';

  casaPolygonLayer.eachLayer(layer => {
    const rid = layer.regionId;
    if (isOverview) {
      layer.setStyle({ fillOpacity: 0.04, weight: 2, color: '#B05533', opacity: 1 });
    } else if (rid === casaMapState.region) {
      layer.setStyle({ fillOpacity: 0.06, weight: 2, color: '#8E4326', opacity: 1 });
      layer.bringToFront();
    } else {
      layer.setStyle({ fillOpacity: 0, weight: 0, opacity: 0 });
    }
  });

  casaSubareaLayer.clearLayers();
  if (isOverview || !CASA_MAP_REGIONS[casaMapState.region]?.subareas) return;

  Object.entries(CASA_MAP_REGIONS[casaMapState.region].subareas).forEach(([sid, sa]) => {
    if (!sa.polygon?.length) return;
    const active = casaMapState.subarea === sid;
    const poly = L.polygon(sa.polygon, {
      color: active ? '#4D5C40' : '#8DA88A',
      weight: active ? 2.5 : 1.5,
      fillColor: active ? '#4D5C40' : '#8DA88A',
      fillOpacity: active ? 0.14 : 0.06,
      className: 'casa-subarea-poly',
    });
    poly.bindTooltip(sa.label, { sticky: true, className: 'casa-region-tip', direction: 'center' });
    poly.on('mouseover', () => {
      if (!active) poly.setStyle({ fillOpacity: 0.12, weight: 2 });
    });
    poly.on('mouseout', () => {
      if (!active) poly.setStyle({ fillOpacity: 0.06, weight: 1.5 });
    });
    poly.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      casaMapSelectSubarea(casaMapState.region, sid);
    });
    casaSubareaLayer.addLayer(poly);
  });
}

function casaMapRenderMarkers(reopenPin) {
  const pinToReopen = reopenPin || casaMapState.activePin;

  casaMarkerLayer.clearLayers();
  casaMarkerRegistry = new Map();
  if (casaClusterGroup) {
    casaMapInstance.removeLayer(casaClusterGroup);
    casaClusterGroup.clearLayers();
  }

  const showProps = casaMapState.layer === 'both' || casaMapState.layer === 'props';
  const showFeed = casaMapState.layer === 'both' || casaMapState.layer === 'feed';

  if (casaMapState.region === 'all') return;

  const props = casaMapFilterItems(casaMapAllProperties());
  const feed = casaMapFilterItems(casaMapAllFeed());
  const useCluster = (props.length + feed.length) > 1;

  if (useCluster) casaClusterGroup.addTo(casaMapInstance);

  function addMarker(m) {
    if (useCluster) casaClusterGroup.addLayer(m);
    else casaMarkerLayer.addLayer(m);
  }

  if (showProps) {
    props.forEach(p => {
      if (p.lat == null || p.lng == null) return;
      const pinId = 'p-' + p.id;
      const icon = L.divIcon({
        className: '',
        html: `<div class="casa-pin-stay${casaMapState.activePin === pinId ? ' active' : ''}">£${p.price}</div>`,
        iconSize: [72, 28],
        iconAnchor: [36, 14],
      });
      const m = L.marker([p.lat, p.lng], { icon });
      m.bindPopup(casaMapStayPopupHtml(p), {
        maxWidth: 280,
        className: 'casa-leaflet-popup',
        autoPan: true,
        autoPanPadding: [80, 80],
      });
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        casaMapFocusProperty(p.id);
        casaMapOpenMarkerPopup(m, pinId);
      });
      addMarker(m);
      casaMarkerRegistry.set(pinId, m);
    });
  }

  if (showFeed) {
    feed.forEach(f => {
      const coords = casaMapFeedCoords(f);
      const pinId = 'f-' + f.id;
      const icon = L.divIcon({
        className: '',
        html: `<div class="casa-pin-feed ${f.type}${casaMapState.activePin === pinId ? ' active' : ''}">${typeof casaFeedPinCode === 'function' ? casaFeedPinCode(f) : 'FD'}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const m = L.marker(coords, { icon });
      m.bindPopup(casaMapFeedPopupHtml(f), {
        maxWidth: 280,
        className: 'casa-leaflet-popup',
        autoPan: true,
        autoPanPadding: [80, 80],
      });
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        casaMapFocusFeed(f.id);
        casaMapOpenMarkerPopup(m, pinId);
      });
      addMarker(m);
      casaMarkerRegistry.set(pinId, m);
    });
  }

  if (pinToReopen && casaMarkerRegistry.has(pinToReopen)) {
    const marker = casaMarkerRegistry.get(pinToReopen);
    const reopen = () => casaMapOpenMarkerPopup(marker, pinToReopen);
    if (casaMapInstance._animatingZoom) {
      casaMapInstance.once('moveend', reopen);
    } else {
      requestAnimationFrame(reopen);
    }
  }
}

function casaMapRenderSearchResults() {
  const container = document.getElementById('listItems');
  const q = casaMapState.search.trim();
  if (!q) return false;

  const hits = casaMapSearchEverywhere(q);
  const total = hits.regions.length + hits.subareas.length + hits.stays.length + hits.posts.length;

  document.getElementById('resultsLabel').textContent = total ? `${total} matches` : 'No matches';

  if (!total) {
    container.innerHTML = `<div class="map-empty"><h3>No matches</h3><p>Try a place name, region, stay, or host. Example: Cornwall, Windermere, hot tub.</p></div>`;
    return true;
  }

  let html = '';

  if (hits.regions.length) {
    html += `<div class="list-section"><span class="dot" style="background:var(--brick)"></span> Regions</div>`;
    html += hits.regions.map(hit => `
      <button type="button" class="map-jump-item" onclick="casaMapSelectRegion('${hit.regionId}')">
        <span class="mj-code">${typeof casaRegionCode === 'function' ? casaRegionCode(hit.regionId) : 'RG'}</span>
        <span class="mj-body"><div class="mj-title">${hit.label}</div><div class="mj-sub">${hit.sub} · open on map</div></span>
      </button>`).join('');
  }

  if (hits.subareas.length) {
    html += `<div class="list-section"><span class="dot" style="background:var(--moss)"></span> Neighbourhoods</div>`;
    html += hits.subareas.map(hit => `
      <button type="button" class="map-jump-item" onclick="casaMapSelectSubarea('${hit.regionId}','${hit.subareaId}')">
        <span class="mj-code">AR</span>
        <span class="mj-body"><div class="mj-title">${hit.label}</div><div class="mj-sub">${hit.sub}</div></span>
      </button>`).join('');
  }

  if (hits.stays.length) {
    html += `<div class="list-section"><span class="dot" style="background:var(--brick)"></span> Stays</div>`;
    html += hits.stays.map(p => `
      <button type="button" class="map-jump-item" onclick="casaMapJumpToStay(${p.id})">
        <span class="mj-code">ST</span>
        <span class="mj-body"><div class="mj-title">${p.title}</div><div class="mj-sub">${p.loc} · £${p.price}/night</div></span>
      </button>`).join('');
  }

  if (hits.posts.length) {
    html += `<div class="list-section"><span class="dot" style="background:var(--moss)"></span> Feed</div>`;
    html += hits.posts.map(f => `
      <button type="button" class="map-jump-item" onclick="casaMapJumpToFeed('${f.id}')">
        <span class="mj-code">${typeof casaFeedPinCode === 'function' ? casaFeedPinCode(f) : 'FD'}</span>
        <span class="mj-body"><div class="mj-title">${f.name}</div><div class="mj-sub">${f.loc} · ${(f.text || '').slice(0, 60)}</div></span>
      </button>`).join('');
  }

  container.innerHTML = html;
  return true;
}

function casaMapRenderList() {
  const container = document.getElementById('listItems');
  const showProps = casaMapState.layer === 'both' || casaMapState.layer === 'props';
  const showFeed = casaMapState.layer === 'both' || casaMapState.layer === 'feed';

  if (casaMapState.search && casaMapRenderSearchResults()) return;

  if (casaMapState.region === 'all') {
    document.getElementById('resultsLabel').textContent = 'UK overview';
    container.innerHTML = `<div class="map-empty"><h3>Search a local area</h3><p>Type a place, region, or stay above — or tap a highlighted region on the map to zoom in and browse Casa listings and community posts nearby.</p></div>`;
    return;
  }

  let props = casaMapFilterItems(casaMapAllProperties());
  let feed = casaMapFilterItems(casaMapAllFeed());

  if (casaMapState.sort === 'price-asc') props = [...props].sort((a, b) => a.price - b.price);
  if (casaMapState.sort === 'price-desc') props = [...props].sort((a, b) => b.price - a.price);
  if (casaMapState.sort === 'rating') props = [...props].sort((a, b) => b.rating - a.rating);

  const total = (showProps ? props.length : 0) + (showFeed ? feed.length : 0);
  const r = CASA_MAP_REGIONS[casaMapState.region];
  const sa = casaMapState.subarea && r.subareas?.[casaMapState.subarea];
  document.getElementById('resultsLabel').textContent = total + ' in ' + (sa ? sa.label : r.label);

  let html = '';
  if (showProps && props.length) {
    html += `<div class="list-section"><span class="dot" style="background:var(--brick)"></span> Stays (${props.length})</div>`;
    html += props.map(p => `
      <a class="map-list-pc${casaMapState.activePin === 'p-' + p.id ? ' active' : ''}" id="lc-${p.id}" href="property.html?id=${p.id}"
         onclick="event.preventDefault();casaMapFocusProperty(${p.id})">
        <div class="thumb" style="background:${p.col}"></div>
        <div class="info">
          <div class="name">${p.title}, <i>${p.loc}</i></div>
          <div class="sub">★ ${p.rating} · Sleeps ${p.sleeps} · ${(p.tags.slice(0, 2).map(t => CASA_MAP_TAG_LABELS[t] || t)).join(' · ')}</div>
          <div class="foot"><span class="price"><i>£${p.price}</i> / night</span><span style="color:var(--moss);font-size:10px">£0 fee</span></div>
        </div>
      </a>`).join('');
  }

  if (showFeed && feed.length) {
    html += `<div class="list-section"><span class="dot" style="background:var(--moss)"></span> Feed (${feed.length})</div>`;
    html += feed.map(f => {
      const feedHref = f.feedPostId
        ? `feed.html?county=${CASA_MAP_REGIONS[casaMapState.region]?.feedCounty || ''}&post=${f.feedPostId}`
        : `feed.html?county=${CASA_MAP_REGIONS[casaMapState.region]?.feedCounty || ''}`;
      return `
      <div class="map-list-ac${casaMapState.activePin === 'f-' + f.id ? ' active' : ''}" id="lac-${f.id}" onclick="casaMapFocusFeed('${f.id}')">
        <div class="ac-ico ${f.type}">${typeof casaFeedPinCode === 'function' ? casaFeedPinCode(f) : 'FD'}</div>
        <div>
          <div class="ac-text"><strong>${f.name}</strong> — ${f.text}</div>
          <div class="ac-meta">${CASA_FEED_TYPE_LABELS[f.type]} · ${f.loc} · ${f.when}${f.live ? ' · live' : ''}</div>
          <a href="${feedHref}" style="font-size:11px;color:var(--brick);margin-top:4px;display:inline-block" onclick="event.stopPropagation()">Open in feed →</a>
        </div>
      </div>`;
    }).join('');
  }

  if (!html) {
    const layerHint = casaMapState.layer === 'props' ? 'stays' : casaMapState.layer === 'feed' ? 'feed posts' : 'results';
    html = `<div class="map-empty"><h3>No ${layerHint} here</h3><p>Try another neighbourhood chip, switch layers, or clear your search.</p></div>`;
  }

  container.innerHTML = html;
}

function casaMapRefreshView(opts = {}) {
  const reopenPin = opts.reopenPin !== false ? casaMapState.activePin : null;
  casaMapRenderSubareaChips();
  casaMapRenderTree();
  casaMapUpdateBreadcrumb();
  casaMapUpdateRegionCard();
  casaMapUpdateModeUi();
  casaMapHighlightPolygons();
  casaMapRenderMarkers(reopenPin);
  casaMapRenderList();
  casaMapSyncUrl();
  casaMapSyncLayerUi();

  if (opts.scrollTo) {
    requestAnimationFrame(() => {
      document.getElementById(opts.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
}

function casaMapSyncLayerUi() {
  document.querySelectorAll('.layer-row button, .map-float-btn[data-layer]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layer === casaMapState.layer);
  });
}

function casaMapExpandForRegion(regionId) {
  const country = CASA_MAP_TREE.find(c => c.regions.includes(regionId));
  if (country) casaMapState.expandedCountries.add(country.id);
  casaMapState.expandedRegions.add(regionId);
}

function casaMapSelectRegion(regionId, opts = {}) {
  casaMapState.region = regionId;
  if (!opts.keepSubarea) casaMapState.subarea = null;
  if (!opts.keepPin) casaMapState.activePin = null;

  if (regionId !== 'all') {
    casaMapExpandForRegion(regionId);
    if (!opts.skipFly) casaMapFlyToRegionBounds(regionId, casaMapState.subarea);
    casaMapSetMobileTab('results');
  } else {
    casaMapState.subarea = null;
    if (!opts.skipFly) casaMapFlyToUk();
  }

  casaMapRefreshView();
}

function casaMapSelectSubarea(regionId, subareaId, opts = {}) {
  casaMapState.region = regionId;
  casaMapState.subarea = subareaId || null;
  if (!opts.keepPin) casaMapState.activePin = null;
  casaMapExpandForRegion(regionId);
  if (!opts.skipFly) casaMapFlyToRegionBounds(regionId, casaMapState.subarea);
  casaMapSetMobileTab('results');
  casaMapRefreshView();
}

function casaMapSetLayer(layer, btn) {
  casaMapState.layer = btn?.dataset?.layer || layer;
  casaMapSyncLayerUi();
  casaMapRenderMarkers(casaMapState.activePin);
  casaMapRenderList();
}

function casaMapSetSort(value) {
  casaMapState.sort = value;
  casaMapRenderList();
}

function casaMapOnSearch(val) {
  casaMapState.search = val.trim();
  const clearBtn = document.getElementById('mapSearchClear');
  clearBtn?.classList.toggle('visible', !!casaMapState.search);
  const input = document.getElementById('mapSearch');
  if (input) input.placeholder = casaMapState.region === 'all'
    ? 'Search place, region, stay, or host…'
    : 'Filter this area…';
  casaMapRenderMarkers(casaMapState.activePin);
  casaMapRenderList();
}

function casaMapClearSearch() {
  const input = document.getElementById('mapSearch');
  if (input) input.value = '';
  casaMapOnSearch('');
}

function casaMapApplyLocation(regionId, subareaId, opts = {}) {
  casaMapState.region = regionId;
  casaMapState.subarea = subareaId || null;
  if (!opts.keepPin) casaMapState.activePin = null;
  if (regionId !== 'all') casaMapExpandForRegion(regionId);
  if (!opts.skipFly) {
    if (regionId === 'all') casaMapFlyToUk();
    else casaMapFlyToRegionBounds(regionId, casaMapState.subarea);
  }
}

function casaMapFocusProperty(id) {
  const props = casaMapAllProperties();
  const p = props.find(x => x.id === Number(id)) || (typeof getCasaProperty === 'function' ? getCasaProperty(id) : null);
  if (!p) return;

  const sa = typeof casaMapResolveSubarea === 'function' ? casaMapResolveSubarea(p) : null;
  casaMapState.activePin = 'p-' + id;

  const needsMove = p.region !== casaMapState.region || (sa && sa !== casaMapState.subarea);
  if (needsMove) {
    casaMapApplyLocation(p.region, sa, { keepPin: true });
  }

  casaMapRefreshView({ scrollTo: 'lc-' + id, reopenPin: casaMapState.activePin });

  if (p.lat != null && p.lng != null) {
    casaMapInstance.panTo([p.lat, p.lng], { animate: true, duration: 0.35 });
  }
}

function casaMapFocusFeed(id) {
  const f = casaMapAllFeed().find(x => x.id === id);
  if (!f) return;

  casaMapState.activePin = 'f-' + id;
  const needsMove = f.region !== casaMapState.region || (f.subarea && f.subarea !== casaMapState.subarea);

  if (needsMove) {
    casaMapApplyLocation(f.region, f.subarea || null, { keepPin: true });
  }

  casaMapRefreshView({ scrollTo: 'lac-' + id, reopenPin: casaMapState.activePin });

  const c = casaMapFeedCoords(f);
  casaMapInstance.panTo(c, { animate: true, duration: 0.35 });
}

function casaMapJumpToStay(id) {
  const p = casaMapAllProperties().find(x => x.id === Number(id));
  if (!p?.region) return;
  const sa = typeof casaMapResolveSubarea === 'function' ? casaMapResolveSubarea(p) : null;
  casaMapApplyLocation(p.region, sa);
  casaMapFocusProperty(id);
}

function casaMapJumpToFeed(id) {
  const f = casaMapAllFeed().find(x => x.id === id);
  if (!f) return;
  casaMapApplyLocation(f.region, f.subarea || null);
  casaMapFocusFeed(id);
}

function casaMapApplyDeepLink() {
  const qp = new URLSearchParams(location.search);
  const regionParam = qp.get('region') || qp.get('county');
  const subareaParam = qp.get('subarea');
  const pinParam = qp.get('pin');
  const propertyParam = qp.get('property');
  const postParam = qp.get('post');

  if (regionParam) {
    const key = typeof casaMapNormalizeRegion === 'function'
      ? casaMapNormalizeRegion(regionParam)
      : (regionParam === 'cumbria' ? 'lake-district' : regionParam);
    if (CASA_MAP_REGIONS[key]) {
      casaMapApplyLocation(key, subareaParam && CASA_MAP_REGIONS[key].subareas?.[subareaParam] ? subareaParam : null, {
        keepPin: !!(pinParam || propertyParam),
        skipFly: false,
      });
      casaMapRefreshView({ reopenPin: null });
    }
  }

  if (postParam && typeof casaMapFeedByPostId === 'function') {
    const match = casaMapFeedByPostId(postParam);
    if (match) {
      casaMapApplyLocation(match.region, match.subarea || null);
      casaMapRefreshView();
      requestAnimationFrame(() => casaMapFocusFeed(match.id));
      return;
    }
  }

  if (propertyParam) requestAnimationFrame(() => casaMapFocusProperty(propertyParam));
  else if (pinParam) requestAnimationFrame(() => casaMapFocusFeed(pinParam));
}

function casaMapPageInit() {
  casaMapInit();
  casaMapSetMobileTab('areas');
  casaMapRefreshView();
  casaMapApplyDeepLink();
  requestAnimationFrame(() => casaMapInstance.invalidateSize());

  // CASA_PROPERTIES starts as the 36 seed listings (instant paint);
  // refresh from Supabase right after so real listings published via
  // list.html — which only exist in the database — show up too.
  if (typeof casaRefreshProperties === 'function') {
    casaRefreshProperties().then(() => casaMapRefreshView());
  }
}

document.addEventListener('DOMContentLoaded', casaMapPageInit);

/* Global handlers for inline HTML */
window.casaMapSelectRegion = casaMapSelectRegion;
window.casaMapSelectSubarea = casaMapSelectSubarea;
window.casaMapToggleRegionTree = casaMapToggleRegionTree;
window.casaMapToggleCountry = casaMapToggleCountry;
window.casaMapSetLayer = casaMapSetLayer;
window.casaMapOnSearch = casaMapOnSearch;
window.casaMapClearSearch = casaMapClearSearch;
window.casaMapFocusProperty = casaMapFocusProperty;
window.casaMapFocusFeed = casaMapFocusFeed;
window.casaMapBackToUk = casaMapBackToUk;
window.casaMapEnterRegion = casaMapEnterRegion;
window.casaMapSetMobileTab = casaMapSetMobileTab;
window.casaMapJumpToStay = casaMapJumpToStay;
window.casaMapSetSort = casaMapSetSort;
window.casaMapRenderList = casaMapRenderList;
window.casaMapState = casaMapState;
window.selectRegion = casaMapSelectRegion;
window.selectSubarea = casaMapSelectSubarea;
window.backToUk = casaMapBackToUk;
window.setLayer = casaMapSetLayer;
window.onSearch = casaMapOnSearch;
window.focusProperty = casaMapFocusProperty;
window.focusFeed = casaMapFocusFeed;
