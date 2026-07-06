/* Casa shared utilities — safe to load on every page */

const CASA_CONFIG = {
  mode: 'preview',
  domain: 'casa.co.uk',
  authProvider: 'local',
};

function casaNormalizeUser(raw) {
  if (!raw) return null;
  const name = String(raw.name || raw.email || 'Guest').trim();
  return {
    id: raw.id || `local-${Date.now()}`,
    name,
    email: String(raw.email || '').trim().toLowerCase(),
    role: raw.role === 'host' ? 'host' : 'guest',
    createdAt: raw.createdAt || new Date().toISOString(),
    sessionType: CASA_CONFIG.mode === 'live' ? 'live' : 'preview',
  };
}

function casaInitPreviewBanner() {
  if (CASA_CONFIG.mode !== 'preview') return;
  if (document.getElementById('casaPreviewBanner')) return;
  const bar = document.createElement('div');
  bar.id = 'casaPreviewBanner';
  bar.className = 'casa-preview-banner';
  bar.innerHTML = '<p>Preview build for <strong>casa.co.uk</strong> — sign-in, calendars, and messages are stored on this device until launch.</p>';
  document.body.prepend(bar);
  document.body.classList.add('has-preview-banner');
}

window.CASA_CONFIG = CASA_CONFIG;

function casaToast(message, duration = 3000) {
  let el = document.getElementById('casaToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'casaToast';
    el.className = 'casa-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._casaToastTimer);
  el._casaToastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

window.casaToast = casaToast;

// Shared "Share" button behaviour (property.html, profile.html, etc.)
// — used to be a dead button with no onclick at all on every page it
// appeared on.
async function casaShareLink(title, url) {
  const shareUrl = url || location.href;
  if (navigator.share) {
    try { await navigator.share({ title, url: shareUrl }); return; }
    catch { /* user cancelled the native share sheet — not an error */ }
  } else {
    try {
      await navigator.clipboard.writeText(shareUrl);
      casaToast('Link copied to clipboard');
    } catch {
      casaToast(shareUrl);
    }
  }
}
window.casaShareLink = casaShareLink;

const CASA_SAVED_KEY = 'casa:saved';

function casaGetSavedIds() {
  try {
    return JSON.parse(localStorage.getItem(CASA_SAVED_KEY) || '[]').map(Number);
  } catch {
    return [];
  }
}

function casaIsSaved(id) {
  return casaGetSavedIds().includes(Number(id));
}

// Toggles the local cache immediately (so the UI responds instantly and
// still works signed-out), then mirrors the change into saved_properties
// when a real session exists. localStorage stays the synchronous read
// path everywhere else in the codebase.
async function casaToggleSaved(id, btn) {
  const ids = casaGetSavedIds();
  const num = Number(id);
  const idx = ids.indexOf(num);
  if (idx >= 0) ids.splice(idx, 1);
  else ids.push(num);
  localStorage.setItem(CASA_SAVED_KEY, JSON.stringify(ids));
  const saved = ids.includes(num);
  if (btn) btn.classList.toggle('saved', saved);
  casaToast(saved ? 'Saved to your list' : 'Removed from saved');

  const user = casaGetUser();
  if (window.casaSupabase && user) {
    if (saved) {
      await window.casaSupabase.from('saved_properties').upsert({ user_id: user.id, property_id: num });
    } else {
      await window.casaSupabase.from('saved_properties').delete().eq('user_id', user.id).eq('property_id', num);
    }
  }
  return saved;
}

async function casaSyncSavedFromSupabase() {
  if (!window.casaSupabase) return;
  const user = casaGetUser();
  if (!user) return;
  const { data } = await window.casaSupabase.from('saved_properties').select('property_id').eq('user_id', user.id);
  if (data) localStorage.setItem(CASA_SAVED_KEY, JSON.stringify(data.map(r => r.property_id)));
}

window.casaIsSaved = casaIsSaved;
window.casaToggleSaved = casaToggleSaved;

const CASA_FOLLOWS_KEY = 'casa:follows';

function casaGetFollowedHosts() {
  try {
    return JSON.parse(localStorage.getItem(CASA_FOLLOWS_KEY) || '[]');
  } catch {
    return [];
  }
}

function casaIsFollowing(hostKey) {
  return casaGetFollowedHosts().includes(String(hostKey));
}

// hostKey is a local CASA_HOSTS slug (e.g. 'sarah-r'), not a Supabase id —
// resolved to the real profile id via CASA_HOSTS[key].supabaseId, seeded
// to match the demo host auth accounts (see supabase/seed.sql). Real
// (non-seed) hosts created via signup.html use their own auth id directly
// once host profiles stop being sourced from casa-hosts.js.
async function casaToggleFollow(hostKey, btn) {
  const key = String(hostKey);
  const list = casaGetFollowedHosts();
  const idx = list.indexOf(key);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(key);
  localStorage.setItem(CASA_FOLLOWS_KEY, JSON.stringify(list));
  const following = list.includes(key);
  if (btn) {
    btn.classList.toggle('following', following);
    btn.textContent = following ? 'Following' : 'Follow';
  }
  casaToast(following ? `Following ${hostKey}` : `Unfollowed ${hostKey}`);

  const user = casaGetUser();
  // hostKey is usually a CASA_HOSTS slug (resolved to its real Supabase
  // id below) — but a real host's profile page passes their actual
  // Supabase id directly instead, since real hosts have no slug.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);
  const targetId = (typeof CASA_HOSTS !== 'undefined' ? CASA_HOSTS[key]?.supabaseId : null) || (isUuid ? key : null);
  if (window.casaSupabase && user && targetId) {
    if (following) {
      await window.casaSupabase.from('follows').upsert({ follower_id: user.id, followed_id: targetId });
    } else {
      await window.casaSupabase.from('follows').delete().eq('follower_id', user.id).eq('followed_id', targetId);
    }
  }
  return following;
}

async function casaSyncFollowsFromSupabase() {
  if (!window.casaSupabase) return;
  const user = casaGetUser();
  if (!user) return;
  const { data } = await window.casaSupabase.from('follows').select('followed_id').eq('follower_id', user.id);
  if (!data) return;
  const followedIds = new Set(data.map(r => r.followed_id));
  // Prefer the CASA_HOSTS slug where one exists (matches how seed-host
  // follow buttons key their state), otherwise keep the raw Supabase id
  // for a real (non-seed) host, who has no slug at all.
  const slugByHostId = {};
  if (typeof CASA_HOSTS !== 'undefined') {
    Object.keys(CASA_HOSTS).forEach(slug => {
      if (CASA_HOSTS[slug].supabaseId) slugByHostId[CASA_HOSTS[slug].supabaseId] = slug;
    });
  }
  const keys = [...followedIds].map(id => slugByHostId[id] || id);
  localStorage.setItem(CASA_FOLLOWS_KEY, JSON.stringify(keys));
}

window.casaGetFollowedHosts = casaGetFollowedHosts;
window.casaIsFollowing = casaIsFollowing;
window.casaToggleFollow = casaToggleFollow;

/* ─── Auth session ─── */
const CASA_USER_KEY = 'casa:user';
const CASA_NOTIF_KEY = 'casa:notifications';
const CASA_RECENT_KEY = 'casa:recent';

function casaGetUser() {
  try {
    const raw = localStorage.getItem(CASA_USER_KEY);
    return raw ? casaNormalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function casaSetUser(user) {
  if (user) localStorage.setItem(CASA_USER_KEY, JSON.stringify(casaNormalizeUser(user)));
  else localStorage.removeItem(CASA_USER_KEY);
}

function casaIsLoggedIn() {
  return !!casaGetUser();
}

function casaUserInitial(user) {
  const name = user?.name || user?.email || '?';
  return name.trim().charAt(0).toUpperCase();
}

/* ─── Notifications ─── */
function casaGetNotifications() {
  try {
    return JSON.parse(localStorage.getItem(CASA_NOTIF_KEY) || '[]');
  } catch {
    return [];
  }
}

function casaSaveNotifications(list) {
  localStorage.setItem(CASA_NOTIF_KEY, JSON.stringify(list.slice(0, 50)));
}

function casaAddNotification(n) {
  const list = casaGetNotifications();
  list.unshift({
    id: Date.now(),
    read: false,
    time: 'Just now',
    ...n,
  });
  casaSaveNotifications(list);
  casaUpdateNotifBadge();
}

function casaMarkNotifRead(id) {
  const list = casaGetNotifications();
  const item = list.find(n => n.id === id);
  if (item) item.read = true;
  casaSaveNotifications(list);
  casaUpdateNotifBadge();
}

function casaMarkAllNotifsRead() {
  casaSaveNotifications(casaGetNotifications().map(n => ({ ...n, read: true })));
  casaUpdateNotifBadge();
}

function casaUnreadNotifCount() {
  return casaGetNotifications().filter(n => !n.read).length;
}

function casaSeedNotificationsIfEmpty() {
  if (casaGetNotifications().length) return;
  casaSaveNotifications([
    { id: 1, type: 'welcome', title: 'Welcome to Casa', body: 'Browse fee-free UK stays and connect with hosts directly.', href: 'how-it-works.html', read: false, time: 'Today' },
    { id: 2, type: 'tip', title: 'Save stays you love', body: 'Tap the heart on any listing — they appear in Saved.', href: 'saved.html', read: false, time: 'Today' },
    { id: 3, type: 'community', title: 'Join the feed', body: 'Hosts post availability and guests share tips across the UK.', href: 'feed.html', read: false, time: 'Yesterday' },
  ]);
}

function casaUpdateNotifBadge() {
  const badge = document.getElementById('casaNotifBadge');
  if (!badge) return;
  const count = casaUnreadNotifCount();
  badge.textContent = count > 9 ? '9+' : String(count);
  badge.style.display = count ? 'inline-flex' : 'none';
}

/* ─── Recently viewed ─── */
function casaTrackView(propertyId) {
  const id = Number(propertyId);
  if (!id) return;
  let ids = [];
  try { ids = JSON.parse(localStorage.getItem(CASA_RECENT_KEY) || '[]').map(Number); } catch { ids = []; }
  ids = [id, ...ids.filter(x => x !== id)].slice(0, 12);
  localStorage.setItem(CASA_RECENT_KEY, JSON.stringify(ids));
}

function casaGetRecentIds() {
  try {
    return JSON.parse(localStorage.getItem(CASA_RECENT_KEY) || '[]').map(Number);
  } catch {
    return [];
  }
}

/* ─── Enquiries (guest → host flow) ───
   Enquiries, conversations, and messages are all real Supabase tables now
   (see supabase/schema.sql) — booking.html inserts the enquiry and calls
   create_conversation_for_enquiry directly; host.html and messages.html
   query Supabase directly. No local mirror needed. */

/* ─── Reporting & moderation (guest/host safety) ─── */
const CASA_REPORTS_KEY = 'casa:reports';
const CASA_MUTED_KEY = 'casa:muted-users';

function casaGetReports() {
  try { return JSON.parse(localStorage.getItem(CASA_REPORTS_KEY) || '[]'); } catch { return []; }
}

function casaIsReported(targetType, targetId) {
  return casaGetReports().some(r => r.targetType === targetType && String(r.targetId) === String(targetId));
}

function casaReportContent(targetType, targetId, meta = {}) {
  if (casaIsReported(targetType, targetId)) return false;
  const list = casaGetReports();
  list.unshift({ id: Date.now(), targetType, targetId: String(targetId), ...meta, reportedAt: new Date().toISOString() });
  localStorage.setItem(CASA_REPORTS_KEY, JSON.stringify(list.slice(0, 100)));

  // target_id has no FK constraint in the reports table (the target itself
  // may still be local-only seed content), so this write-through doesn't
  // depend on the target being migrated yet.
  //
  // supabase-js query builders are lazy — the request isn't actually sent
  // until something calls .then()/await on them. Calling .then() here
  // fires it without making this function block on the network round trip.
  const user = casaGetUser();
  if (window.casaSupabase && user) {
    window.casaSupabase.from('reports').insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: String(targetId),
      reason: meta.reason || null,
    }).then(({ error }) => {
      if (error) console.error('casaReportContent: Supabase sync failed', error);
    });
  }
  return true;
}

// Keyed by real profile id (uuid), not display name — a name isn't a
// stable identity once posts come from real accounts. Read-through
// localStorage cache synced from the muted_users table, same pattern as
// casaSyncSavedFromSupabase/casaSyncFollowsFromSupabase.
function casaGetMutedUserIds() {
  try { return JSON.parse(localStorage.getItem(CASA_MUTED_KEY) || '[]'); } catch { return []; }
}

function casaIsMutedId(userId) {
  return casaGetMutedUserIds().includes(userId);
}

async function casaMuteUserId(mutedUserId) {
  const list = casaGetMutedUserIds();
  if (!list.includes(mutedUserId)) {
    list.push(mutedUserId);
    localStorage.setItem(CASA_MUTED_KEY, JSON.stringify(list));
  }
  const user = casaGetUser();
  if (window.casaSupabase && user) {
    const { error } = await window.casaSupabase.from('muted_users').insert({ user_id: user.id, muted_user_id: mutedUserId });
    if (error) console.error('casaMuteUserId: Supabase sync failed', error);
  }
}

async function casaSyncMutedFromSupabase() {
  if (!window.casaSupabase) return;
  const user = casaGetUser();
  if (!user) return;
  const { data } = await window.casaSupabase.from('muted_users').select('muted_user_id').eq('user_id', user.id);
  if (data) localStorage.setItem(CASA_MUTED_KEY, JSON.stringify(data.map(r => r.muted_user_id)));
}

window.casaGetReports = casaGetReports;
window.casaIsReported = casaIsReported;
window.casaReportContent = casaReportContent;
window.casaGetMutedUserIds = casaGetMutedUserIds;
window.casaIsMutedId = casaIsMutedId;
window.casaMuteUserId = casaMuteUserId;
window.casaSyncMutedFromSupabase = casaSyncMutedFromSupabase;

window.casaGetUser = casaGetUser;
window.casaSetUser = casaSetUser;
window.casaIsLoggedIn = casaIsLoggedIn;
window.casaAddNotification = casaAddNotification;
window.casaTrackView = casaTrackView;

/* ─── Hashtag routing ─── */
function casaTagUrl(tag) {
  const clean = (tag || '').replace(/^#/, '').toLowerCase();
  return `tag.html?tag=${encodeURIComponent(clean)}`;
}

function casaLinkifyHashtags(container) {
  if (!container) return;
  container.querySelectorAll('.tag, .post-body .tag, .hs-pill').forEach(el => {
    if (el.dataset.linked) return;
    const text = el.textContent.trim();
    if (!text.startsWith('#')) return;
    el.dataset.linked = '1';
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = casaTagUrl(text);
    });
  });
}

/* ─── Shared nav: auth state, notifications, mobile menu ─── */
function casaInitNav() {
  const nav = document.querySelector('.casa-nav');
  if (!nav || nav.dataset.casaInit) return;
  nav.dataset.casaInit = '1';

  casaSeedNotificationsIfEmpty();

  // .nav-right collapses to display:none on mobile until the menu is opened.
  // The toggle and notification bell need to stay visible regardless, so they
  // live in .nav-end, a persistent sibling wrapper around .nav-right rather
  // than inside it.
  let navRight = nav.querySelector('.nav-right');
  let navEnd = nav.querySelector('.nav-end');
  if (!navEnd && navRight) {
    navEnd = document.createElement('div');
    navEnd.className = 'nav-end';
    nav.insertBefore(navEnd, navRight);
    navEnd.appendChild(navRight);
  }
  const endContainer = navEnd || nav;

  if (!document.getElementById('casaMobileToggle')) {
    const toggle = document.createElement('button');
    toggle.id = 'casaMobileToggle';
    toggle.className = 'casa-mobile-toggle';
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    toggle.addEventListener('click', () => {
      nav.classList.toggle('mobile-open');
      document.body.classList.toggle('casa-nav-open');
    });
    endContainer.insertBefore(toggle, navRight || null);
  }

  if (!document.getElementById('casaNotifWrap')) {
    if (navRight) {
      const wrap = document.createElement('div');
      wrap.id = 'casaNotifWrap';
      wrap.className = 'casa-notif-wrap';
      wrap.innerHTML = `
        <button type="button" class="casa-notif-btn" id="casaNotifBtn" aria-label="Notifications">
          <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="casa-notif-badge" id="casaNotifBadge">0</span>
        </button>
        <div class="casa-notif-panel" id="casaNotifPanel"></div>`;
      endContainer.insertBefore(wrap, document.getElementById('casaMobileToggle') || navRight);

      document.getElementById('casaNotifBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        casaRenderNotifPanel();
        wrap.classList.toggle('open');
      });
    }
  }

  casaRenderAuthNav();
  casaUpdateNotifBadge();
  casaInitSupabaseAuthSync();

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#casaNotifWrap')) {
      document.getElementById('casaNotifWrap')?.classList.remove('open');
    }
    if (!e.target.closest('.casa-account-wrap')) {
      nav.querySelector('.casa-account-wrap')?.classList.remove('open');
    }
    if (!e.target.closest('.casa-nav') && nav.classList.contains('mobile-open')) {
      nav.classList.remove('mobile-open');
      document.body.classList.remove('casa-nav-open');
    }
  });
}

function casaRenderAuthNav() {
  const nav = document.querySelector('.casa-nav');
  const right = nav?.querySelector('.nav-right');
  if (!right) return;

  const user = casaGetUser();
  right.querySelectorAll('[data-casa-auth]').forEach(el => el.remove());

  const signLinks = [...right.querySelectorAll('a[href*="signup"]')];
  const primaryJoin = signLinks.find(a => a.classList.contains('primary'));
  const signIn = signLinks.find(a => !a.classList.contains('primary'));

  if (user) {
    if (signIn) signIn.style.display = 'none';
    const profileHref = user.role === 'host' ? 'host.html' : 'profile.html';
    if (primaryJoin) {
      primaryJoin.textContent = user.role === 'host' ? 'Dashboard' : 'Profile';
      primaryJoin.href = profileHref;
      primaryJoin.dataset.casaAuth = '1';
    }

    // A real account portal, not just a link — this is the one place on
    // every page a signed-in user can reach their profile/saved/messages
    // or sign out, so it needs to read as a deliberate gateway, not a
    // decorative circle. Built with DOM APIs (not innerHTML) for the
    // name/email since that's real user-entered profile data.
    const wrap = document.createElement('div');
    wrap.className = 'casa-account-wrap';
    wrap.dataset.casaAuth = '1';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-avatar';
    btn.id = 'casaAccountBtn';
    btn.setAttribute('aria-label', 'Account menu');
    btn.textContent = casaUserInitial(user);
    wrap.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'casa-account-panel';

    const head = document.createElement('div');
    head.className = 'casa-account-head';
    const nm = document.createElement('div');
    nm.className = 'nm';
    nm.textContent = user.name || 'Your account';
    const em = document.createElement('div');
    em.className = 'em';
    em.textContent = user.email || '';
    head.append(nm, em);
    panel.appendChild(head);

    const list = document.createElement('div');
    list.className = 'casa-account-list';
    const items = [
      { href: profileHref, label: user.role === 'host' ? 'Host dashboard' : 'Profile', icon: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>' },
    ];
    if (user.role !== 'host') items.push({ href: 'saved.html', label: 'Saved stays', icon: '<path d="M6 4h12v17l-6-4-6 4z"/>' });
    items.push({ href: 'messages.html', label: 'Messages', icon: '<path d="M21 12a8 8 0 0 1-11.4 7.3L4 21l1.7-5.6A8 8 0 1 1 21 12z"/>' });
    items.forEach(it => {
      const a = document.createElement('a');
      a.className = 'casa-account-item';
      a.href = it.href;
      a.innerHTML = `<svg viewBox="0 0 24 24">${it.icon}</svg>`;
      a.append(document.createTextNode(' ' + it.label));
      list.appendChild(a);
    });
    const sep = document.createElement('div');
    sep.className = 'casa-account-sep';
    list.appendChild(sep);
    const signOutBtn = document.createElement('button');
    signOutBtn.type = 'button';
    signOutBtn.className = 'casa-account-item danger';
    signOutBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>';
    signOutBtn.append(document.createTextNode(' Sign out'));
    signOutBtn.addEventListener('click', () => casaSignOut());
    list.appendChild(signOutBtn);
    panel.appendChild(list);
    wrap.appendChild(panel);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('casaNotifWrap')?.classList.remove('open');
      wrap.classList.toggle('open');
    });

    right.appendChild(wrap);
  } else {
    if (signIn) { signIn.style.display = ''; signIn.href = 'signup.html'; }
    if (primaryJoin) { primaryJoin.textContent = 'Join free'; primaryJoin.href = 'signup.html'; }
  }
}

/* ─── Supabase session sync ───
   casaGetUser() stays synchronous (read from the casa:user localStorage
   cache) so every existing call site keeps working unchanged. On pages
   that load casa-supabase.js before casa.js, this keeps that cache in
   sync with the real Supabase session — casa:user becomes a read-through
   cache, not the source of truth. Pages that don't load casa-supabase.js
   are unaffected (falls through to a no-op). */
async function casaSyncUserFromSession(session) {
  if (!session) {
    casaSetUser(null);
    casaRenderAuthNav();
    return;
  }
  let fullName = session.user.email;
  let role = 'guest';
  try {
    const { data: profile } = await window.casaSupabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', session.user.id)
      .single();
    if (profile) {
      fullName = profile.full_name || fullName;
      role = profile.role || role;
    }
  } catch {
    /* profile row may not exist yet (e.g. trigger lag) — fall back to session data */
  }
  casaSetUser({
    id: session.user.id,
    name: fullName,
    email: session.user.email,
    role,
  });
  casaRenderAuthNav();
  casaSyncSavedFromSupabase();
  casaSyncFollowsFromSupabase();
  casaSyncMutedFromSupabase();
}

function casaInitSupabaseAuthSync() {
  if (!window.casaSupabase) return;
  window.casaSupabase.auth.getSession().then(({ data }) => casaSyncUserFromSession(data.session));
  window.casaSupabase.auth.onAuthStateChange((_event, session) => casaSyncUserFromSession(session));
}

async function casaSignOut() {
  if (window.casaSupabase) await window.casaSupabase.auth.signOut();
  casaSetUser(null);
  window.location.href = 'index.html';
}

window.casaSignOut = casaSignOut;

function casaRenderNotifPanel() {
  const panel = document.getElementById('casaNotifPanel');
  if (!panel) return;
  const items = casaGetNotifications();
  if (!items.length) {
    panel.innerHTML = '<div class="casa-notif-empty">No notifications yet</div>';
    return;
  }
  panel.innerHTML = `
    <div class="casa-notif-head">
      <strong>Notifications</strong>
      <button type="button" onclick="casaMarkAllNotifsRead();casaRenderNotifPanel();">Mark all read</button>
    </div>
    <div class="casa-notif-list">
      ${items.map(n => `
        <a class="casa-notif-item${n.read ? '' : ' unread'}" href="${n.href || '#'}" data-id="${n.id}" onclick="casaMarkNotifRead(${n.id})">
          <div class="ni-title">${n.title}</div>
          <div class="ni-body">${n.body}</div>
          <div class="ni-time">${n.time || ''}</div>
        </a>`).join('')}
    </div>`;
}

window.casaInitNav = casaInitNav;
window.casaTagUrl = casaTagUrl;
window.casaLinkifyHashtags = casaLinkifyHashtags;
window.casaMarkAllNotifsRead = casaMarkAllNotifsRead;
window.casaMarkNotifRead = casaMarkNotifRead;
window.casaRenderNotifPanel = casaRenderNotifPanel;

/* ─── Real platform stats ───
   index.html, signup.html, how-it-works.html and feed.html all
   quoted a fixed "4,202 UK stays / 18k+ members" story regardless of
   how many real stays/members actually exist — accurate for no launch
   size the site will ever actually be at. These replace that with
   real counts, using head:true count-only queries (no row bodies
   fetched) so this stays cheap regardless of how large the tables get. */
async function casaGetPlatformStats() {
  if (!window.casaSupabase) return null;
  const [{ count: stays }, { count: members }, { data: reviews }] = await Promise.all([
    window.casaSupabase.from('properties').select('*', { count: 'exact', head: true }).eq('published', true),
    window.casaSupabase.from('profiles').select('*', { count: 'exact', head: true }),
    window.casaSupabase.from('reviews').select('stars'),
  ]);
  const reviewCount = reviews ? reviews.length : 0;
  const avgRating = reviewCount ? (reviews.reduce((s, r) => s + r.stars, 0) / reviewCount).toFixed(1) : null;
  return { stays: stays || 0, members: members || 0, avgRating, reviewCount };
}

function casaFormatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return String(n);
}

// Real created_at timestamps (feed posts/replies) need a human "2 hrs
// ago" label — no fabricated seed data left to hardcode one against.
function casaRelativeTime(isoString) {
  const then = new Date(isoString).getTime();
  const diffMs = Date.now() - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min${min === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return days === 1 ? 'Yesterday' : `${days} days ago`;
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: hrs > 24 * 300 ? 'numeric' : undefined });
}
window.casaRelativeTime = casaRelativeTime;

// One lightweight two-column fetch + client-side grouping — cheap even
// at thousands of rows, and avoids a round trip per region. Only
// published listings count, matching what a guest can actually find.
async function casaGetRegionStats() {
  if (!window.casaSupabase) return {};
  const { data } = await window.casaSupabase.from('properties').select('region, price_per_night').eq('published', true);
  const stats = {};
  (data || []).forEach(p => {
    if (!stats[p.region]) stats[p.region] = { count: 0, minPrice: Infinity };
    stats[p.region].count++;
    if (p.price_per_night < stats[p.region].minPrice) stats[p.region].minPrice = p.price_per_night;
  });
  return stats;
}

window.casaGetPlatformStats = casaGetPlatformStats;
window.casaFormatCount = casaFormatCount;
window.casaGetRegionStats = casaGetRegionStats;

/** Show welcome / signed-in toast from URL params (?welcome=1 or ?signedin=1) */
function casaHandleAuthRedirectToasts() {
  const qp = new URLSearchParams(location.search);
  if (qp.get('welcome')) {
    setTimeout(() => casaToast('Welcome to Casa — you\'re all set'), 400);
  } else if (qp.get('signedin')) {
    setTimeout(() => casaToast('Signed in — welcome back'), 400);
  }
}

let casaBootstrapDone = false;
function casaBootstrap() {
  if (casaBootstrapDone) return;
  casaBootstrapDone = true;
  // Each step wrapped separately (not one big try/catch) so a bug in the
  // preview banner or a toast can never again take casaInitNav() down
  // with it — that's exactly how a single dangling reference elsewhere in
  // this file (a leftover `window.casaSaveEnquiry = casaSaveEnquiry`
  // export for a function that no longer existed) silently broke nav
  // auth-state rendering on every page for this entire project, with no
  // visible error: it threw at the top level while *parsing* casa.js,
  // which aborted every line after it in the file, including this whole
  // bootstrap block — so casaInitNav() was never even reached.
  try { casaInitPreviewBanner(); } catch (e) { console.error('casaInitPreviewBanner failed', e); }
  try { casaHandleAuthRedirectToasts(); } catch (e) { console.error('casaHandleAuthRedirectToasts failed', e); }
  try { casaInitNav(); } catch (e) { console.error('casaInitNav failed', e); }
  try { casaLinkifyHashtags(document.body); } catch (e) { console.error('casaLinkifyHashtags failed', e); }
}
// Never rely on a single trigger for this — it's what makes the nav
// (including whether you look signed in at all) reflect reality, so a
// missed event here is a real, user-visible bug, not a cosmetic one.
// A plain 'DOMContentLoaded' listener alone can silently never fire if
// casa.js finishes loading/parsing after that event already passed
// (slow request ahead of it, browser/caching quirks, etc.) — the
// casaBootstrapDone guard makes it safe to attach every one of these
// and let whichever fires first win.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', casaBootstrap);
} else {
  casaBootstrap();
}
document.addEventListener('DOMContentLoaded', casaBootstrap);
window.addEventListener('load', casaBootstrap);
