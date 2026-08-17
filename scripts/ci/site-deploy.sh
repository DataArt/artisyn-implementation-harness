#!/usr/bin/env bash
# Deploy VitePress site: S3 sync + CloudFront invalidation.
# In CI: fetches S3_BUCKET_NAME and CF_DISTRIBUTION_ID from SSM (SITE_SSM_ENV_PARAM).
# Locally: NX already loaded them via envFile.
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

sync_s3() {
  echo "› Syncing to S3..."
  aws s3 sync apps/docs-web/.vitepress/dist/ "s3://${S3_BUCKET_NAME:?}" --delete
}

invalidate_cf() {
  echo "› Invalidating CloudFront..."
  local invalidation_id
  invalidation_id=$(aws cloudfront create-invalidation \
    --distribution-id "${CF_DISTRIBUTION_ID:?}" \
    --paths '/*' \
    --query 'Invalidation.Id' \
    --output text)
  echo "› Waiting for invalidation $invalidation_id to complete (~1 min)..."
  aws cloudfront wait invalidation-completed \
    --distribution-id "$CF_DISTRIBUTION_ID" \
    --id "$invalidation_id"
  echo "✓ Site deployed: https://$(aws cloudfront get-distribution \
    --id "$CF_DISTRIBUTION_ID" \
    --query 'Distribution.DomainName' \
    --output text)"
}

[[ "${GITHUB_ACTIONS:-false}" == "true" ]] && load_env
sync_s3
invalidate_cf