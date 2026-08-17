import * as esbuild from 'esbuild';

const SM_SECRET_NAME = process.env['SM_SECRET_NAME'];
const AWS_REGION = process.env['AWS_REGION'];

if (!SM_SECRET_NAME) throw new Error('SM_SECRET_NAME must be set');
if (!AWS_REGION) throw new Error('AWS_REGION must be set');

esbuild
  .build({
    entryPoints: ['src/handler.ts'],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    outfile: 'dist/index.js',
    external: ['@aws-sdk/client-secrets-manager'],
    define: {
      'process.env.SM_SECRET_NAME': JSON.stringify(SM_SECRET_NAME),
      'process.env.AWS_REGION': JSON.stringify(AWS_REGION),
    },
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
