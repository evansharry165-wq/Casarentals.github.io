/* ═══════════════════════════════════════════════
   Casa.co.uk — Core JavaScript
   Version 1.0
   ═══════════════════════════════════════════════ */

'use strict';

/* ── In-memory store (replaced by Supabase in full-stack) ── */
const CasaStore = {
  posts: JSON.parse(localStorage.getItem('casa_posts') || '[]'),
  user:  JSON.parse(localStorage.getItem('casa_user')  || 'null'),

  savePosts() { localStorage.setItem('casa_posts', JSON.stringify(this.posts)); },
  saveUser()  { localStorage.setItem('casa_user',  JSON.stringify(this.user));  },

  addPost(post) {
    const newPost = {
      id:         Date.now(),
      created_at: new Date().toISOString(),
      likes:      0,
      replies:    0,
      liked:      false,
      saved:      false,
      ...post
    };
    this.posts.unshift(newPost);
    this.savePosts();
    return newPost;
  },

  toggleLike(id) {
    const p = this.posts.find(x => x.id === id);
    if (!p) return;
    p.liked = !p.liked;
    this.savePosts();
    return p;
  },

  toggleSave(id) {
    const p = this.posts.find(x => x.id === id);
    if (!p) return;
    p.saved = !p.saved;
    this.savePosts();
    return p;
  },

  setUser(user) {
    this.user = user;
    this.saveUser();
  },

  clearUser() {
    this.user = null;
    localStorage.removeItem('casa_user');
  }
};

/* ── Feed state ── */
const FeedState = {
  activeTag:  null,
  activeTab:  'all',
  searchQuery: '',

  filter(posts) {
    return posts.filter(p => {
      const tags    = p.tags || [];
      const tagOk   = !this.activeTag  || tags.includes(this.activeTag);
      const tabOk   = this.activeTab === 'all'
                   || (this.activeTab === 'hosts'     && p.type === 'host')
                   || (this.activeTab === 'guests'    && p.type === 'guest')
                   || (this.activeTab === 'questions' && p.type === 'question');
      const q       = this.searchQuery.toLowerCase();
      const searchOk = !q
                   || (p.body  || '').toLowerCase().includes(q)
                   || (p.name  || '').toLowerCase().includes(q)
                   || tags.some(t => t.toLowerCase().includes(q));
      return tagOk && tabOk && searchOk;
    });
  }
};

/* ── Toast ── */
function showToast(msg, duration = 2200) {
  let el = document.getElementById('casaToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'casaToast';
    el.className = 'casa-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ── Hashtag header ── */
function showHashtagHeader(tag) {
  const header = document.getElementById('hashtagHeader');
  if (!header) return;
  const COUNTS = {
    lakedistrict:214, cornwall:198, edinburgh:145, norfolk:112, yorkshire:98,
    cotswolds:87, scottishhighlands:76, isleofskye:67, cottage:341, seaview:156,
    glamping:89, petfriendly:134, familyfriendly:178, lastminute:67,
    snowdonia:54, pembrokeshire:48, causewaycoast:29, cairngorms:43, antrim:18
  };
  const count = COUNTS[tag] || '—';
  document.getElementById('hashtagTitle').textContent = '#' + tag;
  document.getElementById('hashtagMeta').textContent  = count + ' posts · hosts and guests';
  header.classList.add('visible');
}

function hideHashtagHeader() {
  const header = document.getElementById('hashtagHeader');
  if (header) header.classList.remove('visible');
}

/* ── Time formatting ── */
function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  if (mins  < 1)   return 'Just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}

/* ── Post card HTML builder ── */
function buildPostCard(post) {
  const isHost     = post.type === 'host';
  const isGuest    = post.type === 'guest';
  const avCls      = isHost ? 'avatar-host' : 'avatar-guest';
  const hostBadge  = isHost  ? '<span class="badge badge-host">Host</span>'  : '';
  const guestBadge = isGuest || post.type==='question' ? '<span class="badge badge-guest">Guest</span>' : '';
  const verBadge   = post.verified ? '<span class="badge badge-verified">✓ Verified</span>' : '';
  const locStr     = post.location ? ` · ${post.location}` : '';
  const timeStr    = post.created_at ? timeAgo(post.created_at) : (post.time || '');

  /* body — highlight #hashtags */
  const bodyHtml = (post.body || '')
    .replace(/#(\w+)/g, '<span class="post-hashtag" onclick="filterTag(\'$1\')">#$1</span>');

  /* explicit tags as pills */
  const tagPills = (post.tags || []).length
    ? '<br><br>' + post.tags.map(t =>
        `<span class="post-hashtag" onclick="filterTag('${t}')">#${t}</span>`
      ).join(' ')
    : '';

  /* images */
  let imgsHtml = '';
  if ((post.images || []).length) {
    const cls = post.images.length >= 3 ? 'imgs-3' : post.images.length === 2 ? 'imgs-2' : '';
    const shown = post.images.slice(0, 3);
    imgsHtml = `<div class="post-images ${cls}">
      ${shown.map(src => `<div class="post-img"><img src="${src}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='📷'"></div>`).join('')}
    </div>`;
  }

  /* price */
  const pricePill = (isHost && post.price)
    ? `<div class="price-pill">£${post.price} <span class="per">/ night</span></div>` : '';

  /* book button */
  const bookBtn = isHost
    ? `<button class="post-action book-cta" onclick="event.stopPropagation();window.location.href='pages/booking.html'">Enquire to book →</button>` : '';

  return `
  <article class="post-card" data-id="${post.id}">
    <div class="post-header">
      <div class="avatar ${avCls}">${(post.name||'?').substring(0,2).toUpperCase()}</div>
      <div style="flex:1;min-width:0;">
        <div class="post-name">
          ${post.name || 'Anonymous'}
          ${hostBadge}${guestBadge}${verBadge}
        </div>
        <div class="post-time">${timeStr}${locStr}</div>
      </div>
    </div>
    <div class="post-body">${bodyHtml}${tagPills}</div>
    ${imgsHtml}
    ${pricePill}
    <div class="post-actions">
      <button class="post-action ${post.liked?'liked':''}" onclick="event.stopPropagation();handleLike(${post.id},this)">
        ${post.liked ? '❤️' : '🤍'} ${post.liked ? (post.likes||0)+1 : (post.likes||0)}
      </button>
      <button class="post-action" onclick="event.stopPropagation();showToast('Replies coming soon!')">
        💬 ${post.replies || 0}
      </button>
      <button class="post-action" onclick="event.stopPropagation();handleShare(${post.id})">🔁 Share</button>
      <button class="post-action" onclick="event.stopPropagation();handleSave(${post.id},this)">
        ${post.saved ? '🔖' : '🔖'} ${post.saved ? 'Saved' : 'Save'}
      </button>
      ${bookBtn}
    </div>
  </article>`;
}

/* ── Feed interaction handlers ── */
function handleLike(id, btn) {
  const p = CasaStore.toggleLike(id);
  if (!p) return;
  const count = p.liked ? (p.likes||0)+1 : (p.likes||0);
  btn.innerHTML = `${p.liked ? '❤️' : '🤍'} ${count}`;
  btn.className = `post-action ${p.liked ? 'liked' : ''}`;
  showToast(p.liked ? 'Liked!' : 'Like removed');
}

function handleSave(id, btn) {
  const p = CasaStore.toggleSave(id);
  if (!p) return;
  btn.innerHTML = `🔖 ${p.saved ? 'Saved' : 'Save'}`;
  showToast(p.saved ? '🔖 Saved to your list!' : 'Removed from saved');
}

function handleShare(id) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href + '?post=' + id)
      .then(() => showToast('🔗 Link copied!'))
      .catch(() => showToast('🔗 Link: ' + window.location.href));
  } else {
    showToast('🔗 Share link copied!');
  }
}

/* ── Compose post ── */
function submitPost(formData) {
  const { body, type, price, location, tags: extraTags } = formData;
  if (!body || !body.trim()) { showToast('Please write something first.'); return null; }

  /* extract #tags from body text */
  const inlineTags = [...body.matchAll(/#(\w+)/g)].map(m => m[1].toLowerCase());
  const allTags    = [...new Set([...inlineTags, ...(extraTags || [])])];

  const user = CasaStore.user;
  const post = CasaStore.addPost({
    name:     user ? user.name : 'Anonymous',
    type:     type || (user ? user.role : 'guest'),
    verified: user ? user.verified : false,
    location: location || '',
    body:     body.trim(),
    tags:     allTags,
    images:   [],
    price:    price || null,
    likes:    0,
    replies:  0,
    liked:    false,
    saved:    false
  });
  showToast('Posted to the Casa community!');
  return post;
}

/* ── Tag filter (called by sidebar + post hashtags) ── */
function filterTag(tag) {
  FeedState.activeTag = tag;
  showHashtagHeader(tag);
  if (typeof renderFeed === 'function') renderFeed();
}

function clearTag() {
  FeedState.activeTag = null;
  hideHashtagHeader();
  document.querySelectorAll('.vibe-chip').forEach(c => c.classList.remove('active'));
  if (typeof renderFeed === 'function') renderFeed();
}

function setFeedTab(el, tab) {
  document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  FeedState.activeTab = tab;
  if (typeof renderFeed === 'function') renderFeed();
}

function vibeClick(el, tag) {
  const wasActive = el.classList.contains('active');
  document.querySelectorAll('.vibe-chip').forEach(c => c.classList.remove('active'));
  if (wasActive) { clearTag(); return; }
  el.classList.add('active');
  filterTag(tag);
}

/* ── Auth helpers ── */
function getUser()    { return CasaStore.user; }
function isLoggedIn() { return !!CasaStore.user; }

function signIn(name, email, role) {
  CasaStore.setUser({ name, email, role, verified: false });
  showToast(`Welcome, ${name}!`);
  return CasaStore.user;
}

function signOut() {
  CasaStore.clearUser();
  showToast('Signed out. See you soon!');
  setTimeout(() => window.location.href = '../index.html', 1000);
}

/* ── Nav auth state ── */
function updateNavAuth() {
  const user = getUser();
  const authLinks = document.getElementById('authLinks');
  if (!authLinks) return;
  if (user) {
    authLinks.innerHTML = `
      <li><a href="../pages/profile.html">👤 ${user.name}</a></li>
      <li><a href="../pages/messages.html">📩 Messages</a></li>
      <li><a href="#" onclick="signOut()" class="btn-nav-cta" style="padding:.4rem .75rem;border-radius:6px;">Sign out</a></li>`;
  } else {
    authLinks.innerHTML = `
      <li><a href="../pages/how-it-works.html">How it works</a></li>
      <li><a href="../pages/list-property.html">List a property</a></li>
      <li><a href="../pages/signin.html">Sign in</a></li>
      <li><a href="../pages/signup.html" class="btn-nav-cta">Join free</a></li>`;
  }
}

document.addEventListener('DOMContentLoaded', updateNavAuth);
