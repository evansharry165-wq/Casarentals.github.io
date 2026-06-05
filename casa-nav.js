/** Casa — context-aware site navigation (prototype) */

const CASA_USER_KEY = 'casa:user';

function casaGetUser() {
  try {
    const raw = localStorage.getItem(CASA_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function casaIsSignedIn() {
  const u = casaGetUser();
  return !!(u && (u.signedIn || u.email || u.name));
}

function casaUserInitial() {
  const u = casaGetUser();
  if (!u) return 'J';
  const name = (u.name || u.email || '').trim();
  return name ? name[0].toUpperCase() : '?';
}

function casaSignOut() {
  localStorage.removeItem(CASA_USER_KEY);
  if (window.casaToast) casaToast('Signed out — see you soon');
  setTimeout(() => { window.location.href = 'index.html'; }, 400);
}

window.casaGetUser = casaGetUser;
window.casaIsSignedIn = casaIsSignedIn;
window.casaSignOut = casaSignOut;

function navDivider() {
  return '<div class="nav-divider" aria-hidden="true"></div>';
}

function navLink(href, label, opts = {}) {
  const classes = ['nav-link'];
  if (opts.primary) classes.push('primary');
  if (opts.outline) classes.push('outline');
  const active = !!opts.active;
  const style = active ? 'color:var(--brick);font-weight:500' : (opts.style || '');
  const styleAttr = style ? ` style="${style}"` : '';
  const aria = active ? ' aria-current="page"' : '';
  return `<a class="${classes.join(' ')}" href="${href}"${styleAttr}${aria}>${label}</a>`;
}

function renderBrand() {
  return '<a class="brand-lockup" href="index.html"><span class="casa-mark">casa</span><span class="casa-tld">.co.uk</span></a>';
}

function renderAvatar(href) {
  const initial = casaUserInitial();
  return `<a class="nav-link" href="${href}" title="Your profile" style="padding:4px 8px"><span class="nav-avatar">${initial}</span></a>`;
}

function exploreLinks(page, signedIn) {
  const items = [
    navLink('browse.html', 'Browse', { active: page === 'browse' }),
    navLink('map.html', 'Map', { active: page === 'map' }),
    navLink('feed.html', 'Feed', { active: page === 'feed' }),
  ];
  if (!signedIn) {
    items.push(navLink('how-it-works.html', 'How it works', { active: page === 'how-it-works' }));
  }
  return items.join('');
}

function guestAccountLinks(page) {
  return [
    navDivider(),
    navLink('saved.html', 'Saved', { active: page === 'saved' }),
    navLink('messages.html', 'Messages', { active: page === 'messages' }),
  ].join('');
}

function renderGuestNavRight(page) {
  const signedIn = casaIsSignedIn();
  const user = casaGetUser();
  const isHost = user && user.role === 'host';
  let html = exploreLinks(page, signedIn);

  if (signedIn) {
    html += guestAccountLinks(page);
    html += navDivider();
    if (isHost) {
      html += navLink('host.html', 'Host dashboard', { active: page === 'dashboard' });
    } else {
      html += navLink('list.html', 'Become a host');
    }
    html += renderAvatar('profile.html');
  } else {
    html += navLink('list.html', 'Become a host');
    html += navDivider();
    html += navLink('signup.html', 'Sign in');
    html += navLink('signup.html', 'Join free', { primary: true });
  }
  return html;
}

function renderMarketingNavRight(page) {
  const signedIn = casaIsSignedIn();
  const user = casaGetUser();
  let html = exploreLinks(page, signedIn);

  if (signedIn) {
    html += guestAccountLinks(page);
    html += navDivider();
    if (user && user.role === 'host') {
      html += navLink('host.html', 'Host dashboard');
    } else {
      html += navLink('list.html', 'Become a host');
    }
    html += renderAvatar('profile.html');
  } else {
    html += navLink('list.html', 'Become a host');
    html += navDivider();
    html += navLink('signup.html', 'Sign in');
    html += navLink('waitlist.html', 'Join waitlist', { primary: true });
  }
  return html;
}

function renderHostNav(page) {
  const signedIn = casaIsSignedIn();
  const exitHref = signedIn ? 'profile.html' : 'index.html';
  const exitLabel = signedIn ? 'Switch to guest' : 'Back to site';

  return [
    renderBrand(),
    `<div class="nav-host-meta">
      <span class="host-badge">Host mode</span>
      <a href="${exitHref}" class="nav-host-switch">${exitLabel}</a>
    </div>`,
    `<div class="nav-right">
      ${navLink('host.html', 'Dashboard', { active: page === 'dashboard' })}
      ${navLink('messages.html', 'Inbox <span class="badge" style="margin-left:4px">3</span>', { active: page === 'messages' })}
      ${navLink('host-concierge.html', 'Concierge', { active: page === 'concierge' })}
      ${navLink('list.html', 'Add listing', { active: page === 'list' })}
      ${renderAvatar('profile.html')}
    </div>`,
  ].join('');
}

function renderFlowNav(page) {
  const signedIn = casaIsSignedIn();
  const params = new URLSearchParams(location.search);
  const propId = params.get('id') || params.get('property');
  const backHref = propId ? `property.html?id=${encodeURIComponent(propId)}` : 'browse.html';

  let right = `<a class="nav-back-btn" href="${backHref}" id="backToProperty">
    <svg viewBox="0 0 24 24"><path d="M19 12H5M11 5l-7 7 7 7"/></svg>
    Back to property
  </a>`;

  if (signedIn) {
    right += navDivider();
    right += navLink('browse.html', 'Browse');
    right += navLink('messages.html', 'Messages');
    right += renderAvatar('profile.html');
  } else {
    right += navDivider();
    right += navLink('signup.html', 'Sign in to book faster');
  }

  return `${renderBrand()}<div class="nav-right">${right}</div>`;
}

function renderMinimalNav() {
  const signedIn = casaIsSignedIn();
  let right = [
    navLink('browse.html', 'Browse'),
    navLink('how-it-works.html', 'How it works'),
  ].join('');

  if (signedIn) {
    right += renderAvatar('profile.html');
  } else {
    right += navLink('signup.html', 'Sign in');
    right += navLink('waitlist.html', 'Join waitlist', { primary: true });
  }

  return `${renderBrand()}<div class="nav-right">${right}</div>`;
}

function inferNavContext() {
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const map = {
    'index.html': { nav: 'marketing', page: 'home' },
    'how-it-works.html': { nav: 'marketing', page: 'how-it-works' },
    'waitlist.html': { nav: 'marketing', page: 'waitlist' },
    'browse.html': { nav: 'guest', page: 'browse' },
    'map.html': { nav: 'guest', page: 'map' },
    'feed.html': { nav: 'guest', page: 'feed' },
    'property.html': { nav: 'guest', page: 'property' },
    'saved.html': { nav: 'guest', page: 'saved' },
    'messages.html': { nav: 'guest', page: 'messages' },
    'profile.html': { nav: 'guest', page: 'profile' },
    'host.html': { nav: 'host', page: 'dashboard' },
    'host-concierge.html': { nav: 'host', page: 'concierge' },
    'list.html': { nav: 'host-flow', page: 'list' },
    'booking.html': { nav: 'flow', page: 'booking' },
    'privacy.html': { nav: 'minimal', page: 'privacy' },
    'terms.html': { nav: 'minimal', page: 'terms' },
    'signup.html': { nav: 'auth', page: 'signup' },
  };
  return map[path] || { nav: 'guest', page: '' };
}

function casaNavInit() {
  const inferred = inferNavContext();
  const context = document.body.dataset.casaNav || inferred.nav;
  const page = document.body.dataset.casaPage || inferred.page;

  if (context === 'auth') return;

  const nav = document.querySelector('.casa-nav');
  if (!nav) return;

  if (document.body.dataset.casaSolid === 'true' || ['map', 'messages', 'profile', 'host', 'concierge', 'waitlist'].includes(page)) {
    nav.classList.add('solid');
  }

  const preserveCenter = nav.querySelector('.nav-search') || nav.dataset.casaPreserveCenter;

  if (context === 'host') {
    nav.innerHTML = renderHostNav(page);
    return;
  }

  if (context === 'flow') {
    nav.innerHTML = renderFlowNav(page);
    return;
  }

  if (context === 'minimal') {
    nav.innerHTML = renderMinimalNav();
    return;
  }

  const right = context === 'marketing'
    ? renderMarketingNavRight(page)
    : renderGuestNavRight(page);

  if (preserveCenter) {
    let rightEl = nav.querySelector('.nav-right');
    if (!rightEl) {
      rightEl = document.createElement('div');
      rightEl.className = 'nav-right';
      nav.appendChild(rightEl);
    }
    rightEl.innerHTML = right;
    return;
  }

  nav.innerHTML = `${renderBrand()}<div class="nav-right">${right}</div>`;
}

function casaEnhanceHostFlowBar() {
  const bar = document.querySelector('.top-bar');
  if (!bar || document.body.dataset.casaNav !== 'host-flow') return;

  const exit = bar.querySelector('a[href="host.html"]');
  if (exit && !casaIsSignedIn()) {
    exit.href = 'index.html';
    exit.textContent = '';
    exit.innerHTML = '<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18 18 6"/></svg> Exit';
    exit.title = 'Return to homepage';
  }
}

function casaEnhanceProfileFromUser() {
  if (!location.pathname.endsWith('profile.html')) return;
  const user = casaGetUser();
  if (!user || !user.name) return;

  const initial = user.name[0].toUpperCase();
  const av = document.getElementById('avLetter');
  if (av) av.textContent = initial;
  const first = document.getElementById('firstNm');
  if (first && !first.dataset.userLoaded) {
    first.value = user.name;
    first.dataset.userLoaded = '1';
  }
  const about = document.getElementById('aboutName');
  if (about) about.textContent = user.name;

  if (user.role === 'host') {
    document.body.className = 'mode-host';
    const hostBtn = document.querySelector('.role-toggle button:last-child');
    const guestBtn = document.querySelector('.role-toggle button:first-child');
    if (hostBtn && guestBtn) {
      hostBtn.classList.add('active');
      guestBtn.classList.remove('active');
    }
  }
}

function casaWireSignOutLinks() {
  document.querySelectorAll('[data-casa-signout]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      casaSignOut();
    });
  });
}

function casaWireSidebarDeadLinks() {
  document.querySelectorAll('a.side-link').forEach((link) => {
    const text = (link.textContent || '').toLowerCase();
    if (text.includes('privacy')) link.href = 'privacy.html';
    else if (text.includes('notifications')) link.href = '#preferences';
    else if (text.includes('personal')) link.href = '#about';
    else if (text.includes('login') || text.includes('security')) link.href = 'signup.html';
    else if (text.includes('payment')) {
      link.href = '#preferences';
      link.addEventListener('click', (e) => {
        if (!link.getAttribute('href').startsWith('#')) return;
        e.preventDefault();
        if (window.casaToast) casaToast('Payments — available when bookings go live');
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  casaNavInit();
  casaEnhanceHostFlowBar();
  casaEnhanceProfileFromUser();
  casaWireSignOutLinks();
  casaWireSidebarDeadLinks();
});
