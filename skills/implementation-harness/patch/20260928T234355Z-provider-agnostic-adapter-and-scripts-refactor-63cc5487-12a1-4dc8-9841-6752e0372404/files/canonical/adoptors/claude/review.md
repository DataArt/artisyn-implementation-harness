# Independent correctness review

Use an available, authorized code-review skill for the complete diff when the host exposes it. If it is user-invocable only, present its documented invocation with the exact target and wait for its result or an explicit skip. Do not invent a Skill API or a command for an unavailable skill.

When a native review is unavailable, an authorized independent reviewer may inspect
the whole diff for behavioral regressions, API/data-contract errors, security issues,
error handling, concurrency and performance failures relevant to the change. Provide
the full diff and needed source/test context. Require file/line, concrete failure
scenario, severity and verification evidence for findings. Identify this mechanism
explicitly; do not claim it ran a missing native skill.

If independent review cannot run, report it as unavailable and wait for human review
or an explicit skip. A skipped pass is NOT RUN, never clean. Preserve its status in
any optional HTML output. Do not implement fixes during the review.
