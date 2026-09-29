import { PROVIDERS } from '../../testkit/providers.ts';
import { bootCase } from './boot.shared.ts';

export const boot002Codex = bootCase('BOOT-002', 'Bootstrap Codex', [PROVIDERS.codex]);
