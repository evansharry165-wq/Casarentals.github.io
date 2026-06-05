# Supabase setup for Casa.co.uk

Casa uses [Supabase](https://supabase.com) for auth, enquiries, and waitlist storage. Without credentials the site runs in **demo mode** (localStorage only).

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Choose a region close to the UK (e.g. London)
3. Save your database password

## 2. Run the database schema

1. Open **SQL Editor** in the Supabase dashboard
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql)
3. Click **Run**

This creates:

| Table | Purpose |
|-------|---------|
| `profiles` | Guest/host role + name (auto-created on signup) |
| `enquiries` | Booking enquiries from `booking.html` |
| `waitlist_entries` | Pre-launch signups from `waitlist.html` |

## 3. Configure authentication

1. **Authentication → Providers → Email** — enable Email, confirm signups if you want email verification
2. **Authentication → URL configuration** — add your site URL:
   - Production: `https://evansharry165-wq.github.io/Casarentals.github.io/` (or your custom domain)
   - Local dev: `http://localhost:8080`
3. Add redirect URLs for OAuth later if needed

## 4. Add API keys to the site

1. **Project Settings → API** — copy **Project URL** and **anon public** key
2. Edit [`casa-config.js`](casa-config.js):

```javascript
window.CASA_CONFIG = {
  supabaseUrl: 'https://abcdefgh.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};
```

3. Commit and deploy (the anon key is safe to expose in a static frontend; RLS protects data)

Alternatively copy from [`casa-config.example.js`](casa-config.example.js).

## 5. Verify

| Test | Expected |
|------|----------|
| Sign up at `signup.html` | Row in `auth.users` + `profiles` |
| Send enquiry while signed in | Row in `enquiries` with `guest_id` |
| Join waitlist | Row in `waitlist_entries` |
| Open `messages.html` | Your enquiries appear at top of inbox |

## Architecture

```
signup.html  ──► casaAuthSignUp()  ──► Supabase Auth + profiles trigger
booking.html ──► casaSaveEnquiry() ──► enquiries table + localStorage mirror
waitlist.html──► casaSaveWaitlistEntry() ──► waitlist_entries + RPC count
messages.html──► casaFetchEnquiries() ──► merge remote + local threads
casa-nav.js  ──► session sync via casa:user localStorage + nav refresh
```

## Next steps (production)

- **Email**: Supabase Auth emails or Resend/Postmark for enquiry notifications
- **Host listings**: `properties` table + `list.html` insert
- **Edge function**: `send-enquiry-email` on new enquiry row
- **Stripe**: host payouts guidance (stays direct for now)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Still in demo mode | Check `casa-config.js` has real URL/key (no `YOUR_PROJECT`) |
| Sign up works but no session | Email confirmation required — check inbox or disable confirm in Auth settings |
| Enquiries not in inbox | User must be signed in with same email used on enquiry |
| RLS errors in console | Re-run `schema.sql`; check policies in Table Editor |
