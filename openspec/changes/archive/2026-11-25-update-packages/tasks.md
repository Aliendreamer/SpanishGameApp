# Tasks

## 1. Update

- [x] 1.1 Set the versions in `package.json`, remove the `minimumReleaseAgeExclude` block, and re-resolve the lockfile; verify `pnpm check:pins` and `expo install --check` pass
- [x] 1.2 Verify nothing unintended moved: `react`, `react-native`, and the `react-native-*` packages keep their versions, and there is one copy of each
- [x] 1.3 Replace `waitFor(async …)` in the route tests with a helper that never overlaps `act()` and note it in `CLAUDE.md`; verify the 5 tests that fail on `expo-router` 57.0.32 pass three runs in a row

## 2. Verify

- [x] 2.1 Run `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1 pnpm check` (red on `expo:doctor` before this change); verify every gate is green
- [x] 2.2 Run the Android `expo export` from `CLAUDE.md`; verify it bundles

## Workflow follow-up

- The user makes a new build and checks that it starts and swipes on the phone.
