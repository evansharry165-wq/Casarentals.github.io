/** Casa data layer — Supabase when configured, localStorage fallback */

const CASA_ENQUIRIES_KEY = 'casa:enquiries';
const CASA_WAITLIST_KEY = 'casa:waitlist';

function casaGetEnquiriesLocal() {
  try {
    return JSON.parse(localStorage.getItem(CASA_ENQUIRIES_KEY) || '[]');
  } catch {
    return [];
  }
}

function casaSaveEnquiryLocal(entry) {
  const list = casaGetEnquiriesLocal();
  list.unshift(entry);
  localStorage.setItem(CASA_ENQUIRIES_KEY, JSON.stringify(list));
  return entry;
}

function casaBuildEnquiryEntry(enquiry) {
  return {
    id: enquiry.id || `enq-${Date.now()}`,
    ref: enquiry.ref,
    propertyId: enquiry.propertyId,
    propertyTitle: enquiry.propertyTitle,
    hostName: enquiry.hostName,
    hostInitial: enquiry.hostInitial,
    guestName: enquiry.guestName,
    guestEmail: enquiry.guestEmail,
    checkin: enquiry.checkin,
    checkout: enquiry.checkout,
    guests: enquiry.guests,
    pets: !!enquiry.pets,
    message: enquiry.message,
    pricePerNight: enquiry.pricePerNight,
    status: enquiry.status || 'pending',
    createdAt: enquiry.createdAt || new Date().toISOString(),
  };
}

/** Save enquiry — tries Supabase first, always mirrors to localStorage */
async function casaSaveEnquiry(enquiry) {
  let entry = casaBuildEnquiryEntry(enquiry);

  if (window.casaSupabaseConfigured?.() && window.casaSupabaseInsertEnquiry) {
    try {
      const remote = await casaSupabaseInsertEnquiry(entry);
      if (remote) entry = remote;
    } catch (err) {
      console.warn('[Casa] Supabase enquiry save failed, using local only', err);
      if (window.casaToast) casaToast('Saved locally — sync when back online');
    }
  }

  return casaSaveEnquiryLocal(entry);
}

/** Sync read for legacy callers — local cache only */
function casaGetEnquiries() {
  return casaGetEnquiriesLocal();
}

/** Fetch enquiries — remote (if signed in) merged with local */
async function casaFetchEnquiries() {
  let remote = [];
  if (window.casaSupabaseConfigured?.() && window.casaSupabaseFetchEnquiries) {
    try {
      remote = await casaSupabaseFetchEnquiries();
    } catch (err) {
      console.warn('[Casa] Could not fetch remote enquiries', err);
    }
  }

  const local = casaGetEnquiriesLocal();
  const remoteRefs = new Set(remote.map((e) => e.ref));
  const merged = [
    ...remote,
    ...local.filter((e) => !remoteRefs.has(e.ref)),
  ];

  merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return merged;
}

function casaFormatEnquiryDates(checkin, checkout) {
  const fmt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const nights = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
  return `${fmt(checkin)} → ${fmt(checkout)} (${nights} night${nights > 1 ? 's' : ''})`;
}

function casaEnquiryToConvo(enq) {
  const hostFirst = (enq.hostName || 'Host').split(' ')[0];
  const now = new Date(enq.createdAt);
  const ts = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const dateLabel = casaFormatEnquiryDates(enq.checkin, enq.checkout);

  return {
    id: enq.id,
    name: enq.hostName,
    ni: true,
    av: enq.hostInitial || hostFirst[0],
    avc: '',
    prop: enq.propertyTitle,
    propertyId: enq.propertyId,
    time: 'Just now',
    tag: 'enquiry',
    tagLabel: 'Enquiry sent',
    unread: false,
    online: false,
    preview: enq.message.length > 55 ? `${enq.message.slice(0, 55)}…` : enq.message,
    st: 'pending',
    stTitle: `Awaiting ${hostFirst}'s reply`,
    stBody: 'Your enquiry was sent just now. Hosts usually reply within a few hours.',
    meta: `Ref ${enq.ref} · sent just now`,
    badge: true,
    qr: ['Thanks — looking forward to hearing back', 'Could you confirm availability?', 'What is the total price?'],
    msgs: [{
      f: 'me',
      t: enq.message,
      ts,
      prop: true,
      propertyId: enq.propertyId,
      propertyTitle: enq.propertyTitle,
      dates: dateLabel,
      guests: enq.guests,
      pets: enq.pets,
      pricePerNight: enq.pricePerNight,
    }],
    ref: enq.ref,
    isUserEnquiry: true,
  };
}

function casaGetWaitlistLocal() {
  try {
    return JSON.parse(localStorage.getItem(CASA_WAITLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

async function casaSaveWaitlistEntry(entry) {
  const record = {
    id: `wl-${Date.now()}`,
    fname: entry.fname,
    lname: entry.lname,
    email: entry.email,
    role: entry.role,
    region: entry.region,
    notes: entry.notes || '',
    createdAt: new Date().toISOString(),
  };

  if (window.casaSupabaseConfigured?.() && window.casaSupabaseInsertWaitlist) {
    try {
      await casaSupabaseInsertWaitlist(entry);
    } catch (err) {
      console.warn('[Casa] Supabase waitlist save failed', err);
    }
  }

  const list = casaGetWaitlistLocal();
  list.push(record);
  localStorage.setItem(CASA_WAITLIST_KEY, JSON.stringify(list));

  let position = list.length;
  if (window.casaSupabaseWaitlistCount) {
    try {
      const total = await casaSupabaseWaitlistCount();
      if (total) position = total;
    } catch { /* use local position */ }
  }

  return { record, position };
}

function casaGetWaitlist() {
  return casaGetWaitlistLocal();
}

async function casaWaitlistCount() {
  if (window.casaSupabaseConfigured?.() && window.casaSupabaseWaitlistCount) {
    try {
      const total = await casaSupabaseWaitlistCount();
      if (total) return total;
    } catch { /* fall through */ }
  }
  return casaGetWaitlistLocal().length;
}

window.casaGetEnquiries = casaGetEnquiries;
window.casaFetchEnquiries = casaFetchEnquiries;
window.casaSaveEnquiry = casaSaveEnquiry;
window.casaEnquiryToConvo = casaEnquiryToConvo;
window.casaGetWaitlist = casaGetWaitlist;
window.casaSaveWaitlistEntry = casaSaveWaitlistEntry;
window.casaWaitlistCount = casaWaitlistCount;
