import { createHash, timingSafeEqual } from 'node:crypto';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import type { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';

// process.env.AWS_REGION and SM_SECRET_NAME are build-time constants injected via esbuild --define.
// Locally: loaded from .env.dev via NX envFile. In CI: fetched from SSM by lambda-auth-build.sh before esbuild runs.
const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
let cachedHash: string | null = null;

async function getHash(): Promise<string> {
  if (cachedHash) return cachedHash;
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: process.env.SM_SECRET_NAME })
  );
  const secret = JSON.parse(response.SecretString ?? '{}') as { DOCS_BASIC_AUTH_HASH?: string };
  if (!/^[0-9a-f]{64}$/.test(secret.DOCS_BASIC_AUTH_HASH ?? ''))
    throw new Error('DOCS_BASIC_AUTH_HASH must be a 64-character lowercase hex string');
  cachedHash = secret.DOCS_BASIC_AUTH_HASH!;
  return cachedHash;
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export const handler = async (event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> => {
  const request = event.Records[0].cf.request;
  const authHeader = request.headers['authorization']?.[0]?.value;

  if (!authHeader?.startsWith('Basic ')) {
    return unauthorized();
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
  const colonIndex = credentials.indexOf(':');
  if (colonIndex < 0) return unauthorized();
  const password = credentials.slice(colonIndex + 1);

  let stored: string;
  try {
    stored = await getHash();
  } catch (err) {
    console.error('SM fetch failed:', err);
    return unauthorized();
  }
  if (!timingSafeEqual(sha256(password), Buffer.from(stored, 'hex'))) {
    return unauthorized();
  }

  return request;
};

function unauthorized(): CloudFrontRequestResult {
  return {
    status: '401',
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': [{ key: 'WWW-Authenticate', value: 'Basic realm="Docs"' }],
    },
  };
}
