#!/usr/bin/env bash
# Build VitePress site: loads env before building, not just before deploying.
# Vite inlines VITE_* vars at build time — they must be in process.env when the
# bundler runs, not just available later in the deploy step's own subprocess.
# In CI: fetches env from SSM (SITE_SSM_ENV_PARAM) before building.
# Locally: NX already loaded it via envFile.
set -euo pipefail

load_env() {
  eval "$(aws ssm get-parameter \
    --region "$AWS_REGION" \
    --name "${SITE_SSM_ENV_PARAM:?SITE_SSM_ENV_PARAM not set}" \
    --query Parameter.Value \
    --output text \
  | jq -r 'to_entries[] | "export \(.key)=\(.value | @sh)"')"
  echo "✓ Loaded env from $SITE_SSM_ENV_PARAM"
}

build() {
  (cd apps/docs-web && ../../node_modules/.bin/vitepress build)
}

[[ "${GITHUB_ACTIONS:-false}" == "true" ]] && load_env
build
