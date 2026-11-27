# Proposal

## Why

The Expo Go on the user's phone is SDK 58, so it no longer opens this SDK 57 project. The user asked
to update every package that can be updated. SDK 58 (`expo` 58.1.0) has been out since 2026-09-29,
and the newest SDK 58 versions are all more than 24 hours old, so pnpm's `minimumReleaseAge` accepts
them without exceptions.

## What Changes

- **Expo SDK 58**: `expo` 58.1.0 and the versions it lists:
  - `react` 19.3.0 and `react-native` 0.88.1.
  - `react-native-gesture-handler` 3.3.0, a new major.
  - `react-native-reanimated` 4.7.1 and `react-native-worklets` 0.13.0.
  - `react-native-screens` 4.30.1, `react-native-safe-area-context` 5.11.1, and `react-native-svg`
    15.16.0.
  - `expo-router`, `expo-sqlite`, `expo-font`, `expo-constants`, `expo-linking`,
    `expo-splash-screen`, `expo-system-ui`, `expo-dev-client`, and `expo-build-properties` on
    58.x.
  - `jest-expo` and `eslint-config-expo` on 58.x.
- **Tests**:
  - `jest` 30.5.2 and `@types/jest` 30.0.0.
  - The new `@react-native/jest-preset` 0.88.1, which `jest-expo` 58 needs installed alongside it.
  - The `test-renderer` 1.2.0 override is dropped: React 19.3 removes the reason for it, and
    `jest-expo` 58 depends on 1.3.0.
- **Other tools**: `@types/react` 19.3.3 and `expo-doctor` 1.21.9.
- **Android**:
  - Compile against API 37, which React Native 0.88 compiles against. The target stays at API 36.
  - `doctor:android` asks for platform 37 and build-tools 37.0.0. NDK 27.1 and JDK 17 stay.
- **Clean-up**: the leftover `minimumReleaseAgeExclude` entry for `@types/node@24.19.4` goes, as
  `CLAUDE.md` says to re-resolve instead.
- **Docs**: `CLAUDE.md`, `openspec/config.yaml`, and the scaffold and build specs say SDK 58, React
  Native 0.88, and API 37.

## Decided here, for the user to confirm

- **Gesture code**: it keeps gesture-handler's older builder API (`Gesture.Pan()`,
  `Gesture.Tap()`, `Gesture.Race`). Version 3 marks that API deprecated but still ships it and its
  test helpers, so the card's swipe, tap, and example tap stay as they are. Moving to the new hook
  API is a separate change for later.
- **Release builds**: they take SDK 58's default of shrinking code with R8. If the release APK
  misbehaves on the phone, R8 is turned off in `expo-build-properties`.

## Non-goals

These are held back:

- TypeScript 7: the ESLint TypeScript plugin supports TypeScript only below 6.1.
- ESLint 10: `eslint-plugin-react`, `eslint-plugin-import`, and `eslint-plugin-expo` require 9.
- `@types/node` 26: Node stays on 24.
- `async-storage` 3: SDK 58 still lists 2.2.0.
- Versions newer than SDK 58 lists, such as Reanimated 4.8 and gesture-handler 3.5:
  `expo-doctor` flags them.
- Raising the target to API 37, and pnpm, Node, and `eas-cli`.

## Capabilities

### New Capabilities

### Modified Capabilities

- `project-scaffold`: the app is an Expo SDK 58 app.
- `android-build`: compile against API 37 and target API 36; the toolchain check asks for platform 37
  and build-tools 37.0.0.

## Impact

- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and possibly `jest.setup.js` and the
  Jest config.
- `app.json` (`compileSdkVersion`), `scripts/doctor-android.js`, and their tests.
- `CLAUDE.md`, `openspec/config.yaml`, and `openspec/ROADMAP.md` if it names versions.
- App code only where the upgrade breaks it. A search found none of the React Native APIs that 0.88
  removes.
- Native code changes:
  - A new development build and a new preview APK are needed.
  - The user runs `scripts/setup-android.sh` once to install platform 37 and build-tools 37.0.0.
