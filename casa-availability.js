/**
 * Casa availability — one calendar per property, optional iCal import from OTAs
 * Preview: stored in localStorage; at launch, server-side sync replaces the stub.
 */
const CASA_AVAIL_KEY = 'casa:availability';
const CASA_FEED_DRAFT_KEY = 'casa:feed-draft';

const CASA_HOST_PROP_IDS = { stone: 1, barn: 2 };
const CASA_PROP_HOST_KEYS = { 1: 'stone', 2: 'barn' };

const CASA_CAL_PLATFORMS = {
  airbnb: { label: 'Airbnb', color: '#FF5A5F' },
  booking: { label: 'Booking.com', color: '#003580' },
  vrbo: { label: 'Vrbo', color: '#3D5A80' },
  other: { label: 'Other calendar', color: '#5A6078' },
};

function casaAvailIso(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function casaAvailParseIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function casaAvailLoad() {
  try {
    const raw = JSON.parse(localStorage.getItem(CASA_AVAIL_KEY) || 'null');
    if (raw?.properties) return raw;
  } catch { /* ignore */ }
  return { properties: {}, version: 1 };
}

function casaAvailSave(store) {
  localStorage.setItem(CASA_AVAIL_KEY, JSON.stringify(store));
}

function casaAvailEnsureProperty(propertyId) {
  const store = casaAvailLoad();
  const key = String(propertyId);
  if (!store.properties[key]) {
    store.properties[key] = { days: {}, sources: [] };
  }
  return store;
}

function casaAvailSeedDefaults() {
  const store = casaAvailLoad();
  if (store.seeded) return store;

  const seed = (propertyId, entries) => {
    const key = String(propertyId);
    store.properties[key] = store.properties[key] || { days: {}, sources: [] };
    entries.forEach(([iso, meta]) => {
      store.properties[key].days[iso] = meta;
    });
  };

  /* Stone Cottage — July 2026 demo (matches host dashboard) */
  for (let d = 1; d <= 9; d++) {
    seed(1, [[`2026-07-${String(d).padStart(2, '0')}`, { status: 'booked', guest: 'Hannah F.', source: 'casa' }]]);
  }
  seed(1, [
    ['2026-07-10', { status: 'blocked', reason: 'blocked', source: 'casa' }],
    ['2026-07-11', { status: 'blocked', reason: 'blocked', source: 'casa' }],
  ]);
  for (let d = 12; d <= 19; d++) {
    seed(1, [[`2026-07-${String(d).padStart(2, '0')}`, { status: 'booked', guest: 'James H.', source: 'casa' }]]);
  }
  for (let d = 26; d <= 28; d++) {
    seed(1, [[`2026-07-${String(d).padStart(2, '0')}`, { status: 'booked', guest: 'Sophie T.', source: 'casa' }]]);
  }

  /* Slate Barn — July 2026 demo */
  seed(2, [
    ['2026-07-03', { status: 'maintenance', source: 'casa' }],
    ['2026-07-04', { status: 'maintenance', source: 'casa' }],
  ]);
  for (let d = 5; d <= 10; d++) {
    seed(2, [[`2026-07-${String(d).padStart(2, '0')}`, { status: 'booked', guest: 'Marcus & O.', source: 'casa' }]]);
  }
  seed(2, [
    ['2026-07-15', { status: 'blocked', reason: 'blocked', source: 'casa' }],
    ['2026-07-16', { status: 'blocked', reason: 'blocked', source: 'casa' }],
  ]);
  for (let d = 20; d <= 25; d++) {
    seed(2, [[`2026-07-${String(d).padStart(2, '0')}`, { status: 'booked', guest: 'Laura P.', source: 'casa' }]]);
  }
  for (let d = 28; d <= 31; d++) {
    seed(2, [[`2026-07-${String(d).padStart(2, '0')}`, { status: 'personal', source: 'casa' }]]);
  }

  store.seeded = true;
  casaAvailSave(store);
  return store;
}

function casaAvailPropertyId(hostKeyOrId) {
  if (typeof hostKeyOrId === 'number') return hostKeyOrId;
  return CASA_HOST_PROP_IDS[hostKeyOrId] || Number(hostKeyOrId) || 1;
}

function casaAvailGetDay(propertyId, year, month, day) {
  casaAvailSeedDefaults();
  const iso = casaAvailIso(year, month, day);
  const store = casaAvailLoad();
  return store.properties[String(propertyId)]?.days[iso] || null;
}

/** Returns { type, guest?, source? } for host calendar UI */
function casaAvailDayState(propertyId, year, month, day) {
  const entry = casaAvailGetDay(propertyId, year, month, day);
  if (!entry) return { type: 'open' };
  if (entry.status === 'booked') {
    return { type: 'booked', guest: entry.guest || 'Booked', source: entry.source };
  }
  if (entry.status === 'synced') {
    return { type: 'synced', platform: entry.platform, source: entry.source };
  }
  if (entry.status === 'personal') return { type: 'personal' };
  if (entry.status === 'maintenance') return { type: 'maintenance' };
  if (entry.status === 'blocked' || entry.status === 'hold') return { type: 'blocked' };
  return { type: 'open' };
}

function casaAvailIsUnavailable(propertyId, year, month, day) {
  const s = casaAvailDayState(propertyId, year, month, day);
  return s.type !== 'open';
}

function casaAvailSetDays(propertyId, year, month, days, blockType) {
  const store = casaAvailEnsureProperty(propertyId);
  const key = String(propertyId);
  const statusMap = {
    personal: 'personal',
    maintenance: 'maintenance',
    hold: 'blocked',
    blocked: 'blocked',
    other: 'blocked',
  };
  const status = statusMap[blockType] || 'blocked';

  days.forEach(day => {
    const iso = casaAvailIso(year, month, day);
    const existing = store.properties[key].days[iso];
    if (existing?.status === 'booked') return;
    store.properties[key].days[iso] = { status, reason: blockType, source: 'casa' };
  });
  casaAvailSave(store);
}

function casaAvailClearDays(propertyId, year, month, days) {
  const store = casaAvailEnsureProperty(propertyId);
  const key = String(propertyId);
  days.forEach(day => {
    const iso = casaAvailIso(year, month, day);
    const entry = store.properties[key].days[iso];
    if (entry?.status === 'booked') return;
    delete store.properties[key].days[iso];
  });
  casaAvailSave(store);
}

function casaAvailBookRange(propertyId, year, month, days, guest) {
  const store = casaAvailEnsureProperty(propertyId);
  const key = String(propertyId);
  days.forEach(day => {
    const iso = casaAvailIso(year, month, day);
    store.properties[key].days[iso] = { status: 'booked', guest: guest || 'Guest', source: 'casa' };
  });
  casaAvailSave(store);
}

function casaAvailRangeConflict(propertyId, checkInIso, checkOutIso) {
  casaAvailSeedDefaults();
  const store = casaAvailLoad();
  const days = store.properties[String(propertyId)]?.days || {};
  const start = new Date(checkInIso);
  const end = new Date(checkOutIso);
  if (Number.isNaN(start) || Number.isNaN(end)) return { conflict: false };

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const entry = days[iso];
    if (entry && entry.status !== 'open') {
      return {
        conflict: true,
        date: iso,
        status: entry.status,
        platform: entry.platform,
      };
    }
  }
  return { conflict: false };
}

function casaAvailGetSources(propertyId) {
  casaAvailSeedDefaults();
  const store = casaAvailLoad();
  return store.properties[String(propertyId)]?.sources || [];
}

function casaAvailConnectSource(propertyId, platform, url) {
  const trimmed = String(url || '').trim();
  if (!trimmed || trimmed.length < 8) {
    return { ok: false, error: 'Paste your calendar export link (iCal / .ics URL).' };
  }

  const store = casaAvailEnsureProperty(propertyId);
  const key = String(propertyId);
  const plat = CASA_CAL_PLATFORMS[platform] ? platform : 'other';
  const existing = store.properties[key].sources.find(s => s.platform === plat);
  const source = {
    platform: plat,
    url: trimmed,
    lastSync: new Date().toISOString(),
    readOnly: true,
  };

  if (existing) Object.assign(existing, source);
  else store.properties[key].sources.push(source);

  /* Preview: simulate imported blocks — real launch pulls iCal server-side */
  const today = new Date();
  let added = 0;
  for (let i = 2; i <= 28; i += 4) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    if (!store.properties[key].days[iso] || store.properties[key].days[iso].status === 'open') {
      store.properties[key].days[iso] = {
        status: 'synced',
        source: plat,
        platform: CASA_CAL_PLATFORMS[plat].label,
        readOnly: true,
      };
      added++;
    }
  }

  casaAvailSave(store);
  return { ok: true, added, platform: CASA_CAL_PLATFORMS[plat].label };
}

function casaAvailExportNote(propertyId) {
  return `https://casa.co.uk/calendar/${propertyId}.ics (available at launch — add to Airbnb & Booking.com as import only)`;
}

function casaAvailFormatRange(year, month, days) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sorted = [...days].sort((a, b) => a - b);
  if (!sorted.length) return '';
  if (sorted.length === 1) return `${sorted[0]} ${months[month]}`;
  return `${sorted[0]}–${sorted[sorted.length - 1]} ${months[month]} ${year}`;
}

function casaAvailBuildFeedDraft(propertyId, year, month, days) {
  const prop = typeof getCasaProperty === 'function' ? getCasaProperty(propertyId) : null;
  const range = casaAvailFormatRange(year, month, days);
  const title = prop?.title || 'My place';
  const loc = prop?.loc || 'UK';
  const price = prop?.price;
  const county = prop?.region === 'lake-district' ? 'cumbria' : (prop?.region || 'cumbria');

  const text = price
    ? `${range} now open at ${title}, ${loc}. From £${price}/night — enquire direct, £0 guest fees. #availability #${loc.replace(/\s+/g, '')}`
    : `${range} now open at ${title}, ${loc}. Enquire direct on Casa — £0 guest fees. #availability`;

  const draft = {
    type: 'avail',
    county,
    text,
    propertyId: Number(propertyId),
    where: loc,
    range,
  };
  localStorage.setItem(CASA_FEED_DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

function casaAvailFeedUrl(draft) {
  const p = new URLSearchParams();
  p.set('county', draft.county || 'cumbria');
  p.set('compose', 'avail');
  if (draft.propertyId) p.set('property', draft.propertyId);
  return `feed.html?${p.toString()}`;
}

function casaAvailPostOpening(propertyId, year, month, days) {
  const draft = casaAvailBuildFeedDraft(propertyId, year, month, days);
  return casaAvailFeedUrl(draft);
}

function casaAvailRenderSources(propertyId, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const sources = casaAvailGetSources(propertyId);
  if (!sources.length) {
    el.innerHTML = '<p class="sync-empty">No calendars connected yet — paste an export link below.</p>';
    return;
  }
  el.innerHTML = sources.map(s => {
    const plat = CASA_CAL_PLATFORMS[s.platform] || CASA_CAL_PLATFORMS.other;
    const when = s.lastSync ? new Date(s.lastSync).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
    return `<div class="sync-source-row">
      <span class="sync-dot" style="background:${plat.color}"></span>
      <span class="sync-name">${plat.label}</span>
      <span class="sync-meta">Synced ${when} · read-only</span>
    </div>`;
  }).join('');
}

function casaAvailApplyGuestCalendar(propertyId, year, months, gridSelector) {
  casaAvailSeedDefaults();
  document.querySelectorAll(gridSelector || '.cal-grid').forEach((grid, gridIdx) => {
    const month = months[gridIdx];
    if (month == null) return;
    const cells = grid.querySelectorAll('.d:not(.dn):not(.muted)');
    cells.forEach(cell => {
      const day = parseInt(cell.textContent, 10);
      if (!day || Number.isNaN(day)) return;
      if (casaAvailIsUnavailable(propertyId, year, month - 1, day)) {
        cell.classList.add('unavailable');
        cell.classList.remove('start', 'end', 'in-range');
      }
    });
  });
}

/** Confirmed enquiry ranges from Supabase (availability.sql) — guest-safe, dates only. */
async function casaGetConfirmedRanges(propertyId) {
  if (!window.casaSupabase) return [];
  const { data, error } = await window.casaSupabase.rpc('casa_get_confirmed_ranges', {
    p_property_id: Number(propertyId),
  });
  if (error) {
    console.error('casa_get_confirmed_ranges failed', error);
    return [];
  }
  return data || [];
}

function casaRangesOverlap(checkIn, checkOut, ranges) {
  if (!checkIn || !checkOut || !ranges?.length) return null;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  for (const r of ranges) {
    const rStart = new Date(r.check_in);
    const rEnd = new Date(r.check_out);
    if (start < rEnd && end > rStart) return r;
  }
  return null;
}

function casaFormatBlockedRanges(ranges) {
  if (!ranges?.length) return '';
  const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return ranges.slice(0, 4).map((r) => `${fmt(r.check_in)} – ${fmt(r.check_out)}`).join(' · ');
}

casaAvailSeedDefaults();

window.casaAvailPropertyId = casaAvailPropertyId;
window.casaAvailDayState = casaAvailDayState;
window.casaAvailSetDays = casaAvailSetDays;
window.casaAvailClearDays = casaAvailClearDays;
window.casaAvailBookRange = casaAvailBookRange;
window.casaAvailConnectSource = casaAvailConnectSource;
window.casaAvailGetSources = casaAvailGetSources;
window.casaAvailRangeConflict = casaAvailRangeConflict;
window.casaAvailPostOpening = casaAvailPostOpening;
window.casaAvailBuildFeedDraft = casaAvailBuildFeedDraft;
window.casaAvailRenderSources = casaAvailRenderSources;
window.casaAvailApplyGuestCalendar = casaAvailApplyGuestCalendar;
window.casaAvailExportNote = casaAvailExportNote;
window.casaGetConfirmedRanges = casaGetConfirmedRanges;
window.casaRangesOverlap = casaRangesOverlap;
window.casaFormatBlockedRanges = casaFormatBlockedRanges;
window.CASA_HOST_PROP_IDS = CASA_HOST_PROP_IDS;
window.CASA_CAL_PLATFORMS = CASA_CAL_PLATFORMS;
