#!/usr/bin/env bash
# Store a .env file in AWS SSM Parameter Store as a JSON string (type: String).
# Required env vars (injected by NX via configuration env block):
#   ENV_PARAM_NAME  — SSM parameter path, e.g. /clnsn/dev/docs/lambda-auth/env
#   AWS_REGION      — AWS region, e.g. us-east-1
#   ENV_SOURCE_FILE — path to the .env file to push, relative to repo root
set -euo pipefail

confirm() {
  echo ""
  echo "You are about to push config to AWS SSM Parameter Store."
  echo ""
  echo "  Parameter : $ENV_PARAM_NAME"
  echo "  Region    : $AWS_REGION"
  echo "  Source    : $ENV_SOURCE_FILE"
  echo ""
  if aws ssm get-parameter --region "$AWS_REGION" --name "$ENV_PARAM_NAME" >/dev/null 2>&1; then
    echo "  ⚠️  Parameter '$ENV_PARAM_NAME' already exists and will be overwritten."
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
  python3 - "$ENV_SOURCE_FILE" <<'EOF'
import sys, json
d = {}
with open(sys.argv[1]) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, _, v = line.partition('=')
        d[k.strip()] = v.strip()
print(json.dumps(d))
EOF
}

confirm
aws ssm put-parameter \
  --region "$AWS_REGION" \
  --name "$ENV_PARAM_NAME" \
  --value "$(build_json)" \
  --type String \
  --overwrite \
  --output text --query 'Version' > /dev/null

echo "Done — config from '${ENV_SOURCE_FILE}' stored at ${ENV_PARAM_NAME}"