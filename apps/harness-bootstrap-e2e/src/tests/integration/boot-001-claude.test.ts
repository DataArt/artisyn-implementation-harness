import { PROVIDERS } from '../../utils/providers.ts';
import { bootCase } from './boot.shared.ts';

export const boot001Claude = bootCase('BOOT-001', 'Bootstrap Claude', [PROVIDERS.claude]);
