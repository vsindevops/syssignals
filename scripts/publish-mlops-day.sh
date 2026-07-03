#!/usr/bin/env bash
# Publish the 100 Days of MLOps series to the live site.
#
#   npm run publish:ml
#
# Like the Python series (and unlike DevOps), MLOps articles are authored
# DIRECTLY in content/mlops/100-days-mlops/ (no Jekyll source, no sync step).
# This script just build-gates, commits and pushes — Coolify picks up the
# push and deploys syssignals.com automatically.
set -euo pipefail
cd "$(dirname "$0")/.."

DIR="content/mlops/100-days-mlops"

if [ ! -d "$DIR" ] || [ -z "$(ls -A "$DIR" 2>/dev/null)" ]; then
  echo "==> no MLOps articles found in $DIR — nothing to publish"
  exit 0
fi

newest=$(ls "$DIR" | sed -En 's/^ml-day-([0-9]+).*/\1/p' | sort -n | tail -1)
newest=$((10#$newest))

if ! grep -E "days: \[[0-9, ]*\b${newest}\b" src/lib/series.ts > /dev/null; then
  echo ""
  echo "    NOTE: Day ${newest} is not in any module in src/lib/series.ts under"
  echo "    '100-days-mlops'. The site still shows it (under 'Just shipped'),"
  echo "    but place it into its module when you get a moment."
  echo ""
fi

# Only ever publish files this series owns: the MLOps content and (for module
# slotting) src/lib/series.ts. NEVER `git add -A` — that once swept an unrelated
# in-progress feature into a "Publish Day N" commit. Use porcelain so brand-new
# UNTRACKED articles count too.
OWNED=("$DIR" "src/lib/series.ts")

if [ -z "$(git status --porcelain -- "${OWNED[@]}")" ]; then
  echo "==> nothing new to publish in $DIR or src/lib/series.ts"
  exit 0
fi

# Warn about (but do NOT commit) any other changes sitting in the working tree.
OTHER="$(git status --porcelain | grep -vE " (${DIR}|src/lib/series\.ts)" || true)"
if [ -n "$OTHER" ]; then
  echo ""
  echo "    NOTE: these OTHER working-tree changes will be LEFT UNCOMMITTED"
  echo "    (this script only publishes the MLOps content + series.ts):"
  echo "$OTHER" | sed 's/^/      /'
  echo ""
fi

echo "==> verifying production build"
npm run build

echo "==> committing and pushing (only MLOps content + series.ts)"
git add -- "${OWNED[@]}"
git commit -m "Publish 100 Days of MLOps — Day ${newest}"
git push

echo "==> pushed — Coolify will deploy syssignals.com from this commit"
