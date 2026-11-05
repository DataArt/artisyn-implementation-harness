# Independent correctness review in Copilot

Use an exposed independent review capability or delegate to a separate authorized
reviewer using the installed role. A built-in code-review agent is useful only
when actually available and suitable for the required scope. Do not claim that a
native independent review capability ran. The author rereading their own work is self-review.

Provide the reviewer the full diff and relevant source/test context. Require file,
line, concrete failure scenario, severity and evidence for actionable findings.
Keep review separate from fixes. Verify returned results and preserve the workflow's
sign-off gate. If independent review cannot run, mark it NOT RUN and pending human
review or an explicit exception; never describe an unavailable pass as clean.
