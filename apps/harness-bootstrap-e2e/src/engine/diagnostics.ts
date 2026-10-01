import type { GradeContext } from '../graders/_types.ts';
import { finalAgentMessage } from '../agent-runners/transcript.ts';

/** Breadcrumbs appended to a failing report so a failure is diagnosable
 * without paying for another hour-long run.
 *
 * Generic rather than per-scenario: any step that invoked an agent leaves a
 * `launch` and a `transcriptPath` on the context, and a host that emits no
 * closing message simply contributes nothing.
 */
export function transcriptDiagnostics(context: GradeContext): string[] {
  const notes: string[] = [];
  const explanation = context.launch ? finalAgentMessage(context.launch.events) : '';
  if (explanation) notes.push(`${context.host ?? 'agent'} final response: ${explanation}`);
  if (context.transcriptPath)
    notes.push(`Full ${context.host ?? 'agent'} transcript: ${context.transcriptPath}`);
  return notes;
}
