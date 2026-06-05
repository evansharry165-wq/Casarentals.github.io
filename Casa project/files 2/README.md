# Casa.co.uk — Platform Source

Fee-free UK accommodation. Direct booking. Community-first.

---

## Folder structure

```
casa-platform/
├── index.html          ← Homepage (feed + search)
├── css/
│   └── casa.css        ← Full design system
├── js/
│   └── casa.js         ← Shared logic, state, post builder
└── pages/
    ├── signup.html
    ├── signin.html
    ├── how-it-works.html
    ├── explore.html
    ├── map.html
    ├── list-property.html
    ├── booking.html
    ├── property.html
    ├── profile.html
    ├── messages.html
    ├── saved.html
    ├── terms.html
    └── privacy.html
```

---

## How to run locally

Just open `index.html` in any browser. No build step needed.

---

## Deploy to Netlify (drag and drop)

1. Go to **app.netlify.com** and sign in (or create a free account)
2. Click **"Add new site" → "Deploy manually"**
3. Drag the entire `casa-platform` folder into the drop zone
4. Netlify gives you a live URL instantly (e.g. `casa-platform.netlify.app`)

To update: drag the folder again. Netlify replaces the old deploy.

---

## Deploy via GitHub + Netlify (recommended — tracks every change)

### Step 1 — Create a GitHub account
Go to **github.com** and create a free account if you don't have one.

### Step 2 — Create a repository
1. Click the **+** button → **New repository**
2. Name it: `casa-platform`
3. Set to **Public** (free Netlify requires public repo on free tier) or Private
4. Click **Create repository**

### Step 3 — Install Git
Download from **git-scm.com** (Windows) or run `xcode-select --install` (Mac).

### Step 4 — Push this folder to GitHub

Open Terminal (Mac) or Command Prompt (Windows), navigate to this folder, then run:

```bash
git init
git add .
git commit -m "Initial Casa platform build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/casa-platform.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 5 — Connect Netlify to GitHub
1. Go to **app.netlify.com** → **Add new site** → **Import an existing project**
2. Choose **GitHub** and authorise
3. Select the `casa-platform` repository
4. Leave build settings blank (no build command needed — it's plain HTML)
5. Click **Deploy site**

You now have a live URL. **Every time we update files and you run `git push`, the site updates automatically within 30 seconds.**

### Updating after changes

Whenever you get new files from Claude:
```bash
# Copy the updated files into your casa-platform folder, then:
git add .
git commit -m "Update: [describe what changed]"
git push
```

Netlify detects the push and redeploys automatically.

---

## Custom domain (casa.co.uk)

Once you have the domain registered:
1. Netlify dashboard → **Site settings → Domain management**
2. Click **Add custom domain** → enter `casa.co.uk`
3. Follow the DNS instructions Netlify provides
4. SSL certificate is automatic (Let's Encrypt)

---

## Current state (prototype)

- Feed works with real localStorage persistence — posts survive page refresh
- Sign up and sign in are functional (data stored locally in browser)
- Hashtag filtering, search, tabs, likes, saves all working
- All pages linked and navigable

## Next step (full-stack with Cursor + Supabase)

When ready to move to a real database:
1. Follow the roadmap document (Casa_Development_Roadmap.docx)
2. Open this folder in Cursor
3. Use the exact prompts in Section 8 of the roadmap to migrate each feature to Next.js + Supabase

---

*Built with Casa design system v1.0 — May 2026*
