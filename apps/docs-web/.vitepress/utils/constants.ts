import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const DOCS_ROOT = resolve(__dirname, '../../../../docs');
export const HLD_VERSION = 'v1';
