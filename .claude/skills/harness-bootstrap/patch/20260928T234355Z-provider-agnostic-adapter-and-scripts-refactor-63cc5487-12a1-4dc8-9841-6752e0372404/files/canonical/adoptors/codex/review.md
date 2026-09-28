# Independent correctness review

Use an exposed independent review capability, or delegate a complete correctness review to a separate agent using the host’s available delegation mechanism. Do not assume Claude’s code-review skill or Skill tool exists.

When a native review is unavailable, an authorized independent reviewer may inspect
the whole diff for behavioral regressions, API/data-contract errors, security issues,
error handling, concurrency and performance failures relevant to the change. Provide
the full diff and needed source/test context. Require file/line, concrete failure
scenario, severity and verification evidence for findings. Identify this mechanism
explicitly; do not claim it ran a missing native skill.

If independent review cannot run, report it as unavailable and wait for human review
or an explicit skip. A skipped pass is NOT RUN, never clean. Preserve its status in
any optional HTML output. Do not implement fixes during the review.
