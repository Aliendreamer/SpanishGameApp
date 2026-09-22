## Why

The repo has workflow tooling but no app. Step 1 of `openspec/ROADMAP.md` puts a clean Expo +
TypeScript project in place, with its quality gates, so every later change (builds, vocabulary
import, game UI) lands on a structure and a set of checks that already exist and pass.

## What Changes

- Scaffold an Expo (SDK 57) + TypeScript app with Expo Router, targeting Android only.
- Strip the template's demo content down to one placeholder screen — no features, no data.
- Establish the folder layout under `src/` (routes-only `src/app`, plus `components`, `screens`,
  `hooks`, `utils`) with the `@/*` import alias.
- Add quality gates as `package.json` scripts: typecheck, lint, format check, test, expo-doctor,
  and one `check` script that runs them all.
- Pin every dependency to an exact version and make exact pinning the default for future installs.
- Record the real commands in `CLAUDE.md` and wire the repo tooling that needs a `package.json`
  (the dependency-pin audit skill and the Prettier-on-save hook).

Out of scope: native builds, `eas.json` (step 2), vocabulary data (step 3), any game UI (step 4).

## Capabilities

### New Capabilities

- `project-scaffold`: the app project itself — runs in Expo Go on Android, follows the agreed
  folder layout, and exposes quality gates that pass on a clean checkout.

### Modified Capabilities

<!-- none — no existing specs -->

## Impact

- New files at the repo root: `package.json`, `pnpm-lock.yaml`, `app.json`, `tsconfig.json`,
  ESLint/Prettier/Jest config, `.npmrc`, `.nvmrc`, `assets/`, `src/`.
- New runtime dependencies: Expo SDK 57 and its React Native / Expo Router set.
- New dev dependencies: jest-expo, React Native Testing Library, ESLint (eslint-config-expo),
  Prettier.
- `CLAUDE.md` gains a Commands section; `.claude/` gains the `audit-package-version` skill and the
  Prettier PostToolUse hook.
