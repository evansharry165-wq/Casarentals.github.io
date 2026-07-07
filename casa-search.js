/* ──────────────────────────────────────────────────────────
   CASA · shared search engine
   One implementation for every search bar on the site:
   · location autocomplete (all regions + towns from the catalogue)
   · interactive date-range calendar (two months, range select)
   · interactive guests picker (adults / children / infants / pets)

   Requires CASA_PROPERTIES (casa-properties.js) loaded first.
   Wire a bar with casaInitSearch(rootEl, opts). Markup uses data-*
   hooks (see home/browse) so the same code drives different layouts.
   ────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  var PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-6-7-12a7 7 0 1 1 14 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
  var GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/></svg>';

  // CASA_PROPERTIES is a top-level `const` in casa-properties.js — a global
  // lexical binding, NOT a window property — so reference it by name (guarded).
  function props() { return (typeof CASA_PROPERTIES !== 'undefined' && CASA_PROPERTIES) || []; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function fmtShort(d) { return d ? (d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3)) : null; }
  function iso(d) { return d ? (d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')) : ''; }

  // ── Location index (regions + unique towns), derived live ──
  function locationIndex() {
    var regions = {}, seen = {}, towns = [];
    props().forEach(function (p) {
      if (p.region) {
        if (!regions[p.region]) regions[p.region] = { region: p.region, labels: {}, count: 0 };
        regions[p.region].count++;
        if (p.rLabel) regions[p.region].labels[p.rLabel] = (regions[p.region].labels[p.rLabel] || 0) + 1;
      }
      if (p.loc && !seen[p.loc]) { seen[p.loc] = 1; towns.push({ loc: p.loc, rLabel: p.rLabel, region: p.region }); }
    });
    return {
      regions: Object.keys(regions).map(function (k) {
        var r = regions[k];
        var best = Object.keys(r.labels).sort(function (a, b) { return r.labels[b] - r.labels[a]; })[0];
        return { region: r.region, label: best || r.region, count: r.count };
      }).sort(function (a, b) { return b.count - a.count; }),
      towns: towns.sort(function (a, b) { return a.loc.localeCompare(b.loc); })
    };
  }
  window.casaLocationIndex = locationIndex;
  window.casaRegionSlugForLabel = function (label) {
    var lc = (label || '').toLowerCase();
    var r = locationIndex().regions.find(function (x) { return x.label.toLowerCase() === lc || x.region === lc; });
    return r ? r.region : '';
  };

  function initSearch(root, opts) {
    if (!root) return null;
    opts = opts || {};
    var live = opts.mode === 'filter';
    var qs = function (s) { return root.querySelector(s); };
    var whereInput = qs('[data-where-input]');
    var wherePop = qs('[data-where-pop]');
    var calPop = qs('[data-cal-pop]');
    var checkinEl = qs('[data-checkin]');
    var checkoutEl = qs('[data-checkout]');
    var guestPop = qs('[data-guest-pop]');
    var guestsEl = qs('[data-guests-label]');
    var goBtn = qs('[data-search-go]');

    var state = { region: '', where: '', checkin: null, checkout: null, adults: 0, children: 0, infants: 0, pets: 0 };
    var calMonth = startOfDay(new Date()); calMonth.setDate(1);

    function closeAll() {
      root.querySelectorAll('.search-pop.open').forEach(function (p) { p.classList.remove('open'); });
      root.querySelectorAll('.seg.seg-open').forEach(function (s) { s.classList.remove('seg-open'); });
    }
    function openPop(pop, seg) { closeAll(); if (pop) pop.classList.add('open'); if (seg) seg.classList.add('seg-open'); }
    function changed() { if (live && opts.onChange) opts.onChange(state); }

    // ── WHERE ──
    function renderWhere(filter) {
      if (!wherePop) return;
      var idx = locationIndex();
      var qf = (filter || '').toLowerCase();
      var regions = idx.regions.filter(function (r) { return !qf || r.label.toLowerCase().indexOf(qf) >= 0 || r.region.indexOf(qf) >= 0; });
      var towns = idx.towns.filter(function (t) { return qf && t.loc.toLowerCase().indexOf(qf) >= 0; }).slice(0, 8);
      var html = '';
      if (!qf) html += '<button type="button" class="where-opt" data-region="">' + GLOBE + ' Anywhere in the UK</button>';
      if (regions.length) {
        html += '<div class="wp-group">Regions</div>';
        html += regions.map(function (r) { return '<button type="button" class="where-opt" data-region="' + r.region + '" data-label="' + esc(r.label) + '">' + PIN + ' ' + esc(r.label) + ' <span class="wo-ct">' + r.count + '</span></button>'; }).join('');
      }
      if (towns.length) {
        html += '<div class="wp-group">Towns &amp; villages</div>';
        html += towns.map(function (t) { return '<button type="button" class="where-opt" data-town="' + esc(t.loc) + '">' + PIN + ' ' + esc(t.loc) + '<span class="wo-sub">, ' + esc(t.rLabel) + '</span></button>'; }).join('');
      }
      if (!regions.length && !towns.length) html = '<div class="wp-empty">No matches — press Enter to search &ldquo;' + esc(filter) + '&rdquo;</div>';
      wherePop.innerHTML = html;
    }
    if (whereInput) {
      whereInput.addEventListener('focus', function () { renderWhere(whereInput.value); openPop(wherePop, whereInput.closest('.seg')); });
      whereInput.addEventListener('input', function () { renderWhere(whereInput.value); openPop(wherePop, whereInput.closest('.seg')); });
      whereInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); state.region = ''; state.where = whereInput.value.trim(); closeAll(); changed(); if (!live) submit(); }
        else if (e.key === 'Escape') closeAll();
      });
    }
    if (wherePop) wherePop.addEventListener('click', function (e) {
      var btn = e.target.closest('.where-opt'); if (!btn) return;
      if (btn.dataset.town) { state.where = btn.dataset.town; state.region = ''; if (whereInput) whereInput.value = btn.dataset.town; }
      else { state.region = btn.dataset.region || ''; state.where = ''; if (whereInput) whereInput.value = btn.dataset.label || ''; }
      closeAll(); changed();
      if (calPop && checkinEl) openPop(calPop, checkinEl.closest('.seg')); // advance to dates
    });

    // ── DATES ──
    function nights() { return (state.checkin && state.checkout) ? Math.round((state.checkout - state.checkin) / 86400000) : 0; }
    function updateDateLabels() {
      var ph = opts.datePlaceholder || 'Add dates';
      if (checkinEl) { checkinEl.textContent = state.checkin ? fmtShort(state.checkin) : ph; checkinEl.classList.toggle('ph-txt', !state.checkin); }
      if (checkoutEl) { checkoutEl.textContent = state.checkout ? fmtShort(state.checkout) : ph; checkoutEl.classList.toggle('ph-txt', !state.checkout); }
    }
    function monthHtml(base, today) {
      var y = base.getFullYear(), m = base.getMonth();
      var startDow = (new Date(y, m, 1).getDay() + 6) % 7;
      var days = new Date(y, m + 1, 0).getDate();
      var cells = '';
      for (var i = 0; i < startDow; i++) cells += '<span class="cal-day empty"></span>';
      for (var d = 1; d <= days; d++) {
        var date = new Date(y, m, d), dis = date < today, cls = 'cal-day';
        if (dis) cls += ' disabled';
        if (sameDay(date, state.checkin) || sameDay(date, state.checkout)) cls += ' selected';
        else if (state.checkin && state.checkout && date > state.checkin && date < state.checkout) cls += ' inrange';
        cells += dis ? '<span class="' + cls + '">' + d + '</span>' : '<button type="button" class="' + cls + '" data-d="' + date.getTime() + '">' + d + '</button>';
      }
      return '<div class="cal-month"><div class="cal-mhead">' + MONTHS[m] + ' ' + y + '</div><div class="cal-grid">' + DOW.map(function (x) { return '<span class="cal-dow">' + x + '</span>'; }).join('') + cells + '</div></div>';
    }
    function renderCal() {
      if (!calPop) return;
      var today = startOfDay(new Date());
      var next = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1);
      calPop.innerHTML =
        '<div class="cal-nav"><button type="button" class="cal-prev" aria-label="Previous month">&lsaquo;</button><button type="button" class="cal-next" aria-label="Next month">&rsaquo;</button></div>' +
        '<div class="cal-months">' + monthHtml(calMonth, today) + monthHtml(next, today) + '</div>' +
        '<div class="cal-foot"><span class="cal-hint">' + (nights() ? nights() + ' night' + (nights() === 1 ? '' : 's') + ' selected' : 'Add your dates') + '</span><button type="button" class="cal-clear" data-cal-clear>Clear</button></div>';
    }
    if (calPop) calPop.addEventListener('click', function (e) {
      if (e.target.closest('.cal-prev')) { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); renderCal(); return; }
      if (e.target.closest('.cal-next')) { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); renderCal(); return; }
      if (e.target.closest('[data-cal-clear]')) { state.checkin = state.checkout = null; renderCal(); updateDateLabels(); changed(); return; }
      var day = e.target.closest('[data-d]'); if (!day) return;
      var date = new Date(parseInt(day.dataset.d, 10));
      if (!state.checkin || (state.checkin && state.checkout)) { state.checkin = date; state.checkout = null; }
      else if (date > state.checkin) { state.checkout = date; }
      else { state.checkin = date; state.checkout = null; }
      renderCal(); updateDateLabels(); changed();
    });
    [checkinEl, checkoutEl].forEach(function (el) {
      if (!el) return; var seg = el.closest('.seg'); if (!seg) return;
      seg.addEventListener('click', function () { renderCal(); openPop(calPop, seg); });
    });

    // ── GUESTS ──
    function guestsTotal() { return state.adults + state.children; }
    function updateGuestsLabel() {
      if (!guestsEl) return;
      var t = guestsTotal(), parts = [];
      if (t) parts.push(t + ' guest' + (t === 1 ? '' : 's'));
      if (state.infants) parts.push(state.infants + ' infant' + (state.infants === 1 ? '' : 's'));
      if (state.pets) parts.push(state.pets + ' pet' + (state.pets === 1 ? '' : 's'));
      guestsEl.textContent = parts.length ? parts.join(' · ') : (opts.guestsPlaceholder || 'Add guests');
      guestsEl.classList.toggle('ph-txt', !parts.length);
    }
    function renderGuests() {
      if (!guestPop) return;
      var rows = [['adults', 'Adults', 'Ages 13+'], ['children', 'Children', 'Ages 2–12'], ['infants', 'Infants', 'Under 2'], ['pets', 'Pets', 'Bringing an animal?']];
      guestPop.innerHTML = rows.map(function (r) {
        var v = state[r[0]];
        return '<div class="guest-row"><div class="gr-txt"><div class="gr-t">' + r[1] + '</div><div class="gr-s">' + r[2] + '</div></div>' +
          '<div class="gr-ctl"><button type="button" class="gr-btn" data-g="' + r[0] + '" data-dir="-1"' + (v <= 0 ? ' disabled' : '') + '>&minus;</button>' +
          '<span class="gr-v">' + v + '</span><button type="button" class="gr-btn" data-g="' + r[0] + '" data-dir="1">+</button></div></div>';
      }).join('');
    }
    if (guestPop) guestPop.addEventListener('click', function (e) {
      var btn = e.target.closest('.gr-btn'); if (!btn) return;
      var key = btn.dataset.g;
      state[key] = Math.max(0, Math.min(16, state[key] + parseInt(btn.dataset.dir, 10)));
      if ((state.children || state.infants) && state.adults < 1) state.adults = 1;
      renderGuests(); updateGuestsLabel(); changed();
    });
    if (guestsEl) { var gseg = guestsEl.closest('.seg'); if (gseg) gseg.addEventListener('click', function () { renderGuests(); openPop(guestPop, gseg); }); }

    // ── submit / navigate ──
    function buildQuery() {
      var p = new URLSearchParams();
      if (state.region) p.set('region', state.region);
      else if (state.where) p.set('where', state.where);
      if (state.checkin) p.set('checkin', iso(state.checkin));
      if (state.checkout) p.set('checkout', iso(state.checkout));
      if (guestsTotal()) p.set('guests', guestsTotal());
      if (state.pets) p.set('pets', '1');
      return p.toString();
    }
    function submit() {
      if (opts.onSubmit) { opts.onSubmit(state, buildQuery()); return; }
      var q = buildQuery();
      window.location.href = 'browse.html' + (q ? '?' + q : '');
    }
    if (goBtn) goBtn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); submit(); });

    document.addEventListener('click', function (e) { if (!e.target.closest('[data-search]')) closeAll(); });

    // hydrate from URL (browse arrives pre-filtered)
    if (opts.readUrl) {
      var u = new URLSearchParams(location.search);
      if (u.get('region')) { state.region = u.get('region'); var r = locationIndex().regions.find(function (x) { return x.region === state.region; }); if (whereInput) whereInput.value = r ? r.label : ''; }
      else if (u.get('where')) { state.where = u.get('where'); if (whereInput) whereInput.value = state.where; }
      var g = parseInt(u.get('guests'), 10); if (!isNaN(g) && g > 0) state.adults = g;
      if (u.get('pets')) state.pets = 1;
    }

    updateDateLabels(); updateGuestsLabel();
    return { state: state, submit: submit, setLocation: function (region, where) { state.region = region || ''; state.where = where || ''; if (whereInput) { var r = locationIndex().regions.find(function (x) { return x.region === region; }); whereInput.value = r ? r.label : (where || ''); } } };
  }

  window.casaInitSearch = initSearch;
})();
