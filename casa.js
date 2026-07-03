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
  const targetId = typeof CASA_HOSTS !== 'undefined' ? CASA_HOSTS[key]?.supabaseId : null;
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
  if (!window.casaSupabase || typeof CASA_HOSTS === 'undefined') return;
  const user = casaGetUser();
  if (!user) return;
  const { data } = await window.casaSupabase.from('follows').select('followed_id').eq('follower_id', user.id);
  if (!data) return;
  const followedIds = new Set(data.map(r => r.followed_id));
  const slugs = Object.keys(CASA_HOSTS).filter(slug => CASA_HOSTS[slug].supabaseId && followedIds.has(CASA_HOSTS[slug].supabaseId));
  localStorage.setItem(CASA_FOLLOWS_KEY, JSON.stringify(slugs));
}

window.casaGetFollowedHosts = casaGetFollowedHosts;
window.casaIsFollowing = casaIsFollowing;
window.casaToggleFollow = casaToggleFollow;

/* ─── Auth session ─── */
const CASA_USER_KEY = 'casa:user';
const CASA_NOTIF_KEY = 'casa:notifications';
const CASA_RECENT_KEY = 'casa:recent';
const CASA_ENQUIRIES_KEY = 'casa:enquiries';

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

/* ─── Enquiries (guest → host flow) ─── */
const CASA_LOCAL_CONVOS_KEY = 'casa:local-convos';

function casaGetEnquiries() {
  try {
    return JSON.parse(localStorage.getItem(CASA_ENQUIRIES_KEY) || '[]');
  } catch {
    return [];
  }
}

function casaSaveEnquiry(enquiry) {
  const convId = 'enq-' + Date.now();
  let list = casaGetEnquiries();
  list.unshift({ id: Date.now(), status: 'pending', convId, ...enquiry });
  localStorage.setItem(CASA_ENQUIRIES_KEY, JSON.stringify(list.slice(0, 30)));

  // Create the linked conversation so the host's reply (simulated in
  // messages.html) can flip this enquiry's status back here.
  let convos = [];
  try { convos = JSON.parse(localStorage.getItem(CASA_LOCAL_CONVOS_KEY) || '[]'); } catch { convos = []; }
  const dateLine = enquiry.checkin && enquiry.checkout
    ? `${enquiry.checkin} → ${enquiry.checkout}` : '';
  convos.unshift({
    id: convId,
    name: enquiry.host || 'Host',
    av: (enquiry.host || 'H').charAt(0).toUpperCase(),
    avc: '',
    prop: enquiry.property || '',
    time: 'Just now',
    tag: 'enquiry',
    tagLabel: 'Awaiting reply',
    unread: false,
    online: false,
    preview: enquiry.message ? enquiry.message.slice(0, 60) : 'Enquiry sent',
    msgs: [
      { f: 'me', t: enquiry.message || `Hi, is ${enquiry.property || 'this place'} available ${dateLine}?`, ts: new Date().toTimeString().slice(0, 5) },
    ],
  });
  localStorage.setItem(CASA_LOCAL_CONVOS_KEY, JSON.stringify(convos.slice(0, 30)));

  casaAddNotification({
    type: 'enquiry',
    title: 'Enquiry sent',
    body: `Your message about ${enquiry.property || 'the stay'} was sent to the host.`,
    href: `messages.html?c=${convId}`,
  });
}

function casaMarkEnquiryReplied(convId) {
  const list = casaGetEnquiries();
  const item = list.find(e => e.convId === convId);
  if (!item || item.status === 'replied') return;
  item.status = 'replied';
  localStorage.setItem(CASA_ENQUIRIES_KEY, JSON.stringify(list));
}

window.casaGetEnquiries = casaGetEnquiries;
window.casaMarkEnquiryReplied = casaMarkEnquiryReplied;

/* ─── Reporting & moderation (guest/host safety) ─── */
const CASA_REPORTS_KEY = 'casa:reports';
const CASA_MUTED_KEY = 'casa:muted-users';
const CASA_BLOCKED_CONVOS_KEY = 'casa:blocked-convos';

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
  return true;
}

function casaGetMutedUsers() {
  try { return JSON.parse(localStorage.getItem(CASA_MUTED_KEY) || '[]'); } catch { return []; }
}

function casaIsMuted(name) {
  return casaGetMutedUsers().includes(name);
}

function casaMuteUser(name) {
  const list = casaGetMutedUsers();
  if (!list.includes(name)) {
    list.push(name);
    localStorage.setItem(CASA_MUTED_KEY, JSON.stringify(list));
  }
}

function casaGetBlockedConvos() {
  try { return JSON.parse(localStorage.getItem(CASA_BLOCKED_CONVOS_KEY) || '[]'); } catch { return []; }
}

function casaBlockConvo(id) {
  const list = casaGetBlockedConvos();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(CASA_BLOCKED_CONVOS_KEY, JSON.stringify(list));
  }
}

window.casaGetReports = casaGetReports;
window.casaIsReported = casaIsReported;
window.casaReportContent = casaReportContent;
window.casaGetMutedUsers = casaGetMutedUsers;
window.casaIsMuted = casaIsMuted;
window.casaMuteUser = casaMuteUser;
window.casaGetBlockedConvos = casaGetBlockedConvos;
window.casaBlockConvo = casaBlockConvo;

window.casaGetUser = casaGetUser;
window.casaSetUser = casaSetUser;
window.casaIsLoggedIn = casaIsLoggedIn;
window.casaAddNotification = casaAddNotification;
window.casaTrackView = casaTrackView;
window.casaSaveEnquiry = casaSaveEnquiry;

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
    if (primaryJoin) {
      primaryJoin.textContent = user.role === 'host' ? 'Dashboard' : 'Profile';
      primaryJoin.href = user.role === 'host' ? 'host.html' : 'profile.html';
      primaryJoin.dataset.casaAuth = '1';
    }
    const avatar = document.createElement('a');
    avatar.href = user.role === 'host' ? 'host.html' : 'profile.html';
    avatar.className = 'nav-avatar';
    avatar.title = user.name || user.email;
    avatar.dataset.casaAuth = '1';
    avatar.textContent = casaUserInitial(user);
    right.appendChild(avatar);
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

/** Show welcome / signed-in toast from URL params (?welcome=1 or ?signedin=1) */
function casaHandleAuthRedirectToasts() {
  const qp = new URLSearchParams(location.search);
  if (qp.get('welcome')) {
    setTimeout(() => casaToast('Welcome to Casa — you\'re all set'), 400);
  } else if (qp.get('signedin')) {
    setTimeout(() => casaToast('Signed in — welcome back'), 400);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  casaInitPreviewBanner();
  casaHandleAuthRedirectToasts();
  casaInitNav();
  casaLinkifyHashtags(document.body);

});
