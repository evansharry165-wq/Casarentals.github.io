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

function casaToggleSaved(id, btn) {
  const ids = casaGetSavedIds();
  const num = Number(id);
  const idx = ids.indexOf(num);
  if (idx >= 0) ids.splice(idx, 1);
  else ids.push(num);
  localStorage.setItem(CASA_SAVED_KEY, JSON.stringify(ids));
  const saved = ids.includes(num);
  if (btn) btn.classList.toggle('saved', saved);
  casaToast(saved ? 'Saved to your list' : 'Removed from saved');
  return saved;
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

function casaToggleFollow(hostKey, btn) {
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
  return following;
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
function casaSaveEnquiry(enquiry) {
  let list = [];
  try { list = JSON.parse(localStorage.getItem(CASA_ENQUIRIES_KEY) || '[]'); } catch { list = []; }
  list.unshift({ id: Date.now(), status: 'pending', ...enquiry });
  localStorage.setItem(CASA_ENQUIRIES_KEY, JSON.stringify(list.slice(0, 30)));
  casaAddNotification({
    type: 'enquiry',
    title: 'Enquiry sent',
    body: `Your message about ${enquiry.property || 'the stay'} was sent to the host.`,
    href: 'messages.html',
  });
}

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

  /* ─── Inline Replies Toggle & Dynamic Submission ─── */
  document.querySelectorAll('.reply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const thread = btn.closest('.post')?.querySelector('.reply-thread');
      if (thread) thread.classList.toggle('open');
    });
  });

  document.querySelectorAll('.reply-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const text = input?.value.trim();
      if (!text) return;

      const thread = form.closest('.reply-thread');
      if (!thread) return;

      const replyCard = document.createElement('div');
      replyCard.className = 'reply-card';
      replyCard.innerHTML = `
        <div class="av">J</div>
        <div class="r-content">
          <strong>You</strong> ${text}
          <div class="r-meta">Just now</div>
        </div>
      `;
      thread.insertBefore(replyCard, form);
      input.value = '';

      const countLabel = form.closest('.post')?.querySelector('.reply-btn .ct');
      if (countLabel) {
        const parsedCount = parseInt(countLabel.innerText, 10) || 0;
        countLabel.innerText = `${parsedCount + 1} replies`;
      }

      casaToast('Reply posted!');
    });
  });

  /* ─── Profile drawer (feed pages only) ─── */
  const drawerOverlay = document.getElementById('profileDrawerOverlay');
  const drawer = document.getElementById('profileDrawer');
  const drawerClose = document.getElementById('profileDrawerClose');

  const openProfileDrawer = (data) => {
    const set = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.textContent = val; };
    set('drawerName', data.username);
    set('drawerBio', data.bio);
    set('drawerLocation', data.location);
    set('drawerStays', data.property);

    const avatarContainer = document.getElementById('drawerAvatar');
    if (avatarContainer) {
      avatarContainer.textContent = data.avatarLetter || '?';
      avatarContainer.className = `av ${data.avatarClass || ''}`;
    }

    const badgeElement = document.getElementById('drawerBadge');
    if (badgeElement) {
      badgeElement.textContent = data.role || '';
      badgeElement.className = (data.role || '').toLowerCase() === 'host' ? 'badge-host' : 'badge-guest';
    }

    const drawerMsgBtn = document.getElementById('drawerMessageBtn');
    if (drawerMsgBtn) {
      drawerMsgBtn.setAttribute('data-host', data.username || '');
      drawerMsgBtn.setAttribute('data-property', (data.property || '').split(' ·')[0]);
    }

    drawerOverlay?.classList.add('open');
    drawer?.classList.add('open');
  };

  const closeProfileDrawer = () => {
    drawerOverlay?.classList.remove('open');
    drawer?.classList.remove('open');
  };

  const extractProfileMetadata = (node) => ({
    username: node.getAttribute('data-username'),
    role: node.getAttribute('data-role'),
    property: node.getAttribute('data-property'),
    location: node.getAttribute('data-location'),
    bio: node.getAttribute('data-bio'),
    avatarLetter: node.getAttribute('data-avatar'),
    avatarClass: node.getAttribute('data-avatar-class') || ''
  });

  document.querySelectorAll('.ph-head .av, .ph-head .name').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const post = el.closest('.post');
      if (post) openProfileDrawer(extractProfileMetadata(post));
    });
  });

  document.querySelectorAll('.sidebar-host').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('follow-btn')) return;
      openProfileDrawer(extractProfileMetadata(el));
    });
  });

  drawerClose?.addEventListener('click', closeProfileDrawer);
  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeProfileDrawer();
  });

  /* ─── Booking enquiry modal (pages that include markup) ─── */
  const bookingOverlay = document.getElementById('bookingModalOverlay');
  const bookingClose = document.getElementById('bookingModalClose');
  const bookingForm = document.getElementById('bookingForm');

  const openBookingModal = (host, property) => {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('modalHostName', host);
    set('modalPropName', property);
    bookingOverlay?.classList.add('open');
  };

  const closeBookingModal = () => bookingOverlay?.classList.remove('open');

  document.body.addEventListener('click', (e) => {
    const enquireBtn = e.target.closest('.enquire');
    if (!enquireBtn || !bookingOverlay) return;
    e.preventDefault();
    openBookingModal(
      enquireBtn.getAttribute('data-host') || 'Member',
      enquireBtn.getAttribute('data-property') || 'Request Topic'
    );
  });

  bookingClose?.addEventListener('click', closeBookingModal);
  bookingOverlay?.addEventListener('click', (e) => {
    if (e.target === bookingOverlay) closeBookingModal();
  });

  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const host = document.getElementById('modalHostName')?.textContent || 'Host';
    const property = document.getElementById('modalPropName')?.textContent || 'Stay';
    casaSaveEnquiry({ host, property, message: bookingForm.querySelector('textarea')?.value || '' });
    closeBookingModal();
    bookingForm.reset();
    casaToast('Enquiry sent — check Messages for replies');
  });

});
