# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Expo SDK 57 + Expo Router + TypeScript, React Native 0.86, Android only, pnpm. Roadmap and
agreed decisions: `openspec/ROADMAP.md`. Expo docs: read the SDK 57 pages
(`https://docs.expo.dev/versions/v57.0.0/`), not `latest` — the Expo MCP docs tools are allowed.

## Commands

- `pnpm start` — dev server over an Expo tunnel (reaches the phone from WSL2); scan the QR code in
  Expo Go. `@expo/ngrok` is a pinned devDependency so Expo never installs it with npm.
- `pnpm check` — every gate: `typecheck`, `lint`, `format:check`, `test`, `check:pins`,
  `expo:doctor` (fail-fast)
- `pnpm test -- src/screens/home` — run one test file or folder
- `pnpm format` — apply Prettier
- Add packages with `pnpm expo install <pkg>`; it writes `~` ranges regardless of `.npmrc`, so pin
  them exactly afterwards — `check:pins` fails otherwise.

## Layout and gotchas

- `src/app` holds routes only; screen bodies live in `src/screens/<name>/`, reusable UI in
  `src/components`, helpers in `src/utils`. Tests sit next to the file they test. Import via `@/`.
- `pnpm doctor` is pnpm's own built-in command, not ours — the Expo check is `pnpm expo:doctor`.
- Expo CLI telemetry writes `~/.expo`, which the agent sandbox blocks: run Expo commands with
  `EXPO_NO_TELEMETRY=1`. `expo:doctor` needs `exp.host` and `reactnative.directory` (allowed in
  the sandbox), and in the sandbox Node's `fetch` only uses the proxy with `NODE_USE_ENV_PROXY=1`
  — so the agent runs the gates as `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1 pnpm check`.
- `pnpm.overrides` pins `test-renderer` to 1.2.0: 1.3.0 needs React 19.3, and React Native 0.86
  ships 19.2.3. Drop the override once React Native moves to React 19.3.

## OpenSpec

Changes are planned with OpenSpec (`openspec/`, schema `spec-driven`). Specs live in
`openspec/specs/`, in-flight changes in `openspec/changes/`, finished ones in
`openspec/changes/archive/`. Drive it with `/opsx:propose`, `/opsx:apply`, `/opsx:sync`, and
`/opsx:archive`. Project context and artifact rules live in `openspec/config.yaml`.

## How developer-flow runs in this repo

Superpowers does the thinking, OpenSpec holds the specs, and the user owns every commit. These
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
5. **Commit only on explicit approval.** No `git commit`, `git push`, or branch-finishing skill
   until the user has manually verified the change and said to commit. Then `/opsx:archive`, and
   make one Conventional Commit for the whole change (archived OpenSpec folder included).

## Commits and changelog (decided)

- **Semantic commits:** every commit follows Conventional Commits (use the
  `conventional-commits` skill). The version bump and changelog are derived from them, so the
  type (`feat`, `fix`, …) and any `BREAKING CHANGE` must be accurate.
- **Changelog generation:** `CHANGELOG.md` is generated from commit history, never hand-edited.
  The tool is not chosen yet — pick it (and optionally commitlint to enforce the format) when the
  app is scaffolded, then record it here with its commands.

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
