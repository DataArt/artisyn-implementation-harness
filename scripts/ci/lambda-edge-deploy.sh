#!/usr/bin/env bash
# Deploy Lambda@Edge: update function code, publish a new version, and update the
# CloudFront viewer-request association to point to the new version ARN.
# In CI: fetches env from SSM (LAMBDA_AUTH_SSM_ENV_PARAM).
# Locally: NX already loaded env vars via envFile.
set -euo pipefail

PUBLISHED_ARN=""
CF_CONFIG_TMP=""
CF_CONFIG_UPDATED_TMP=""
trap 'rm -f "$CF_CONFIG_TMP" "$CF_CONFIG_UPDATED_TMP"' EXIT

load_env() {
  eval "$(aws ssm get-parameter \
    --region "$AWS_REGION" \
    --name "${LAMBDA_AUTH_SSM_ENV_PARAM:?LAMBDA_AUTH_SSM_ENV_PARAM not set}" \
    --query Parameter.Value \
    --output text \
  | jq -r 'to_entries[] | "export \(.key)=\(.value | @sh)"')"
  echo "✓ Loaded env from $LAMBDA_AUTH_SSM_ENV_PARAM"
}

update_code() {
  echo "› Updating function code..."
  aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --zip-file "fileb://$LAMBDA_ZIP_PATH" \
    --output json > /dev/null

  echo "› Waiting for update to complete..."
  aws lambda wait function-updated \
    --function-name "$LAMBDA_FUNCTION_NAME"
}

publish_version() {
  PUBLISHED_ARN=$(aws lambda publish-version \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --query 'FunctionArn' \
    --output text)
  echo "› Published: $PUBLISHED_ARN"
}

grant_invoke() {
  local version
  version=$(echo "$PUBLISHED_ARN" | grep -oE '[0-9]+$')
  echo "› Granting edgelambda:InvokeFunction on version $version..."
  aws lambda add-permission \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --qualifier "$version" \
    --statement-id "AllowCloudFrontInvoke-${version}" \
    --action "lambda:InvokeFunction" \
    --principal "edgelambda.amazonaws.com" \
    --output json > /dev/null
}

update_cf() {
  echo "› Updating CloudFront Lambda association..."
  CF_CONFIG_TMP=$(mktemp)
  CF_CONFIG_UPDATED_TMP=$(mktemp)
  local full_tmp
  full_tmp=$(mktemp)

  aws cloudfront get-distribution-config \
    --id "$CF_DISTRIBUTION_ID" \
    --output json > "$full_tmp"

  local etag
  etag=$(jq -r '.ETag' "$full_tmp")
  jq '.DistributionConfig' "$full_tmp" > "$CF_CONFIG_TMP"
  rm -f "$full_tmp"

  jq --arg arn "$PUBLISHED_ARN" \
    '.DefaultCacheBehavior.LambdaFunctionAssociations = {"Quantity": 1, "Items": [{"LambdaFunctionARN": $arn, "EventType": "viewer-request", "IncludeBody": false}]}' \
    "$CF_CONFIG_TMP" > "$CF_CONFIG_UPDATED_TMP"

  aws cloudfront update-distribution \
    --id "$CF_DISTRIBUTION_ID" \
    --if-match "$etag" \
    --distribution-config "file://${CF_CONFIG_UPDATED_TMP}" \
    --output json > /dev/null

  echo "› Waiting for CloudFront to deploy (~2 min)..."
  aws cloudfront wait distribution-deployed --id "$CF_DISTRIBUTION_ID"
}

cleanup_old_permissions() {
  local current_version
  current_version=$(echo "$PUBLISHED_ARN" | grep -oE '[0-9]+$')
  local keep_from=$(( current_version - 1 ))
  echo "› Removing permissions for versions older than ${keep_from}..."

  # List all numeric versions (excludes $LATEST); paginate up to 100
  local versions
  versions=$(aws lambda list-versions-by-function \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --max-items 100 \
    --query 'Versions[].Version' \
    --output text | tr '\t' '\n' | grep -v '\$LATEST' || true)

  for v in $versions; do
    [[ "$v" -ge "$keep_from" ]] && continue
    aws lambda remove-permission \
      --function-name "$LAMBDA_FUNCTION_NAME" \
      --qualifier "$v" \
      --statement-id "AllowCloudFrontInvoke-${v}" \
      --output json > /dev/null 2>&1 || true
    echo "  Removed: AllowCloudFrontInvoke-${v} (v${v})"
  done
}

[[ "${GITHUB_ACTIONS:-false}" == "true" ]] && load_env
[[ "$AWS_REGION" == "us-east-1" ]] || { echo "ERROR: Lambda@Edge requires AWS_REGION=us-east-1 (got: ${AWS_REGION:-unset})"; exit 1; }
update_code
publish_version
grant_invoke
update_cf
cleanup_old_permissions
echo "✓ Done — Lambda@Edge active: $PUBLISHED_ARN"