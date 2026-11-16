import type { StreamEvent } from './_types.ts';

/** How much of the agent's closing message to keep in a failure report. */
const MAX_MESSAGE_CHARS = 4000;

/** The assistant's last spoken message. When a run fails, this is usually the
 * agent explaining why — far more useful than only reporting which files are
 * absent. Hosts that emit no `agent_message` items yield an empty string.
 */
export function finalAgentMessage(events: StreamEvent[]): string {
  const messages = events
    .filter((event) => event.item?.type === 'agent_message')
    .map((event) => {
      const item = event.item;
      return item?.text ?? item?.content?.map((part) => part.text ?? '').join('');
    })
    .filter((message): message is string => Boolean(message?.trim()));
  return messages.at(-1)?.trim().slice(-MAX_MESSAGE_CHARS) ?? '';
}
