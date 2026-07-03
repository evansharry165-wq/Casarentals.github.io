/* Casa — Supabase client (Phase 06)
   Load AFTER the supabase-js CDN script and BEFORE casa.js on any page
   that needs backend access. Publishable key is safe for client code —
   it's the modern equivalent of the old anon key and relies entirely on
   RLS policies (see supabase/schema.sql) to scope access. */

const CASA_SUPABASE_URL = 'https://ktxhkoxjrgkjxrszmbii.supabase.co';
const CASA_SUPABASE_KEY = 'sb_publishable_I6RcQbrmMcueA8uPdlGVxA_gTm2M5rM';

const casaSupabase = window.supabase.createClient(CASA_SUPABASE_URL, CASA_SUPABASE_KEY);

window.casaSupabase = casaSupabase;
