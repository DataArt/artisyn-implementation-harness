#!/usr/bin/env bash
# Create or update a Secrets Manager secret from a source .env file.
# Required env vars (injected by NX via envFile + configuration env block):
#   SM_SECRET_NAME  — SM secret path, e.g. clnsn/dev/docs/lambda-auth
#   SM_SOURCE_FILE  — path to the .env file to push, relative to repo root
# AWS region is read from AWS_REGION / active profile.
set -euo pipefail

confirm() {
  echo ""
  echo "You are about to push secrets to AWS Secrets Manager."
  echo ""
  echo "  Secret : $SM_SECRET_NAME"
  echo "  Source : $SM_SOURCE_FILE"
  echo ""
  if aws secretsmanager describe-secret --secret-id "$SM_SECRET_NAME" >/dev/null 2>&1; then
    echo "  ⚠️  Secret '$SM_SECRET_NAME' already exists and will be overwritten."
    echo ""
  fi
  read -r -p "Confirm? [y/N] " reply
  if [[ ! "$reply" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
  echo ""
}

build_json() {
  python3 - "$SM_SOURCE_FILE" <<'EOF'
import sys, json
d = {}
with open(sys.argv[1]) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, _, v = line.partition('=')
        d[k.strip()] = v
print(json.dumps(d))
EOF
}

upsert_secret() {
  local json="$1"
  if aws secretsmanager describe-secret --secret-id "$SM_SECRET_NAME" >/dev/null 2>&1; then
    aws secretsmanager put-secret-value \
      --secret-id "$SM_SECRET_NAME" \
      --secret-string "$json"
    echo "Done — secret '${SM_SECRET_NAME}' updated"
  else
    aws secretsmanager create-secret \
      --name "$SM_SECRET_NAME" \
      --secret-string "$json"
    echo "Done — secret '${SM_SECRET_NAME}' created"
  fi
}

confirm
upsert_secret "$(build_json)"