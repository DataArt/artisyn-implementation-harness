#!/usr/bin/env bash
# Build VitePress site.
set -euo pipefail

build() {
  node docs/.og/cli.mjs build --dir "$(pwd)"
  node scripts/ci/check-tier-sync.mjs
  (cd apps/web-docs && ../../node_modules/.bin/vitepress build)
}

build
