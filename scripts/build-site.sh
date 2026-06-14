#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/_site"

rm -rf "$OUT"
mkdir -p "$OUT/casa-pages"

copy_if() {
  local src="$1"
  local dest="$2"
  if [[ -f "$src" ]]; then
    cp "$src" "$dest"
  fi
}

for file in "$ROOT"/*.html "$ROOT"/*.css "$ROOT"/*.js "$ROOT"/*.svg; do
  [[ -f "$file" ]] || continue
  base="$(basename "$file")"
  case "$base" in
    design-canvas.jsx) continue ;;
  esac
  cp "$file" "$OUT/"
done

if [[ -d "$ROOT/casa-pages" ]]; then
  cp -r "$ROOT/casa-pages/." "$OUT/casa-pages/"
fi

copy_if "$ROOT/CNAME" "$OUT/CNAME"
copy_if "$ROOT/robots.txt" "$OUT/robots.txt"
copy_if "$ROOT/sitemap.xml" "$OUT/sitemap.xml"

echo "Built static site at ${OUT}"
