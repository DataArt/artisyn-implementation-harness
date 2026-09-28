/** `{{PROJECT_KEY}}`-shaped placeholder extraction and resolution, shared by the
 * planner (which decides what each token resolves to) and the materializer
 * (which applies that decision and re-checks nothing was left unresolved).
 */
import { PROJECT_TOKEN_RE, PROJECT_TOKEN_EXACT_RE } from './constants.mjs';

/** All distinct `{{TOKEN}}` placeholders in `text`, in first-seen order. */
export function findProjectTokens(text) {
  return [...new Set(text.match(PROJECT_TOKEN_RE) ?? [])];
}

/** Decide how each token in `text` resolves for one plan file entry:
 * - a key present in `instanceKnowns` is scoped to this agent instance under an
 *   `AGENT_<NAME>_<KEY>` known, patched directly onto `planKnowns`;
 * - a key already in `planKnowns` (shared, project-wide) resolves to itself;
 * - anything else is left for the entry's `preserve_tokens` list.
 * Returns the `{ replacements, preserve_tokens }` shape a plan file entry declares.
 */
export function resolvePlanReplacements(text, { planKnowns, instanceKnowns = {}, agentName }) {
  const replacements = {};
  const preserve_tokens = [];
  for (const token of findProjectTokens(text)) {
    const key = token.slice(2, -2);
    if (Object.hasOwn(instanceKnowns, key)) {
      const scoped = `AGENT_${agentName.toUpperCase().replaceAll('-', '_')}_${key}`;
      planKnowns[scoped] = instanceKnowns[key];
      replacements[token] = scoped;
    } else if (Object.hasOwn(planKnowns, key)) replacements[token] = key;
    else preserve_tokens.push(token);
  }
  return { replacements, preserve_tokens };
}

/** Apply a plan file entry's declared replacements to `text` in a single pass —
 * a resolved value is never itself re-scanned for further tokens — after
 * checking each declared replacement actually targets a real token and a known
 * frozen value. `label` identifies the source in a thrown error.
 */
export function applyReplacements(text, replacements, preserve, knowns, label) {
  for (const [token, key] of Object.entries(replacements)) {
    if (!PROJECT_TOKEN_EXACT_RE.test(token) || !knowns.has(key) || !text.includes(token))
      throw new Error(`Invalid/missing replacement ${token} in ${label}`);
    if (preserve.includes(token)) throw new Error('A token cannot be replaced and preserved');
  }
  return text.replace(PROJECT_TOKEN_RE, (token) =>
    Object.hasOwn(replacements, token) ? knowns.get(replacements[token]) : token
  );
}

/** Tokens still present in `text` that the entry didn't explicitly preserve —
 * anything here means a replacement was missed or never declared.
 */
export function unresolvedTokens(text, preserve) {
  return findProjectTokens(text).filter((t) => !preserve.includes(t));
}
