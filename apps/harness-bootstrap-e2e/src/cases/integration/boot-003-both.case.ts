import { bootCase } from './boot.shared.ts';

/** Primary CI smoke case: the only one that proves canonical->Claude and
 * canonical->Codex projections stay semantically aligned, since it's the
 * only run with both to compare.
 */
export const boot003Both = bootCase('BOOT-003', 'Bootstrap Claude and Codex', ['claude', 'codex']);
