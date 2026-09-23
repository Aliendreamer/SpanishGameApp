## Context

Husky 9.1.7 and `"prepare": "husky"` were added by hand; `.husky/pre-commit` runs `pnpm test`.
The agent commits without approval and pushes only on request, and `CHANGELOG.md` will be derived
from commit messages, so message format and a baseline of code quality must be enforced locally.

## Goals / Non-Goals

**Goals:** reject non-conventional messages; auto-fix lint and format on staged files; block
commits that break typecheck or tests.

**Non-Goals:** choosing the changelog/release tool; a pre-push hook; CI.

## Decisions

- **commitlint + `@commitlint/config-conventional`**, unmodified. Its type list already covers
  what we use; scope stays optional. Alternative: a custom regex hook — no, commitlint is the
  standard and pairs with future changelog tools.
- **Config as `commitlint.config.js` (CommonJS)**, matching `eslint.config.js`.
- **lint-staged config in `package.json`** (`"lint-staged"` key) — one fewer file.
  - `*.{js,jsx,ts,tsx}` → `eslint --fix`, `prettier --write`
  - `!(*.{js,jsx,ts,tsx})` → `prettier --write --ignore-unknown`
  The two globs don't overlap, so Prettier never runs twice on one file at the same time;
  `.prettierignore` still excludes Markdown, `openspec/`, and the lockfile.
- **typecheck + test in pre-commit** (user's choice): whole-project, ~5–10 s. `expo-doctor` and
  `check:pins` excluded — network-bound or slow — and remain in `pnpm check`.
- **`pnpm lint` covers the whole repo** (`expo lint .`, was `src/` etc. only), and ESLint gets
  Node globals for `scripts/` and `plugins/` and Jest globals for their tests (`globals`, pinned).
  Otherwise lint-staged would lint files the gate never checked and block commits on 104
  pre-existing `no-undef` errors.
- **Tests** live in `scripts/commit-hooks.test.js`, next to the other repo-config tests, and use
  `@commitlint/lint` + `@commitlint/config-conventional` programmatically on real history.

## Risks / Trade-offs

- [Slower commits] → only staged files are linted; tests are fast (~3 s).
- [Hook bypass with `--no-verify`] → `pnpm check` stays the agent's gate before each commit.
- [Hooks fail in the agent sandbox or without deps installed] → `pnpm exec` resolves local
  binaries; `prepare` reinstalls hooks on `pnpm install`.
