/** Casa Concierge — host AI assistant settings (prototype / localStorage) */

const CASA_CONCIERGE_KEY = 'casa:concierge';

const CASA_CONCIERGE_DEFAULTS = {
  enabled: false,
  plan: 'monthly',
  minNights: 2,
  maxGuests: 6,
  minLeadDays: 3,
  priceFloor: 150,
  petsPolicy: 'allowed',
  autoAccept: false,
  autoDeclineUnderMin: true,
  checkInFrom: '15:00',
  checkOutBy: '10:00',
  tone: 'warm',
  escalateDeposit: true,
  escalateCustomRequests: true,
  properties: [1],
};

function casaGetConciergeSettings() {
  try {
    return { ...CASA_CONCIERGE_DEFAULTS, ...JSON.parse(localStorage.getItem(CASA_CONCIERGE_KEY) || '{}') };
  } catch {
    return { ...CASA_CONCIERGE_DEFAULTS };
  }
}

function casaSaveConciergeSettings(settings) {
  localStorage.setItem(CASA_CONCIERGE_KEY, JSON.stringify(settings));
}

function casaConciergeEnabled() {
  return !!casaGetConciergeSettings().enabled;
}

function casaConciergePriceLabel(plan) {
  return plan === 'per-booking'
    ? '2% on AI-confirmed bookings'
    : '£24/month per listing';
}

/** Demo: would an enquiry pass host rules? */
function casaConciergeEvaluate(enquiry) {
  const s = casaGetConciergeSettings();
  const reasons = [];
  let action = 'accept';

  if (enquiry.nights < s.minNights) {
    action = 'decline';
    reasons.push(`Minimum stay is ${s.minNights} nights`);
  }
  if (enquiry.guests > s.maxGuests) {
    action = 'decline';
    reasons.push(`Maximum ${s.maxGuests} guests`);
  }
  if (enquiry.pricePerNight < s.priceFloor) {
    action = 'decline';
    reasons.push(`Below your £${s.priceFloor}/night floor`);
  }
  if (enquiry.pets && s.petsPolicy === 'none') {
    action = 'decline';
    reasons.push('Pets not accepted on this listing');
  }
  if (enquiry.leadDays < s.minLeadDays) {
    action = 'escalate';
    reasons.push(`Less than ${s.minLeadDays} days notice — needs your approval`);
  }
  if (enquiry.customRequest && s.escalateCustomRequests) {
    action = action === 'decline' ? 'decline' : 'escalate';
    reasons.push('Custom request — flagged for you');
  }

  if (action === 'accept' && s.autoAccept) {
    return { action: 'auto_accept', reasons: ['Matches your rules — Concierge will confirm'] };
  }
  if (action === 'decline' && s.autoDeclineUnderMin) {
    return { action: 'auto_decline', reasons };
  }
  if (action === 'escalate') {
    return { action: 'escalate', reasons };
  }
  return { action: 'draft_reply', reasons: reasons.length ? reasons : ['Concierge will draft a reply for your review'] };
}

window.casaGetConciergeSettings = casaGetConciergeSettings;
window.casaSaveConciergeSettings = casaSaveConciergeSettings;
window.casaConciergeEnabled = casaConciergeEnabled;
window.casaConciergeEvaluate = casaConciergeEvaluate;
