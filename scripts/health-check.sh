#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FAIL=0

say() { printf '%s\n' "$*"; }
fail() { say "FAIL: $*"; FAIL=1; }
pass() { say "OK: $*"; }

say "=== Casa site health check ==="

# 1. Build artifact
if bash scripts/build-site.sh >/dev/null; then
  pass "Production build completes"
else
  fail "Production build script failed"
fi

# 2. Required assets in _site
for f in casa.css casa-components.css casa.js casa-region-meta.js casa-browse-map.js casa-availability.js casa-pages/home.css robots.txt sitemap.xml index.html browse.html map.html host.html; do
  if [[ -f "_site/$f" ]]; then pass "Artifact contains $f"; else fail "Missing in _site: $f"; fi
done

if [[ -d "_site/Casa project" ]]; then fail "Archive folder leaked into _site"; else pass "Archive excluded from _site"; fi

# 3. JS syntax
while IFS= read -r js; do
  if node --check "$js" >/dev/null 2>&1; then
    pass "JS syntax: $(basename "$js")"
  else
    fail "JS syntax error: $js"
  fi
done < <(find "$ROOT" -maxdepth 1 -name 'casa*.js' -type f | sort)

# 4. Viewport on public pages
while IFS= read -r html; do
  base=$(basename "$html")
  [[ "$base" == "icons.html" || "$base" == "brand.html" ]] && continue
  if grep -q 'name="viewport"' "$html"; then
    pass "Viewport: $base"
  else
    fail "Missing viewport: $base"
  fi
done < <(find "$ROOT" -maxdepth 1 -name '*.html' -type f | sort)

# 5. Stylesheet links resolve
python3 << 'PY'
import re, sys
from pathlib import Path
root = Path('/workspace')
fail = False
for html in sorted(root.glob('*.html')):
    text = html.read_text()
    for href in re.findall(r'<link[^>]+href="([^"#?]+)"', text):
        if href.startswith('http') or href.startswith('//'):
            continue
        target = root / href
        if not target.exists():
            print(f'FAIL: {html.name} links missing asset {href}')
            fail = True
if not fail:
    print('OK: Local stylesheet hrefs resolve')
sys.exit(1 if fail else 0)
PY
if [[ $? -eq 0 ]]; then pass "Local stylesheet hrefs resolve"; else FAIL=1; fi

# 6. Script src resolve (root js only)
python3 << 'PY'
import re, sys
from pathlib import Path
root = Path('/workspace')
fail = False
for html in sorted(root.glob('*.html')):
    text = html.read_text()
    for src in re.findall(r'<script[^>]+src="([^"#?]+)"', text):
        if src.startswith('http') or src.startswith('//'):
            continue
        target = root / src
        if not target.exists():
            print(f'FAIL: {html.name} script missing {src}')
            fail = True
if not fail:
    print('OK: Local script src paths resolve')
sys.exit(1 if fail else 0)
PY
if [[ $? -eq 0 ]]; then pass "Local script src paths resolve"; else FAIL=1; fi

say "=== Done ==="
exit $FAIL
