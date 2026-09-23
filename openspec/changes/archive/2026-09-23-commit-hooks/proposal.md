## Why

The agent now commits without asking, and the changelog will be generated from commit history, so
the repo itself has to enforce Conventional Commits and basic code quality at commit time rather
than relying on review. Husky is installed, but its only hook runs the tests, and nothing checks
commit messages.

## What Changes

- `commit-msg` hook: commitlint with `@commitlint/config-conventional` rejects messages that are
  not Conventional Commits.
- `pre-commit` hook: lint-staged runs `eslint --fix` and `prettier --write` on staged files, then
  `pnpm typecheck` and `pnpm test` run on the whole project. `expo-doctor` and `check:pins` stay
  out (network, speed); `pnpm check` remains the full gate.
- `pnpm lint` lints the whole repo, with Node and Jest globals for `scripts/` and `plugins/`,
  so lint-staged and the gate agree.
- New pinned dev dependencies: `@commitlint/cli`, `@commitlint/config-conventional`,
  `lint-staged`, `globals` (`husky` is already added).
- `CLAUDE.md` records commitlint as the chosen message checker (changelog tool still open) and the
  hooks; `openspec/config.yaml` task rule updated to the commit-without-approval policy.

## Capabilities

### New Capabilities

- `commit-hooks`: git hooks that enforce Conventional Commit messages and lint, format, typecheck,
  and test the code before each commit.

### Modified Capabilities

<!-- none -->

## Impact

- New: `.husky/commit-msg`, `commitlint.config.js`, lint-staged config, `scripts/commit-hooks.test.js`,
  `scripts/test-utils.js`.
- Changed: `.husky/pre-commit`, `eslint.config.js`, `scripts/build-config.test.js` (shared helpers), `package.json`, `pnpm-lock.yaml`, `CLAUDE.md`, `openspec/config.yaml`.
- Every commit now takes ~5–10 s longer; `git commit --no-verify` bypasses the hooks.
