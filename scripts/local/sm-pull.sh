#!/usr/bin/env bash
# Fetch a Secrets Manager secret and merge key=value pairs into a target .env file.
# Required env vars (injected by NX via configuration env block):
#   SM_SECRET_NAME  — SM secret path, e.g. clnsn/dev/docs/lambda-auth
#   SM_TARGET_FILE  — path to the .env file to write, relative to repo root
# AWS region is read from AWS_REGION / active profile.
# Optional:
#   SM_BASE_ENV     — if set, copied to SM_TARGET_FILE before merging (provides non-secret defaults)
set -euo pipefail

confirm() {
  echo ""
  echo "You are about to pull secrets from AWS Secrets Manager."
  echo ""
  echo "  Secret : $SM_SECRET_NAME"
  echo "  Target : $SM_TARGET_FILE"
  echo ""
  if [[ -f "$SM_TARGET_FILE" ]]; then
    echo "  ⚠️  $SM_TARGET_FILE already exists and will be overwritten."
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
  if [[ -n "${SM_BASE_ENV:-}" ]]; then
    cp "$SM_BASE_ENV" "$SM_TARGET_FILE"
  elif [[ ! -f "$SM_TARGET_FILE" ]]; then
    touch "$SM_TARGET_FILE"
  fi

  aws secretsmanager get-secret-value \
    --secret-id "$SM_SECRET_NAME" \
    --query SecretString \
    --output text \
  | python3 -c "import sys,json; [print(f'{k}={v}') for k,v in json.load(sys.stdin).items()]" \
  | while IFS='=' read -r k v; do
      if grep -q "^${k}=" "$SM_TARGET_FILE"; then
        tmp=$(mktemp) && sed "s|^${k}=.*|${k}=${v}|" "$SM_TARGET_FILE" > "$tmp" && mv "$tmp" "$SM_TARGET_FILE"
      else
        echo "${k}=${v}" >> "$SM_TARGET_FILE"
      fi
    done

  echo "Done — secrets from '${SM_SECRET_NAME}' merged into ${SM_TARGET_FILE}"
}

confirm
fetch_and_merge