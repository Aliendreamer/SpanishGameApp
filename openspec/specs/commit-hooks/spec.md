# commit-hooks Specification

## Purpose
Git hooks (husky) that enforce Conventional Commit messages with commitlint and lint, format,
typecheck, and test the code before each commit, with a lint gate that covers every staged file.
## Requirements
### Requirement: Conventional Commit messages

The `commit-msg` hook SHALL run commitlint with the `@commitlint/config-conventional` rules and
reject any commit whose message does not pass.

#### Scenario: Valid message accepted

- **WHEN** a commit message is `feat(vocabulary-import): build vocabulary database`
- **THEN** commitlint reports no errors

#### Scenario: Missing type rejected

- **WHEN** a commit message is `update stuff`
- **THEN** commitlint reports an error and the commit is aborted

#### Scenario: Capitalised type rejected

- **WHEN** a commit message is `Feat: add x`
- **THEN** commitlint reports an error

#### Scenario: Existing history passes

- **WHEN** the repo's existing commit messages are linted once, when the hook is introduced
- **THEN** each one passes

### Requirement: Pre-commit quality checks

The `pre-commit` hook SHALL run lint-staged, then `pnpm typecheck`, then `pnpm test`, and abort
the commit if any step fails. lint-staged SHALL run `eslint --fix` on staged JS/TS files and
`prettier --write` on staged files Prettier supports.

#### Scenario: Hook commands

- **WHEN** `.husky/pre-commit` is read
- **THEN** it runs lint-staged, `pnpm typecheck`, and `pnpm test`, in that order

#### Scenario: Staged files are fixed

- **WHEN** the lint-staged configuration is read
- **THEN** JS/TS files get `eslint --fix` and `prettier --write`, and other supported files get
  `prettier --write --ignore-unknown`

### Requirement: Hooks installed on install

Installing dependencies SHALL install the hooks via the `prepare` script running `husky`.

#### Scenario: Prepare script

- **WHEN** `package.json` is read
- **THEN** `scripts.prepare` is `husky`

### Requirement: Lint gate covers staged files

`pnpm lint` SHALL lint every JS/TS file lint-staged can stage, so a file that passes the gate
also passes the pre-commit hook.

#### Scenario: Repo scripts linted

- **WHEN** `pnpm lint` runs
- **THEN** files in `scripts/` and `plugins/` are linted with Node globals, and their tests with
  Jest globals, and it exits 0
