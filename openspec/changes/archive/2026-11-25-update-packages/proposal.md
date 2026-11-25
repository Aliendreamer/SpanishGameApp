# Proposal

## Why

`expo:doctor`, one of the gates in `pnpm check`, fails: 9 Expo packages are behind the patch versions
SDK 57 now expects. The user asked to update all packages in a change of its own.

## What Changes

- **Expo packages** to the versions SDK 57 expects: `expo` 57.0.34, `expo-build-properties` 57.0.24,
  `expo-constants` 57.0.25, `expo-dev-client` 57.0.22, `expo-linking` 57.0.14, `expo-router` 57.0.32,
  `expo-splash-screen` 57.0.12, `expo-sqlite` 57.0.7, `jest-expo` 57.0.6.
- **Tools**: `@commitlint/cli` and `@commitlint/config-conventional` 21.2.4,
  `@testing-library/react-native` 14.1.0, `@types/node` 24.19.4, `expo-doctor` 1.21.8, `globals`
  17.14.0, `lint-staged` 17.6.2, `prettier` 3.10.1.
- The lockfile is re-resolved, so indirect packages move to their newest allowed versions too.
- The temporary `minimumReleaseAgeExclude` block in `pnpm-workspace.yaml` goes, as its comment says.
- Route tests wait on the database without `waitFor`, which the newer `expo-router` no longer tolerates
  with an async check (see design.md).

## Non-goals

Held back, because SDK 57 or the Node version sets them:

- **Expo SDK 58** and what comes with it: React Native 0.88, React 19.3, gesture-handler 3, Reanimated
  4.8, worklets 0.14, screens, safe-area-context, svg, async-storage 3, `eslint-config-expo` 58. A
  platform upgrade of its own, for the user to decide.
- **Majors tied to it**: Jest 30 (`jest-expo` 57 uses 29) and `@types/jest` 30, ESLint 10, TypeScript 7.
- `@types/react` stays on 19.2 to match React 19.2.3; `@types/node` stays on 24 to match Node 24.
- `test-renderer` stays pinned to 1.2.0 (1.3 needs React 19.3).
- pnpm, Node, and `eas-cli`: build tools, pinned together in `package.json` and `eas.json`.

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `src/__tests__/app/index.test.tsx`, and the
  Jest note in `CLAUDE.md`. No app code.
- Some Expo packages hold native code: a new development or preview build is needed on the phone.
