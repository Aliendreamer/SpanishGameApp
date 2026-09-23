# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Expo SDK 57 + Expo Router + TypeScript, React Native 0.86, Android only, pnpm 12 (`packageManager`
in `package.json`; EAS builds use the same pnpm and Node via the `base` profile in `eas.json`). Roadmap and
agreed decisions: `openspec/ROADMAP.md`. Expo docs: read the SDK 57 pages
(`https://docs.expo.dev/versions/v57.0.0/`), not `latest` — the Expo MCP docs tools are allowed.

## Commands

- `pnpm start` — dev server over an Expo tunnel (reaches the phone from WSL2); scan the QR code in
  Expo Go. `@expo/ngrok` is a pinned devDependency so Expo never installs it with npm.
- `pnpm start:dev` — same, for the development build (`expo-dev-client`) instead of Expo Go.
- `pnpm check` — every gate: `typecheck`, `lint`, `format:check`, `test`, `check:pins`,
  `expo:doctor` (fail-fast)
- `pnpm test -- src/screens/home` — run one test file or folder
- `pnpm format` — apply Prettier
- Add packages with `pnpm expo install <pkg>`; it writes `~` ranges regardless of `.npmrc`, so pin
  them exactly afterwards — `check:pins` fails otherwise.

## Android builds

Profiles `development` (dev-client APK), `preview` (release APK), `production` (AAB), each three
ways — output lands in `build/`:

- `pnpm build:<profile>` — EAS cloud (free plan queues)
- `pnpm build:<profile>:local` — EAS build process on this machine (WSL: works, not officially
  supported)
- `pnpm build:<profile>:gradle` — `scripts/build-gradle.sh`: prebuild + Gradle, no Expo account.
  Release profiles need `credentials.json`. First build ~17 min, cached ~9 min; `android/` is
  generated, never committed. Gradle builds do not run inside the agent sandbox (Android Gradle
  Plugin writes to `/tmp`, file watching fails) — the user runs them; the agent verifies the output
  with `apksigner verify --print-certs`. Never run two builds at once: they share `android/`.

Toolchain: `scripts/setup-android.sh` installs JDK 17 + SDK (platform 36, build-tools 36.0.0, NDK
27.1) — command-line tools 16111833+ use the new `android sdk install` CLI, not `sdkmanager`.
Verify with `pnpm doctor:android`. EAS CLI runs as `pnpm eas …` (`pnpm dlx eas-cli@24.7.0`); it
must not be a project dependency — `expo-doctor` fails if it is.

Signing: EAS manages the upload key; the backup is `credentials.json` + `credentials/android/keystore.jks`,
encrypted with git-crypt and excluded from EAS uploads by `.easignore`. `.easignore` replaces
`.gitignore` for EAS, so keep every `.gitignore` entry in it (a test checks). A local production
build needs `android.versionCode` bumped in `app.json` by hand; EAS auto-increments its own.

## Vocabulary data

`pnpm vocab:build [--cefr]` (`tools/vocabulary-import/`, TypeScript run directly by Node 24, no
build step) downloads the pinned sources from `tools/vocabulary-import/sources.json` into a temp dir,
builds `assets/vocabulary/` (`vocabulary.db` for the app; `vocabulary.json`, stats, `IMPORT_REPORT.md`,
`DATA-LICENSE.md` for review), and replaces that folder only if every stage succeeds. Read
`IMPORT_REPORT.md` after every rebuild — its key diff lists words whose user progress an update
would orphan. Generated files are committed; never hand-edit them. The tool has its own
`tsconfig.json` (Node types, `.ts` import extensions); the app's excludes `tools/`.

## Layout and gotchas

- `src/app` holds routes only; screen bodies live in `src/screens/<name>/`, reusable UI in
  `src/components`, helpers in `src/utils`. Tests sit next to the file they test. Import via `@/`.
- `pnpm doctor` is pnpm's own built-in command, not ours — the Expo check is `pnpm expo:doctor`.
- Expo CLI telemetry writes `~/.expo`, which the agent sandbox blocks: run Expo commands with
  `EXPO_NO_TELEMETRY=1`. `expo:doctor` needs `exp.host` and `reactnative.directory` (allowed in
  the sandbox), and in the sandbox Node's `fetch` only uses the proxy with `NODE_USE_ENV_PROXY=1`
  — so the agent runs the gates as `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1 pnpm check`.
- pnpm settings live in `pnpm-workspace.yaml` (pnpm 11+ ignores the `pnpm` field in `package.json`
  and `.npmrc` settings; `.npmrc` stays only for tools that read it). It pins `test-renderer` to
  1.2.0 (1.3.0 needs React 19.3; React Native 0.86 ships 19.2.3) and keeps pnpm's default
  `minimumReleaseAge` (packages under 24 h old are refused). If an install trips that rule, re-resolve
  with `pnpm clean --lockfile && pnpm install` — don't add `minimumReleaseAgeExclude` entries.
- pnpm 12 has no `-s` flag; use `pnpm <script>` or `pnpm --silent <script>`.

## OpenSpec

Changes are planned with OpenSpec (`openspec/`, schema `spec-driven`). Specs live in
`openspec/specs/`, in-flight changes in `openspec/changes/`, finished ones in
`openspec/changes/archive/`. Drive it with `/opsx:propose`, `/opsx:apply`, `/opsx:sync`, and
`/opsx:archive`. Project context and artifact rules live in `openspec/config.yaml`.

## How developer-flow runs in this repo

Superpowers does the thinking, OpenSpec holds the specs, and the user owns every push. These
rules override the superpowers skills' defaults where they conflict:

1. **Think — `superpowers:brainstorming`.** Discuss until the design is agreed, then stop. Do
   **not** write `docs/superpowers/specs/*`, do not commit, and do not invoke
   `superpowers:writing-plans`. The agreed design goes straight into step 2.
2. **Spec — `/opsx:propose <change-name>`.** The proposal, design, specs, and `tasks.md` under
   `openspec/changes/<name>/` are the only spec and plan. Never create `docs/superpowers/plans/*`.
   Get the user's OK on the proposal before implementing.
3. **Build — `/opsx:apply <change-name>` with `superpowers:test-driven-development`.** Work
   through `tasks.md` test-first, checking tasks off as they go green. Do not use
   `superpowers:executing-plans` or `superpowers:subagent-driven-development` unless the user asks;
   if they do, skip every commit step those skills prescribe.
4. **Simplify, review, gates, report** — as in `developer-flow`.
5. **Commit freely; push only on approval.** Once every task is done and the gates are green, run
   `/opsx:archive` (with spec sync) and make one Conventional Commit for the whole change
   (archived OpenSpec folder included) without asking. Never ask the user to approve a commit or its
   message. `git push` and branch-finishing skills wait until the user has manually verified the
   change and said to push.

## Commits and changelog (decided)

- **Semantic commits:** every commit follows Conventional Commits (use the
  `conventional-commits` skill). The version bump and changelog are derived from them, so the
  type (`feat`, `fix`, …) and any `BREAKING CHANGE` must be accurate.
- **Hooks (husky, installed by `pnpm install`):** `commit-msg` runs commitlint
  (`@commitlint/config-conventional`, `commitlint.config.js`) and rejects non-conventional
  messages; `pre-commit` runs lint-staged (`eslint --fix` + `prettier --write` on staged files,
  config in `package.json`), then `pnpm typecheck` and `pnpm test`. `expo:doctor` and
  `check:pins` are not in the hook, so still run `pnpm check` before committing. Never bypass
  the hooks with `--no-verify`.
- **Changelog generation:** `CHANGELOG.md` is generated from commit history, never hand-edited.
  The tool is not chosen yet — pick it when the first release is prepared, then record it here
  with its commands.

<!-- setup-flow:start -->
## MANDATORY workflow

**For ANY feature, change, or bugfix you MUST follow the `developer-flow` skill.** Invoke it at the
start of implementation work; do not skip or reorder its steps: brainstorm → plan/proposal →
implement (TDD) → simplify → code review → run the repo's quality gates → report → user approval and
manual verification before archive/commit. If a change adds or modifies a web endpoint, create or
update its `.http` file as part of the same change.

**Prefer semantic code tools for code search and edits** — e.g. Serena MCP or your editor's LSP
(`find_symbol`, `replace_symbol_body`, `find_referencing_symbols`) — over raw text/grep where a
semantic tool applies.

**After finishing a task, optimize skills when there's concrete feedback for it.** If the session
surfaced specific learnings about how a skill performed — an activation gap, a regression, missing or
misleading guidance, or a confirmed improvement — refine that skill (use a skill-optimizing skill if
one is available) before moving on. Only when the feedback is specific; skip it otherwise.
<!-- setup-flow:end -->
