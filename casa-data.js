/** Casa client-side data layer — swap for Supabase in production */

const CASA_ENQUIRIES_KEY = 'casa:enquiries';
const CASA_WAITLIST_KEY = 'casa:waitlist';

function casaGetEnquiries() {
  try {
    return JSON.parse(localStorage.getItem(CASA_ENQUIRIES_KEY) || '[]');
  } catch {
    return [];
  }
}

function casaSaveEnquiry(enquiry) {
  const entry = {
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
  const list = casaGetEnquiries();
  list.unshift(entry);
  localStorage.setItem(CASA_ENQUIRIES_KEY, JSON.stringify(list));
  return entry;
}

function casaFormatEnquiryDates(checkin, checkout) {
  const fmt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const nights = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
  return `${fmt(checkin)} → ${fmt(checkout)} (${nights} night${nights > 1 ? 's' : ''})`;
}

function casaEnquiryToConvo(enq) {
  const hostFirst = (enq.hostName || 'Host').split(' ')[0];
  const guestInitial = (enq.guestName || 'You')[0]?.toUpperCase() || 'Y';
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

function casaGetWaitlist() {
  try {
    return JSON.parse(localStorage.getItem(CASA_WAITLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

function casaSaveWaitlistEntry(entry) {
  const list = casaGetWaitlist();
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
  list.push(record);
  localStorage.setItem(CASA_WAITLIST_KEY, JSON.stringify(list));
  return { record, position: list.length };
}

function casaWaitlistCount() {
  return casaGetWaitlist().length;
}

window.casaGetEnquiries = casaGetEnquiries;
window.casaSaveEnquiry = casaSaveEnquiry;
window.casaEnquiryToConvo = casaEnquiryToConvo;
window.casaGetWaitlist = casaGetWaitlist;
window.casaSaveWaitlistEntry = casaSaveWaitlistEntry;
window.casaWaitlistCount = casaWaitlistCount;
