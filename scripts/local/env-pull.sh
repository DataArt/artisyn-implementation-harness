#!/usr/bin/env bash
# Fetch a config parameter from AWS SSM Parameter Store and merge into a target .env file.
# Required env vars (injected by NX via configuration env block):
#   ENV_PARAM_NAME  — SSM parameter path, e.g. /clnsn/dev/docs/lambda-auth/env
#   AWS_REGION      — AWS region, e.g. us-east-1
#   ENV_TARGET_FILE — path to the .env file to write, relative to repo root
# Optional:
#   ENV_BASE_ENV    — if set, copied to ENV_TARGET_FILE before merging (provides defaults)
set -euo pipefail

confirm() {
  echo ""
  echo "You are about to pull config from AWS SSM Parameter Store."
  echo ""
  echo "  Parameter : $ENV_PARAM_NAME"
  echo "  Region    : $AWS_REGION"
  echo "  Target    : $ENV_TARGET_FILE"
  echo ""
  if [[ -f "$ENV_TARGET_FILE" ]]; then
    echo "  ⚠️  $ENV_TARGET_FILE already exists and will be overwritten."
    echo ""
  fi
  if [[ ! -t 0 ]]; then
    echo "  (non-interactive — skipping confirmation)"
    echo ""
    return
  fi
  read -r -p "Confirm? [y/N] " reply
  if [[ ! "$reply" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
  echo ""
}

fetch_and_merge() {
  if [[ -n "${ENV_BASE_ENV:-}" ]]; then
    cp "$ENV_BASE_ENV" "$ENV_TARGET_FILE"
  elif [[ ! -f "$ENV_TARGET_FILE" ]]; then
    touch "$ENV_TARGET_FILE"
  fi

  aws ssm get-parameter \
    --region "$AWS_REGION" \
    --name "$ENV_PARAM_NAME" \
    --query Parameter.Value \
    --output text \
  | python3 -c "import sys,json; [print(f'{k}={v}') for k,v in json.load(sys.stdin).items()]" \
  | while IFS='=' read -r k v; do
      if grep -q "^${k}=" "$ENV_TARGET_FILE"; then
        tmp=$(mktemp) && sed "s|^${k}=.*|${k}=${v}|" "$ENV_TARGET_FILE" > "$tmp" && mv "$tmp" "$ENV_TARGET_FILE"
      else
        echo "${k}=${v}" >> "$ENV_TARGET_FILE"
      fi
    done

  echo "Done — config from '${ENV_PARAM_NAME}' merged into ${ENV_TARGET_FILE}"
}

confirm
fetch_and_merge