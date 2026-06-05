# AGENTS.md

Guidance for AI agents working in this repository.

## Project overview

**Casa** (`casa.co.uk`) is a static HTML/CSS/JavaScript prototype for a fee-free UK accommodation platform. The canonical app lives at the **repository root** (`*.html`, `casa.css`, `casa.js`). There is no `package.json`, build step, or backend in this repo.

Archived copies under `Casa project/files`, `files 2`, and `files 3` are older snapshots; prefer the root files for development and testing.

## Cursor Cloud specific instructions

### Services

| Service | Required? | Notes |
|---------|-----------|--------|
| Static HTTP server on repo root | **Yes** | Avoid `file://` — use same-origin HTTP like GitHub Pages. |
| Browser | **Yes** | UI, navigation, and `localStorage` (signup stub, listing drafts, etc.). |
| Supabase / API / DB | No | Not implemented; data is inline or in `localStorage`. |

### Run locally (development)

From `/workspace`:

```bash
python3 -m http.server 8080
```

Then open `http://127.0.0.1:8080/index.html` (or `localhost`).

Key pages: `browse.html`, `feed.html`, `property.html`, `booking.html`, `signup.html`, `host.html`, `list.html`, `messages.html`.

### Lint / test / build

There are **no** configured linters, unit tests, or bundlers. “Verification” for changes is typically:

- HTTP smoke check: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/index.html` (expect `200` with server running).
- Manual or browser-based walkthrough of affected pages.

See `Casa project/files/README.md` for deploy notes (Netlify / GitHub Pages).

### Long-running dev server

Use a dedicated tmux session (e.g. `casa-static-server`) so the server survives across agent steps:

```bash
SESSION_NAME="casa-static-server"
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null || \
  tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "/workspace" -- bash -l
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" 'cd /workspace && python3 -m http.server 8080' C-m
```

If port `8080` is in use, pick another port and use that in URLs.

### Optional tooling

- `design-canvas.jsx` is a standalone React helper; it is not wired into the static site.
- Google Fonts load from CDN; pages work offline with fallback fonts.
