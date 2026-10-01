import type { Provider } from '../utils/providers.ts';
import type { GradeContext, GradeResult, GraderBinding } from './_types.ts';

export function result(grader: string, failures: string[]): GradeResult {
  return { grader, pass: failures.length === 0, failures };
}

/** Graders that inspect provider-specific output need a single provider. A
 * scenario that never chose one is a configuration error, not a test failure.
 */
export function requireProvider(context: GradeContext): Provider {
  if (!context.provider) throw new Error('grader requires a single provider on the context');
  return context.provider;
}

export function when(
  predicate: (context: GradeContext) => boolean,
  binding: GraderBinding
): GraderBinding {
  return (context) => (predicate(context) ? binding(context) : null);
}
