# Casa.co.uk

Fee-free UK holiday rentals — static site with Supabase backend (optional).

## Run locally

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080/index.html](http://localhost:8080/index.html).

## Supabase (production auth + data)

1. Create a Supabase project
2. Run [`supabase/schema.sql`](supabase/schema.sql)
3. Copy API keys into [`casa-config.js`](casa-config.js)

Full guide: [**SUPABASE.md**](SUPABASE.md)

Without Supabase credentials the site runs in **demo mode** using `localStorage`.

## Key files

| File | Role |
|------|------|
| `casa-supabase.js` | Auth client + DB inserts/fetches |
| `casa-data.js` | Data layer with Supabase + local fallback |
| `casa-nav.js` | Context-aware navigation |
| `casa-properties.js` | 36 listing catalogue |
| `launch-plan.md` | Beta roadmap |

## Deploy

Push to `main` on this repo for GitHub Pages.
