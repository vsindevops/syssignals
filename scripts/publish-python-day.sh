#!/usr/bin/env bash
# Publish the Python for AI Engineering series to the live site.
#
#   npm run publish:py
#
# Unlike the DevOps flow, Python articles are authored DIRECTLY in
# content/python/python-for-ai-engineering/ (no Jekyll source, no sync step).
# This script just build-gates, commits and pushes — Coolify picks up the
# push and deploys syssignals.com automatically.
set -euo pipefail
cd "$(dirname "$0")/.."

DIR="content/python/python-for-ai-engineering"

if [ ! -d "$DIR" ] || [ -z "$(ls -A "$DIR" 2>/dev/null)" ]; then
  echo "==> no Python articles found in $DIR — nothing to publish"
  exit 0
fi

newest=$(ls "$DIR" | sed -En 's/^py-day-([0-9]+).*/\1/p' | sort -n | tail -1)
newest=$((10#$newest))

if ! grep -E "days: \[[0-9, ]*\b${newest}\b" src/lib/series.ts > /dev/null; then
  echo ""
  echo "    NOTE: Day ${newest} is not in any module in src/lib/series.ts under"
  echo "    'python-for-ai-engineering'. The site still shows it (under 'Just"
  echo "    shipped'), but place it into its module when you get a moment."
  echo ""
fi

# Use porcelain (not `git diff`) so brand-new UNTRACKED articles count too —
# a Python day often adds only a new file with no tracked-file changes.
if [ -z "$(git status --porcelain)" ]; then
  echo "==> nothing new to publish"
  exit 0
fi

echo "==> verifying production build"
npm run build

echo "==> committing and pushing"
git add -A
git commit -m "Publish Python for AI Engineering — Day ${newest}"
git push

echo "==> pushed — Coolify will deploy syssignals.com from this commit"
