// Casa — send-notification-email
//
// Called by a Postgres trigger (see supabase/email-notifications.sql) right
// after a row is inserted into `notifications`, for the three real events
// this covers:
//   - type = 'enquiry', new row from casa_notify_on_enquiry       -> new enquiry, to the host
//   - type = 'enquiry', new row from casa_notify_on_enquiry_status -> confirmed/declined, to the guest
//   - type = 'reply',   new row from casa_notify_on_message        -> new message, to whoever hasn't seen it
// (Follows/reviews also insert into `notifications` but aren't emailed —
// the trigger filters to type in ('enquiry','reply') before this ever runs.)
//
// Deploy: supabase functions deploy send-notification-email
// Secrets this needs (supabase secrets set ...): RESEND_API_KEY, FROM_EMAIL
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically by
// the Supabase runtime — no need to set those yourself.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Casa <notifications@casa.co.uk>';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (!RESEND_API_KEY) {
    // Fails loudly in the function logs rather than silently — this is
    // exactly the "real failure surfaces somewhere" the production-
    // readiness brief asked for, not a swallowed error.
    console.error('send-notification-email: RESEND_API_KEY is not set — email not sent.');
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
  }

  let payload: { user_id?: string; type?: string; title?: string; body?: string; href?: string };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON body' }), { status: 400 });
  }

  const { user_id, type, title, body, href } = payload;
  if (!user_id || !title) {
    return new Response(JSON.stringify({ error: 'missing user_id or title' }), { status: 400 });
  }
  // Belt-and-braces: the SQL trigger already filters to enquiry/reply, but
  // don't trust the caller — re-check here too.
  if (type !== 'enquiry' && type !== 'reply') {
    return new Response(JSON.stringify({ skipped: true, reason: `type '${type}' is not emailed` }), { status: 200 });
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(user_id);
  if (userError || !userData?.user?.email) {
    console.error('send-notification-email: could not resolve recipient email', user_id, userError);
    return new Response(JSON.stringify({ error: 'recipient email not found' }), { status: 404 });
  }
  const toEmail = userData.user.email;

  const link = href ? `https://casa.co.uk/${href}` : 'https://casa.co.uk/';
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <p style="font-size:20px;font-weight:600;margin-bottom:12px">${escapeHtml(title)}</p>
      ${body ? `<p style="font-size:15px;color:#3C3830;line-height:1.5;margin-bottom:20px">${escapeHtml(body)}</p>` : ''}
      <a href="${link}" style="display:inline-block;background:#B05533;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px">Open on Casa</a>
      <p style="font-size:12px;color:#A39A88;margin-top:28px">Casa.co.uk — you're receiving this because you have an account on Casa. Manage notification preferences from your profile.</p>
    </div>`;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: toEmail,
      subject: title,
      html,
    }),
  });

  if (!resendRes.ok) {
    const errText = await resendRes.text();
    console.error('send-notification-email: Resend API error', resendRes.status, errText);
    return new Response(JSON.stringify({ error: 'Resend API error', detail: errText }), { status: 502 });
  }

  return new Response(JSON.stringify({ sent: true, to: toEmail }), { status: 200 });
});

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
