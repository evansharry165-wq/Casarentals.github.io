-- ═══════════════════════════════════════════════════════════════
-- Casa — per-listing cancellation policy
--
-- Casa doesn't process or hold payment (bank transfer, arranged directly
-- between guest and host — see CASA_PROJECT_BRIEF.md), so it has no funds
-- to refund and can't enforce a cancellation policy. This column exists
-- purely to make whatever the host has agreed clearly visible to a guest
-- before they enquire — the same spirit as min_stay, not a Casa-backed
-- guarantee. list.html pre-fills a sensible default, editable per listing;
-- property.html and booking.html both display it before a guest commits.
--
-- ADDITIVE & IDEMPOTENT — safe to re-run. Apply after schema.sql.
-- ═══════════════════════════════════════════════════════════════

alter table properties
  add column if not exists cancellation_policy text not null
  default 'Free cancellation up to 7 days before check-in.';
