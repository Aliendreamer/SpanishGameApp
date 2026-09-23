## 1. Commit message linting

- [x] 1.1 Write failing tests: commitlint accepts a valid message, rejects `update stuff` and `Feat: add x`
- [x] 1.2 Add pinned `@commitlint/cli` and `@commitlint/config-conventional`, `commitlint.config.js`, and `.husky/commit-msg`; tests pass

## 2. Pre-commit checks

- [x] 2.1 Write failing tests: `.husky/pre-commit` runs lint-staged, typecheck, test in order; lint-staged config maps JS/TS and other files; `prepare` is `husky`
- [x] 2.2 Add pinned `lint-staged`, its config in `package.json`, and update `.husky/pre-commit`; tests pass

## 3. Docs and verification

- [x] 3.1 Update `CLAUDE.md` (commitlint chosen, hooks, `--no-verify` note) and the tasks rule in `openspec/config.yaml`
- [x] 3.2 Verify end to end: a bad message is rejected and a good one accepted by the real hooks; every existing commit message passes commitlint

## 4. Lint coverage for staged files

- [x] 4.1 Point `pnpm lint` at the whole repo (`expo lint .`) and see it fail on `scripts/` and `plugins/` (Node and Jest globals unknown)
- [x] 4.2 Give ESLint Node globals for CommonJS scripts/config files and Jest globals for their tests (pinned `globals`); `pnpm lint` passes
