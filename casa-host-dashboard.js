/**
 * Host dashboard — unified search across enquiries, listings, tasks, and calendar
 */
const casaHostSearchState = {
  query: '',
  scope: 'all',
  debounceTimer: null,
};

const CASA_HOST_SEARCH_SCOPES = ['all', 'enquiries', 'listings', 'tasks', 'calendar'];

function casaHostTokenize(q) {
  return q.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function casaHostMatchesTokens(haystack, tokens) {
  if (!tokens.length) return true;
  const h = (haystack || '').toLowerCase();
  return tokens.every(t => h.includes(t));
}

function casaHostBuildIndex() {
  const items = [];

  (window.HOST_ENQUIRIES || []).forEach(e => {
    items.push({
      type: 'enquiries',
      id: e.id,
      label: e.name,
      sub: `${e.prop} · ${e.dates} · ${e.statusLabel}`,
      haystack: `${e.name} ${e.sub} ${e.prop} ${e.loc} ${e.dates} ${e.total} ${e.status} ${e.statusLabel}`,
      target: `row-${e.id}`,
      section: 'block-enquiries',
    });
  });

  document.querySelectorAll('.prop-card-h').forEach((el, i) => {
    const title = el.querySelector('.pn')?.textContent || '';
    const loc = el.querySelector('.ploc')?.textContent || '';
    items.push({
      type: 'listings',
      id: `listing-${i}`,
      label: title.replace(/\s+/g, ' ').trim(),
      sub: loc,
      haystack: `${title} ${loc}`,
      target: el.id || `listing-card-${i}`,
      section: 'block-listings',
      el,
    });
  });

  document.querySelectorAll('#taskList .task').forEach(task => {
    const title = task.querySelector('.tt')?.textContent || '';
    const meta = task.querySelector('.tm')?.textContent || '';
    items.push({
      type: 'tasks',
      id: task.id || title,
      label: title.replace(/\s+/g, ' ').trim(),
      sub: meta,
      haystack: `${title} ${meta}`,
      target: task.id,
      section: 'block-tasks',
      el: task,
    });
  });

  items.push({
    type: 'calendar',
    id: 'cal-stone',
    label: 'Stone Cottage calendar',
    sub: 'Windermere · block dates · sync Airbnb',
    haystack: 'stone cottage windermere calendar block sync airbnb booking',
    section: 'block-calendar',
    target: 'block-calendar',
  });
  items.push({
    type: 'calendar',
    id: 'cal-barn',
    label: 'Slate Barn calendar',
    sub: 'Ambleside · block dates · sync Airbnb',
    haystack: 'slate barn ambleside calendar block sync airbnb booking',
    section: 'block-calendar',
    target: 'block-calendar',
  });

  return items;
}

function casaHostFilterIndex(index, tokens, scope) {
  return index.filter(item => {
    if (scope !== 'all' && item.type !== scope) return false;
    return casaHostMatchesTokens(item.haystack, tokens);
  });
}

function casaHostApplyDomFilter(tokens, scope, matches) {
  const matchIds = new Set(matches.map(m => m.id));
  const matchTypes = new Set(matches.map(m => m.type));

  document.querySelectorAll('#enqTable tr[id^="row-"]').forEach(row => {
    const id = row.id.replace('row-', '');
    const show = !tokens.length || (scope === 'all' || scope === 'enquiries'
      ? matchIds.has(id)
      : false);
    row.style.display = show ? '' : 'none';
    row.classList.toggle('dh-search-hit', tokens.length > 0 && matchIds.has(id));
  });

  document.querySelectorAll('.prop-card-h').forEach((el, i) => {
    const show = !tokens.length || (scope === 'all' || scope === 'listings'
      ? matchIds.has(`listing-${i}`)
      : false);
    el.style.display = show ? '' : 'none';
    el.classList.toggle('dh-search-hit', tokens.length > 0 && matchIds.has(`listing-${i}`));
  });

  document.querySelectorAll('#taskList .task').forEach(task => {
    const show = !tokens.length || (scope === 'all' || scope === 'tasks'
      ? matchIds.has(task.id)
      : false);
    task.style.display = show ? '' : 'none';
    task.classList.toggle('dh-search-hit', tokens.length > 0 && matchIds.has(task.id));
  });

  const calBlock = document.getElementById('block-calendar');
  if (calBlock) {
    const showCal = !tokens.length || scope === 'all' || scope === 'calendar'
      ? (!tokens.length || matchTypes.has('calendar'))
      : false;
    calBlock.classList.toggle('dh-search-dim', tokens.length > 0 && !showCal);
    calBlock.classList.toggle('dh-search-hit', tokens.length > 0 && showCal);
  }

  ['block-enquiries', 'block-listings', 'block-tasks'].forEach(sectionId => {
    const block = document.getElementById(sectionId);
    if (!block || !tokens.length) {
      block?.classList.remove('dh-search-dim');
      return;
    }
    const type = sectionId.replace('block-', '');
    const hasHits = scope === 'all' ? matches.some(m => m.type === type) : scope === type;
    block.classList.toggle('dh-search-dim', !hasHits);
  });
}

function casaHostRenderQuickResults(matches, tokens) {
  const panel = document.getElementById('dhSearchResults');
  const countEl = document.getElementById('dhSearchCount');
  if (!panel) return;

  if (!tokens.length) {
    panel.classList.remove('open');
    panel.innerHTML = '';
    if (countEl) countEl.textContent = '';
    return;
  }

  const total = matches.length;
  if (countEl) {
    countEl.textContent = total
      ? `${total} match${total === 1 ? '' : 'es'}`
      : 'No matches';
  }

  if (!total) {
    panel.classList.add('open');
    panel.innerHTML = `<div class="dh-sr-empty">Nothing matched “${casaHostSearchState.query}”. Try a guest name, property, or task.</div>`;
    return;
  }

  const typeLabels = {
    enquiries: 'Enquiry',
    listings: 'Listing',
    tasks: 'Task',
    calendar: 'Calendar',
  };

  const top = matches.slice(0, 6);
  panel.innerHTML = top.map((m, i) => `
    <button type="button" class="dh-sr-item${i === 0 ? ' active' : ''}" data-target="${m.section}" data-scroll="${m.target || m.section}"
            onclick="casaHostJumpTo('${m.section}','${m.target || ''}')">
      <span class="dh-sr-type">${typeLabels[m.type] || m.type}</span>
      <span class="dh-sr-body">
        <span class="dh-sr-label">${m.label}</span>
        <span class="dh-sr-sub">${m.sub}</span>
      </span>
    </button>`).join('');

  panel.classList.add('open');
}

function casaHostRunSearch() {
  const tokens = casaHostTokenize(casaHostSearchState.query);
  const index = casaHostBuildIndex();
  const matches = casaHostFilterIndex(index, tokens, casaHostSearchState.scope);

  casaHostApplyDomFilter(tokens, casaHostSearchState.scope, matches);
  casaHostRenderQuickResults(matches, tokens);

  const clearBtn = document.getElementById('dhSearchClear');
  clearBtn?.classList.toggle('visible', !!casaHostSearchState.query);
}

function casaHostOnSearchInput(val) {
  casaHostSearchState.query = val;
  clearTimeout(casaHostSearchState.debounceTimer);
  casaHostSearchState.debounceTimer = setTimeout(casaHostRunSearch, 180);
}

function casaHostSetScope(scope) {
  if (!CASA_HOST_SEARCH_SCOPES.includes(scope)) return;
  casaHostSearchState.scope = scope;
  document.querySelectorAll('.dh-search-scope button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scope === scope);
  });
  casaHostRunSearch();
}

function casaHostClearSearch() {
  const input = document.getElementById('dhSearch');
  if (input) input.value = '';
  casaHostSearchState.query = '';
  casaHostRunSearch();
  input?.focus();
}

function casaHostJumpTo(sectionId, targetId) {
  casaHostClearSearchDropdown();
  const section = document.getElementById(sectionId);
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (targetId && targetId !== sectionId) {
    requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      el?.classList.add('dh-flash');
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => el?.classList.remove('dh-flash'), 1200);
    });
  }
}

function casaHostClearSearchDropdown() {
  document.getElementById('dhSearchResults')?.classList.remove('open');
}

function casaHostActivateFirstResult() {
  const first = document.querySelector('#dhSearchResults .dh-sr-item');
  if (first) first.click();
  else casaHostRunSearch();
}

function casaHostDashboardSearchInit() {
  const input = document.getElementById('dhSearch');
  if (!input) return;

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.preventDefault();
      casaHostClearSearch();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      casaHostActivateFirstResult();
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.dh-search-wrap')) casaHostClearSearchDropdown();
  });

  const origRender = window.renderEnquiries;
  if (typeof origRender === 'function') {
    window.renderEnquiries = function () {
      origRender.apply(this, arguments);
      if (casaHostSearchState.query) casaHostRunSearch();
    };
  }
}

document.addEventListener('DOMContentLoaded', casaHostDashboardSearchInit);

window.casaHostOnSearchInput = casaHostOnSearchInput;
window.casaHostClearSearch = casaHostClearSearch;
window.casaHostSetScope = casaHostSetScope;
window.casaHostJumpTo = casaHostJumpTo;
