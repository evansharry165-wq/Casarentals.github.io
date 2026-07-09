/** Casa — real error monitoring (Sentry).
 *
 *  Loaded on every real page, after the Sentry CDN bundle
 *  (<script src="https://browser.sentry-cdn.com/...">).
 *
 *  INERT UNTIL CONFIGURED: CASA_SENTRY_DSN below is a placeholder, not a
 *  real project. Sentry.init() is skipped entirely while it's a
 *  placeholder, so this file does nothing (no network calls, no console
 *  noise) until a real DSN is pasted in — see supabase/README.md Phase 11
 *  for exactly what Harry needs to do (create a Sentry account, create a
 *  project, copy its DSN here).
 */
const CASA_SENTRY_DSN = 'REPLACE_WITH_REAL_SENTRY_DSN';

(function () {
  if (typeof Sentry === 'undefined') return;
  if (!CASA_SENTRY_DSN || CASA_SENTRY_DSN === 'REPLACE_WITH_REAL_SENTRY_DSN') {
    console.info('[Casa] Sentry SDK loaded but not initialised — CASA_SENTRY_DSN is still a placeholder (casa-monitoring.js).');
    return;
  }
  Sentry.init({
    dsn: CASA_SENTRY_DSN,
    // Preview builds (this repo's GitHub Pages / local dev) shouldn't
    // pollute the same Sentry project as real casa.co.uk traffic.
    environment: location.hostname === 'casa.co.uk' || location.hostname === 'www.casa.co.uk' ? 'production' : 'preview',
    tracesSampleRate: 0.1,
  });
})();
