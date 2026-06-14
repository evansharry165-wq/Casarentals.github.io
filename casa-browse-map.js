/** Leaflet mini-map for browse.html sidebar */
let casaBrowseMap = null;
let casaBrowseMarkers = [];

function casaInitBrowseMap() {
  const el = document.getElementById('miniMapLeaflet');
  if (!el || typeof L === 'undefined' || casaBrowseMap) return;

  casaBrowseMap = L.map(el, {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
  }).setView([54.5, -3.5], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(casaBrowseMap);
  window.casaBrowseMap = casaBrowseMap;
}

function casaUpdateBrowseMap(props, regionKey) {
  if (!document.getElementById('miniMapLeaflet')) return;
  if (!casaBrowseMap) casaInitBrowseMap();
  if (!casaBrowseMap) return;

  casaBrowseMarkers.forEach(m => casaBrowseMap.removeLayer(m));
  casaBrowseMarkers = [];

  (props || []).forEach(p => {
    if (p.lat == null || p.lng == null) return;
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: 7,
      color: '#8E4326',
      fillColor: '#B05533',
      fillOpacity: 0.9,
      weight: 2,
    }).bindPopup(`<strong>${p.title}</strong><br>${p.loc}<br>£${p.price}/night`);
    marker.addTo(casaBrowseMap);
    casaBrowseMarkers.push(marker);
  });

  const centre = typeof CASA_REGION_COORDS !== 'undefined'
    ? CASA_REGION_COORDS[regionKey]
    : null;

  if (regionKey && regionKey !== 'all' && centre) {
    casaBrowseMap.setView([centre.lat, centre.lng], 8);
  } else if (casaBrowseMarkers.length) {
    casaBrowseMap.fitBounds(L.featureGroup(casaBrowseMarkers).getBounds().pad(0.15));
  } else {
    casaBrowseMap.setView([54.5, -3.5], 6);
  }

  requestAnimationFrame(() => casaBrowseMap.invalidateSize());
}

window.casaInitBrowseMap = casaInitBrowseMap;
window.casaUpdateBrowseMap = casaUpdateBrowseMap;
