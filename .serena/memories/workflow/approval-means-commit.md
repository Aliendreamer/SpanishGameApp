# Commit freely, only push needs approval

Commit whenever work is done, with a Conventional Commit message I write myself. Never ask the user to approve a commit, its message, or whether to commit. The only step that needs the user's OK is `git push`.

**Why:** On 2026-09-23 the user said: "why you ask me to commit just commit", then "stop asking me for approving commit messages", then "i want you to commit with whatever message and we will configure husky with pre-commit hooks etc, i just want to [approve] the push".

**How to apply:**
- Still follow Conventional Commits (the changelog depends on it). Husky pre-commit hooks (and likely commitlint) are planned to enforce format and gates, and they aren't set up yet.
- Never push without asking.
- Leave unrelated or risky working-tree changes (for example `.claude/settings.json` security settings) out of commits, and mention them afterwards without asking first.
- The harness still prompts on `git commit` until the user removes `Bash(git commit*)` from the `ask` list in `.claude/settings.json`. The agent can't edit its own permissions, because the auto-mode classifier blocks it.
