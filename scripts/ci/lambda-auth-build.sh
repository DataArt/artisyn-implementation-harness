#!/usr/bin/env bash
# Build lambda-auth: esbuild bundle + zip.
# In CI: fetches SM_SECRET_NAME + AWS_REGION from SSM before building (esbuild inlines them).
# Locally: NX already loaded env vars via envFile.
set -euo pipefail

load_env() {
  eval "$(aws ssm get-parameter \
    --region "$AWS_REGION" \
    --name "${LAMBDA_AUTH_SSM_ENV_PARAM:?LAMBDA_AUTH_SSM_ENV_PARAM not set}" \
    --query Parameter.Value \
    --output text \
  | jq -r 'to_entries[] | "export \(.key)=\(.value | @sh)"')"
  echo "✓ Loaded env from $LAMBDA_AUTH_SSM_ENV_PARAM"
}

build() {
  echo "› Building lambda-auth..."
  (cd apps/lambda-auth && tsx --tsconfig tsconfig.build.json build.ts && zip -j dist/lambda-auth.zip dist/index.js)
  echo "✓ Built: apps/lambda-auth/dist/lambda-auth.zip"
}

[[ "${GITHUB_ACTIONS:-false}" == "true" ]] && load_env
build