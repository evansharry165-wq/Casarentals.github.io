/* Casa shared utilities — safe to load on every page */

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
  casaToast(saved ? 'Saved to your list ♥' : 'Removed from saved');
  return saved;
}

window.casaIsSaved = casaIsSaved;
window.casaToggleSaved = casaToggleSaved;

/** Show welcome / signed-in toast from URL params (?welcome=1 or ?signedin=1) */
function casaHandleAuthRedirectToasts() {
  const qp = new URLSearchParams(location.search);
  if (qp.get('welcome')) {
    setTimeout(() => casaToast('Welcome to Casa — you\'re all set 🏡'), 400);
  } else if (qp.get('signedin')) {
    setTimeout(() => casaToast('Signed in — welcome back'), 400);
  }
}

(function casaLoadSeo() {
  if (document.querySelector('script[src*="casa-seo.js"]')) return;
  const s = document.createElement('script');
  s.src = 'casa-seo.js';
  document.head.appendChild(s);
})();

document.addEventListener('DOMContentLoaded', () => {
  casaHandleAuthRedirectToasts();

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
    closeBookingModal();
    bookingForm.reset();
    casaToast('Enquiry message sent safely!');
  });

  /* ─── Likes, saves, follows ─── */
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.querySelector('.ct');
      if (!label) return;
      let count = parseInt(label.textContent, 10) || 0;
      if (btn.classList.contains('liked')) {
        btn.classList.remove('liked');
        label.textContent = count - 1;
      } else {
        btn.classList.add('liked');
        label.textContent = count + 1;
      }
    });
  });

  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const svg = btn.querySelector('svg');
      const textNode = Array.from(btn.childNodes).find(n =>
        n.nodeType === Node.TEXT_NODE && (n.textContent.includes('Save') || n.textContent.includes('Saved'))
      );
      if (btn.classList.contains('saved')) {
        btn.classList.remove('saved');
        if (svg) svg.removeAttribute('fill');
        if (textNode) textNode.textContent = ' Save';
      } else {
        btn.classList.add('saved');
        if (svg) svg.setAttribute('fill', 'currentColor');
        if (textNode) textNode.textContent = ' Saved';
      }
    });
  });

  document.querySelectorAll('.follow-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (btn.classList.contains('following')) {
        btn.classList.remove('following');
        btn.textContent = 'Follow';
      } else {
        btn.classList.add('following');
        btn.textContent = 'Following';
      }
    });
  });
});
