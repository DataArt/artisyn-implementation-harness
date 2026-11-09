#!/usr/bin/env bash
# Build the Web Explorer promo SPA, then enforce its bundle-size budget.
set -euo pipefail

(cd apps/web-explorer && ../../node_modules/.bin/tsc -b && ../../node_modules/.bin/vite build)
node scripts/ci/check-bundle-budget.mjs apps/web-explorer/dist
