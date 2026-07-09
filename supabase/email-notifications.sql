-- ═══════════════════════════════════════════════════════════════
-- Casa — real email notifications
--
-- notifications.sql already has real triggers that fire on the exact
-- events this covers (new enquiry -> host, confirmed/declined -> guest,
-- new message -> recipient) and write a row into `notifications`. This
-- file adds ONE more trigger on that same table: after a row is
-- inserted, if it's a type we email (enquiry or reply), call the
-- send-notification-email Edge Function via pg_net (async HTTP from
-- inside Postgres, enabled by default on all Supabase projects).
--
-- This does NOT duplicate any of notifications.sql's business logic —
-- title/body/recipient are already computed there. This trigger just
-- forwards that same row to the email function.
--
-- ─── BEFORE APPLYING, fill in the two placeholders below ───
--   1. <YOUR-PROJECT-REF> — from your Supabase project URL
--      (https://<project-ref>.supabase.co), or Project Settings -> API.
--   2. <YOUR-SERVICE-ROLE-KEY> — Project Settings -> API -> service_role
--      secret key. This is a highly privileged key.
--      DO NOT commit the filled-in version of this file to git — edit
--      directly in the Supabase SQL editor, or keep the real values in a
--      local copy that stays out of the repo. The version in this repo
--      must stay a placeholder.
--
-- ADDITIVE & IDEMPOTENT — safe to re-run. Apply after schema.sql and
-- notifications.sql, and only after send-notification-email is deployed
-- (supabase functions deploy send-notification-email) with its secrets
-- set (supabase secrets set RESEND_API_KEY=... FROM_EMAIL=...).
-- ═══════════════════════════════════════════════════════════════

-- pg_net is enabled by default on Supabase projects; this is a no-op if
-- it already is.
create extension if not exists pg_net with schema extensions;

create or replace function public.casa_trigger_notification_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.type in ('enquiry', 'reply') then
    perform net.http_post(
      url := 'https://<YOUR-PROJECT-REF>.supabase.co/functions/v1/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer <YOUR-SERVICE-ROLE-KEY>'
      ),
      body := jsonb_build_object(
        'user_id', new.user_id,
        'type', new.type,
        'title', new.title,
        'body', new.body,
        'href', new.href
      )
    );
  end if;
  return new;
end $$;

drop trigger if exists trg_notification_email on notifications;
create trigger trg_notification_email after insert on notifications
  for each row execute function public.casa_trigger_notification_email();
