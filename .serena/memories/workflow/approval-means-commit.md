# Approval means archive + commit

Once a change's tasks are all done and the gates are green, the user's approval of the result ("looks great", "good", "ok") is the go-ahead to run `/opsx:archive` (with spec sync) and make the Conventional Commit. Don't ask for a separate literal "commit".

**Why:** On 2026-09-23 the user said "looks great" on the finished vocabulary-import change. I asked them to confirm with "commit", and they pushed back: "why you ask me to commit just commit".

**How to apply:** Only when the change is complete (tasks checked, gates green). Still never push unless asked. Still leave unrelated or risky working-tree changes (for example `.claude/settings.json` security settings) out of the commit, and say which ones in the report.
