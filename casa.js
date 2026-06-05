document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. Toast Notification Utility ─── */
  const showToast = (message) => {
    const toast = document.getElementById('casaToast');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  };

  /* ─── 2. Inline Replies Toggle & Dynamic Submission ─── */
  document.querySelectorAll('.reply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const thread = btn.closest('.post').querySelector('.reply-thread');
      if (thread) {
        thread.classList.toggle('open');
      }
    });
  });

  document.querySelectorAll('.reply-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const text = input.value.trim();
      if (!text) return;

      const thread = form.closest('.reply-thread');
      
      // Build a new reply template node
      const replyCard = document.createElement('div');
      replyCard.className = 'reply-card';
      replyCard.innerHTML = `
        <div class="av">J</div>
        <div class="r-content">
          <strong>You</strong> ${text}
          <div class="r-meta">Just now</div>
        </div>
      `;

      // Insert it directly inside the container layout structure above the form
      thread.insertBefore(replyCard, form);
      input.value = '';

      // Increment interactive markup count status text badge
      const countLabel = form.closest('.post').querySelector('.reply-btn .ct');
      if (countLabel) {
        const parsedCount = parseInt(countLabel.innerText) || 0;
        countLabel.innerText = `${parsedCount + 1} replies`;
      }
      
      showToast('Reply posted!');
    });
  });

  /* ─── 3. Authentic Profile Drawer Mapping logic ─── */
  const openProfileDrawer = (data) => {
    document.getElementById('drawerName').innerText = data.username;
    document.getElementById('drawerBio').innerText = data.bio;
    document.getElementById('drawerLocation').innerText = data.location;
    document.getElementById('drawerStays').innerText = data.property;
    
    // Assign proper character visual matching context layout
    const avatarContainer = document.getElementById('drawerAvatar');
    avatarContainer.innerText = data.avatarLetter;
    avatarContainer.className = `av ${data.avatarClass}`;

    // Manage Badge configurations
    const badgeElement = document.getElementById('drawerBadge');
    badgeElement.innerText = data.role;
    badgeElement.className = data.role.toLowerCase() === 'host' ? 'badge-host' : 'badge-guest';

    // Update modal trigger dynamic attributes mapping binding logic
    const drawerMsgBtn = document.getElementById('drawerMessageBtn');
    if (drawerMsgBtn) {
      drawerMsgBtn.setAttribute('data-host', data.username);
      drawerMsgBtn.setAttribute('data-property', data.property.split(' ·')[0]);
    }

    // Toggle viewport class states
    document.getElementById('profileDrawerOverlay').classList.add('open');
    document.getElementById('profileDrawer').classList.add('open');
  };

  const closeProfileDrawer = () => {
    document.getElementById('profileDrawerOverlay').classList.remove('open');
    document.getElementById('profileDrawer').classList.remove('open');
  };

  // Extract contextual parameters safely via node attributes mapping
  const extractProfileMetadata = (node) => ({
    username: node.getAttribute('data-username'),
    role: node.getAttribute('data-role'),
    property: node.getAttribute('data-property'),
    location: node.getAttribute('data-location'),
    bio: node.getAttribute('data-bio'),
    avatarLetter: node.getAttribute('data-avatar'),
    avatarClass: node.getAttribute('data-avatar-class') || ''
  });

  // Attach post-card identity interaction boundaries
  document.querySelectorAll('.ph-head .av, .ph-head .name').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const associatedPostNode = el.closest('.post');
      if (associatedPostNode) {
        openProfileDrawer(extractProfileMetadata(associatedPostNode));
      }
    });
  });

  // Attach sidebar element identity interaction paths
  document.querySelectorAll('.sidebar-host').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('follow-btn')) return; // Ignore if clicking follow state toggle
      openProfileDrawer(extractProfileMetadata(el));
    });
  });

  // Wire close elements
  document.getElementById('profileDrawerClose').addEventListener('click', closeProfileDrawer);
  document.getElementById('profileDrawerOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('profileDrawerOverlay')) closeProfileDrawer();
  });

  /* ─── 4. Direct Booking & Enquiry Modal ─── */
  const openBookingModal = (host, property) => {
    document.getElementById('modalHostName').innerText = host;
    document.getElementById('modalPropName').innerText = property;
    document.getElementById('bookingModalOverlay').classList.add('open');
  };

  const closeBookingModal = () => {
    document.getElementById('bookingModalOverlay').classList.remove('open');
  };

  // Universal interception node strategy for dynamic lists components paths
  document.body.addEventListener('click', (e) => {
    const enquireBtn = e.target.closest('.enquire');
    if (enquireBtn) {
      e.preventDefault();
      const host = enquireBtn.getAttribute('data-host') || 'Member';
      const property = enquireBtn.getAttribute('data-property') || 'Request Topic';
      openBookingModal(host, property);
    }
  });

  document.getElementById('bookingModalClose').addEventListener('click', closeBookingModal);
  document.getElementById('bookingModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('bookingModalOverlay')) closeBookingModal();
  });

  document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    closeBookingModal();
    document.getElementById('bookingForm').reset();
    showToast('Enquiry message sent safely!');
  });

  /* ─── 5. General Interaction Polish (Likes & Follow Status) ─── */
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.querySelector('.ct');
      let count = parseInt(label.innerText) || 0;
      if (btn.classList.contains('liked')) {
        btn.classList.remove('liked');
        label.innerText = count - 1;
      } else {
        btn.classList.add('liked');
        label.innerText = count + 1;
      }
    });
  });

  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const svg = btn.querySelector('svg');
      const textNode = Array.from(btn.childNodes).find(n => n.nodeType === Node.TEXT_NODE && (n.textContent.includes('Save') || n.textContent.includes('Saved')));
      
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
        btn.innerText = 'Follow';
      } else {
        btn.classList.add('following');
        btn.innerText = 'Following';
      }
    });
  });
});
