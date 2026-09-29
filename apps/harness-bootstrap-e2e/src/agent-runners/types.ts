export interface SkillRunOptions {
  /** Working directory the CLI runs in — must be an isolated scratch
   * workspace, never a real project or the repo itself.
   */
  cwd: string;
  prompt: string;
  timeoutMs?: number;
  /** Extra directories (beyond cwd) the agent may read/write. */
  addDirs?: string[];
  /** Optional path for retaining the complete structured host transcript. */
  transcriptPath?: string;
  /** Print a one-line progress note per stream-json event as it arrives.
   * Defaults on: a real launch/patch turn can run for minutes, and
   * `--output-format json` gives zero output until the whole turn ends —
   * indistinguishable from a hang without this.
   */
  logProgress?: boolean;
}

export interface SkillRunResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  /** The final `type: "result"` stream-json event, if the process emitted one. */
  json?: unknown;
  /** Every stream-json event in order — the full transcript, for graders that
   * need to check *how* the agent worked (task tracking, plan mode usage),
   * not just what's left on disk afterward.
   */
  events: StreamEvent[];
  transcriptPath?: string;
}

export interface ContentBlock {
  type: string;
  id?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  is_error?: boolean;
  content?: string | ContentBlock[];
  name?: string;
  text?: string;
}
export interface StreamEvent {
  type: string;
  item?: {
    type?: string;
    text?: string;
    command?: string;
    aggregated_output?: string;
    content?: ContentBlock[];
    items?: unknown[];
  };
  subtype?: string;
  model?: string;
  duration_ms?: number;
  message?: { content?: ContentBlock[] };
}
