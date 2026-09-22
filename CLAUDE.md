# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

SpanishGameApp has no application code yet — there is no manifest, so no build, test, or lint
commands exist. Update this file with commands and architecture once the app is scaffolded.

## OpenSpec

Changes are planned with OpenSpec (`openspec/`, schema `spec-driven`). Specs live in
`openspec/specs/`, in-flight changes in `openspec/changes/`, finished ones in
`openspec/changes/archive/`. Drive it with `/opsx:propose`, `/opsx:apply`, `/opsx:sync`, and
`/opsx:archive`. Project context for generated artifacts belongs in `openspec/config.yaml`
(`context:` is currently unset).

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
