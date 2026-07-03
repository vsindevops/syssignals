#!/usr/bin/env bash
# Publish the latest day(s) from the Jekyll repo to the live site.
#
#   npm run publish:day
#
# Syncs content, verifies the build, commits and pushes — Coolify picks up
# the push and deploys syssignals.com automatically.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> syncing content from ../30-days-devops"
node scripts/sync-content.mjs

newest=$(ls content/devops/30-days-devops/ | sed -En 's/^day-([0-9]+).*/\1/p' | sort -n | tail -1)
newest=$((10#$newest))

if ! grep -E "days: \[[0-9, ]*\b${newest}\b" src/lib/series.ts > /dev/null; then
  echo ""
  echo "    NOTE: Day ${newest} is not in any module in src/lib/series.ts."
  echo "    The site still shows it (under 'Just shipped'), but place it into"
  echo "    its module and remove it from 'upcoming' when you get a moment."
  echo ""
fi

if git diff --quiet && git diff --cached --quiet; then
  echo "==> nothing new to publish"
  exit 0
fi

echo "==> verifying production build"
npm run build

echo "==> committing and pushing"
git add -A
git commit -m "Publish Day ${newest}"
git push

echo "==> pushed — Coolify will deploy syssignals.com from this commit"

echo "==> emailing subscribers once the article is live"
node scripts/announce-article.mjs --send --wait || echo "    (announcement skipped/failed — run 'npm run announce -- <slug> --send' manually)"
