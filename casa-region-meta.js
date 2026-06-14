/**
 * Casa region metadata — codes, labels, and honest listing counts
 */
const CASA_REGION_UI = {
  all: { code: 'UK', label: 'All UK', county: 'United Kingdom', mapTitle: 'The whole <i>UK</i>' },
  'lake-district': { code: 'LD', label: 'Lake District', county: 'Cumbria', mapTitle: 'The <i>Lake District</i>' },
  cornwall: { code: 'COR', label: 'Cornwall', county: 'Cornwall', mapTitle: '<i>Cornwall</i>' },
  highlands: { code: 'HI', label: 'Scottish Highlands', county: 'Scotland', mapTitle: 'The <i>Highlands</i>' },
  norfolk: { code: 'NF', label: 'Norfolk', county: 'East Anglia', mapTitle: '<i>Norfolk</i>' },
  yorkshire: { code: 'YK', label: 'Yorkshire', county: 'Yorkshire', mapTitle: '<i>Yorkshire</i>' },
  cotswolds: { code: 'CT', label: 'Cotswolds', county: 'Gloucestershire', mapTitle: 'The <i>Cotswolds</i>' },
  skye: { code: 'SK', label: 'Isle of Skye', county: 'Scotland', mapTitle: '<i>Isle of Skye</i>' },
  snowdonia: { code: 'SN', label: 'Snowdonia', county: 'Wales', mapTitle: '<i>Snowdonia</i>' },
  pembrokeshire: { code: 'PEM', label: 'Pembrokeshire', county: 'Wales', mapTitle: '<i>Pembrokeshire</i>' },
  causeway: { code: 'CC', label: 'Causeway Coast', county: 'N. Ireland', mapTitle: '<i>Causeway Coast</i>' },
};

const CASA_COUNTRY_UI = {
  england: { code: 'EN', label: 'England' },
  scotland: { code: 'SC', label: 'Scotland' },
  wales: { code: 'WA', label: 'Wales' },
  ni: { code: 'NI', label: 'Northern Ireland' },
};

const CASA_FEED_PIN_CODES = {
  avail: 'AV',
  tip: 'TIP',
  review: 'RV',
  photo: 'PH',
  looking: 'LK',
};

function casaCountByRegionId(region) {
  if (typeof CASA_PROPERTIES === 'undefined') return 0;
  if (!region || region === 'all') return CASA_PROPERTIES.length;
  return CASA_PROPERTIES.filter(p => p.region === region).length;
}

function casaRegionPriceStats(region) {
  if (typeof CASA_PROPERTIES === 'undefined') return { from: null, avg: null };
  const props = CASA_PROPERTIES.filter(p => region === 'all' || p.region === region);
  if (!props.length) return { from: null, avg: null };
  const prices = props.map(p => p.price);
  return {
    from: Math.min(...prices),
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
  };
}

function casaBuildRegionMeta() {
  const meta = {};
  Object.entries(CASA_REGION_UI).forEach(([key, ui]) => {
    const count = casaCountByRegionId(key);
    const prices = casaRegionPriceStats(key);
    const stayLabel = count === 1 ? 'preview stay' : 'preview stays';
    meta[key] = {
      label: ui.label,
      italic: ui.label.replace(/^The /, ''),
      mapTitle: ui.mapTitle,
      mapSub: count
        ? `${count} ${stayLabel}${ui.county ? ` · ${ui.county}` : ''}`
        : `Preview listings${ui.county ? ` · ${ui.county}` : ''}`,
      from: prices.from != null ? `£${prices.from}` : '—',
      avg: prices.avg != null ? `£${prices.avg}` : '—',
    };
  });
  return meta;
}

function casaRegionCode(regionId) {
  return CASA_REGION_UI[regionId]?.code || regionId?.slice(0, 2).toUpperCase() || 'UK';
}

function casaCountryCode(countryId) {
  return CASA_COUNTRY_UI[countryId]?.code || countryId?.slice(0, 2).toUpperCase() || 'UK';
}

function casaFeedPinCode(item) {
  if (item?.pinCode) return item.pinCode;
  return CASA_FEED_PIN_CODES[item?.type] || 'FD';
}

function casaSyncRegionPillCounts() {
  document.querySelectorAll('.region-pill[data-region]').forEach(btn => {
    const region = btn.dataset.region;
    const count = casaCountByRegionId(region);
    let ct = btn.querySelector('.ct');
    if (!ct) {
      ct = document.createElement('span');
      ct.className = 'ct';
      btn.appendChild(document.createTextNode(' '));
      btn.appendChild(ct);
    }
    ct.textContent = String(count);
  });
}

window.casaBuildRegionMeta = casaBuildRegionMeta;
window.casaRegionCode = casaRegionCode;
window.casaCountryCode = casaCountryCode;
window.casaFeedPinCode = casaFeedPinCode;
window.casaSyncRegionPillCounts = casaSyncRegionPillCounts;
window.CASA_REGION_UI = CASA_REGION_UI;
