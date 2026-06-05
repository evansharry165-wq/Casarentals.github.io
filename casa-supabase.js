/** Casa ↔ Supabase client (auth + enquiries + waitlist) */

let _client = null;
let _initPromise = null;
let _authReadyResolvers = [];

function casaConfig() {
  return window.CASA_CONFIG || {};
}

function casaSupabaseConfigured() {
  const { supabaseUrl, supabaseAnonKey } = casaConfig();
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('YOUR_PROJECT')) return false;
  if (supabaseAnonKey.includes('YOUR_SUPABASE')) return false;
  return true;
}

function casaSyncSessionToLocal(session) {
  if (!session?.user) {
    localStorage.removeItem('casa:user');
    window.dispatchEvent(new CustomEvent('casa:auth', { detail: { signedIn: false } }));
    return;
  }
  const meta = session.user.user_metadata || {};
  const fullName = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User';
  const firstName = fullName.split(' ')[0] || fullName;
  const user = {
    id: session.user.id,
    name: firstName,
    fullName,
    email: session.user.email,
    role: meta.role || 'guest',
    signedIn: true,
  };
  localStorage.setItem('casa:user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('casa:auth', { detail: { signedIn: true, user } }));
}

function casaLoadSupabaseScript() {
  if (window.supabase?.createClient) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load Supabase SDK'));
    document.head.appendChild(s);
  });
}

async function casaSupabaseInit() {
  if (!casaSupabaseConfigured()) return null;
  if (_client) return _client;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    await casaLoadSupabaseScript();
    const { supabaseUrl, supabaseAnonKey } = casaConfig();
    _client = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    _client.auth.onAuthStateChange((_event, session) => {
      casaSyncSessionToLocal(session);
      if (window.casaNavRefresh) window.casaNavRefresh();
    });

    const { data: { session } } = await _client.auth.getSession();
    casaSyncSessionToLocal(session);
    _authReadyResolvers.forEach((fn) => fn(session));
    _authReadyResolvers = [];
    return _client;
  })().catch((err) => {
    console.warn('[Casa] Supabase init failed — using demo mode', err);
    _initPromise = null;
    return null;
  });

  return _initPromise;
}

function casaOnAuthReady(fn) {
  if (_client) {
    _client.auth.getSession().then(({ data: { session } }) => fn(session));
    return;
  }
  _authReadyResolvers.push(fn);
  casaSupabaseInit();
}

async function casaAuthSignUp({ email, password, fname, lname, role }) {
  const client = await casaSupabaseInit();
  if (!client) return { mode: 'demo' };

  const fullName = `${fname} ${lname}`.trim();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });
  if (error) throw error;

  if (data.session) {
    casaSyncSessionToLocal(data.session);
  } else if (data.user) {
    localStorage.setItem('casa:user', JSON.stringify({
      id: data.user.id,
      name: fname,
      fullName,
      email,
      role,
      signedIn: true,
      pendingConfirm: true,
    }));
  }

  return { mode: 'supabase', data, needsConfirm: !data.session };
}

async function casaAuthSignIn({ email, password }) {
  const client = await casaSupabaseInit();
  if (!client) return { mode: 'demo' };

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  casaSyncSessionToLocal(data.session);
  return { mode: 'supabase', data };
}

async function casaAuthSignOut() {
  const client = await casaSupabaseInit();
  if (client) await client.auth.signOut();
  localStorage.removeItem('casa:user');
}

function casaRowToEnquiry(row) {
  return {
    id: row.id,
    ref: row.ref,
    propertyId: row.property_id,
    propertyTitle: row.property_title,
    hostName: row.host_name,
    hostInitial: row.host_initial,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    checkin: row.checkin,
    checkout: row.checkout,
    guests: row.guests,
    pets: row.pets,
    message: row.message,
    pricePerNight: row.price_per_night,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function casaSupabaseInsertEnquiry(entry) {
  const client = await casaSupabaseInit();
  if (!client) return null;

  const { data: { user } } = await client.auth.getUser();
  const payload = {
    ref: entry.ref,
    property_id: entry.propertyId,
    property_title: entry.propertyTitle,
    host_name: entry.hostName,
    host_initial: entry.hostInitial,
    guest_id: user?.id || null,
    guest_name: entry.guestName,
    guest_email: entry.guestEmail,
    checkin: entry.checkin,
    checkout: entry.checkout,
    guests: entry.guests,
    pets: entry.pets,
    message: entry.message,
    price_per_night: entry.pricePerNight,
    status: entry.status || 'pending',
  };

  const { data, error } = await client.from('enquiries').insert(payload).select().single();
  if (error) throw error;
  return casaRowToEnquiry(data);
}

async function casaSupabaseFetchEnquiries() {
  const client = await casaSupabaseInit();
  if (!client) return [];

  const { data: { user } } = await client.auth.getUser();
  if (!user) return [];

  const { data, error } = await client
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data || []).map(casaRowToEnquiry);
}

async function casaSupabaseInsertWaitlist(entry) {
  const client = await casaSupabaseInit();
  if (!client) return null;

  const { data, error } = await client.from('waitlist_entries').insert({
    fname: entry.fname,
    lname: entry.lname,
    email: entry.email,
    role: entry.role,
    region: entry.region,
    notes: entry.notes || '',
  }).select().single();

  if (error) throw error;
  return data;
}

async function casaSupabaseWaitlistCount() {
  const client = await casaSupabaseInit();
  if (!client) return null;

  const { data, error } = await client.rpc('waitlist_count');
  if (error) throw error;
  return Number(data) || 0;
}

window.casaSupabaseConfigured = casaSupabaseConfigured;
window.casaSupabaseInit = casaSupabaseInit;
window.casaOnAuthReady = casaOnAuthReady;
window.casaAuthSignUp = casaAuthSignUp;
window.casaAuthSignIn = casaAuthSignIn;
window.casaAuthSignOut = casaAuthSignOut;
window.casaSupabaseInsertEnquiry = casaSupabaseInsertEnquiry;
window.casaSupabaseFetchEnquiries = casaSupabaseFetchEnquiries;
window.casaSupabaseInsertWaitlist = casaSupabaseInsertWaitlist;
window.casaSupabaseWaitlistCount = casaSupabaseWaitlistCount;
window.casaRowToEnquiry = casaRowToEnquiry;

document.addEventListener('DOMContentLoaded', () => {
  if (casaSupabaseConfigured()) casaSupabaseInit();
});
