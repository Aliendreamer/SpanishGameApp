# Design

## Context

See proposal.md for the motivation. The facts below were checked against the SDK 58 changelog, the
React Native 0.87 and 0.88 posts, and the published packages (2026-11-27).

- **Gestures**: gesture-handler 3.3.0 still exports the builder API and `GestureType`. It marks the
  builder API deprecated. Its `GestureDetector` hands builder gestures to the old detector code.
  - `jest-utils` (`fireGestureHandler`, `getByGestureTestId`) and `jestSetup` still exist.
  - A builder gesture's `config.maxDist` and `config.minDist` are unchanged.
  - Builder gestures and the new hook gestures cannot be related to each other.
- **Animation**: Reanimated 4.7.1 accepts React Native 0.86–0.88 and worklets 0.13.x.
  `scheduleOnRN`, `setUpTests`, `react-native-worklets/src/mock`, and `react-native-reanimated/mock`
  are all still there.
- **Tests**:
  - `jest-expo` 58 has `@react-native/jest-preset` ^0.88.1 as a required peer.
  - `jest-expo` 58 depends on `test-renderer` 1.3.0, and its own Jest packages are 30.
  - The repo uses none of the matcher aliases Jest 30 removes.
- **Android**:
  - React Native 0.88 compiles against API 37 (build-tools 37.0.0), targets 36, and keeps NDK
    27.1.12297006, minimum SDK 24, AGP 9.2, and Kotlin 2.2.
  - Expo's Gradle code builds for Java 17.
  - Node must be 24.3 or newer: this machine has 24.18.1 and `eas.json` 24.12.0.
- **Code**:
  - SDK 58 turns R8 on in release builds by default.
  - Expo Router 58 reworked its navigation core. The repo uses no custom navigators and no
    `withLayoutContext`.
  - Expo SQLite 58 only drops libSQL, which the repo doesn't use.
  - React Native 0.88 removes `InteractionManager`, the Touchable root export, `NativeMethods`,
    Modal `animated`, and some `StatusBar` props. A search finds none of them in `src/` or
    `plugins/`.

## Goals / Non-Goals

**Goals:** the project runs in Expo Go 58 and builds with SDK 58. Every gate is green. The app behaves
on the phone as it does today.

**Non-Goals:** see proposal.md. In particular, no move to the gesture hook API and no new features.

## Decisions

- **Install SDK 58 with `pnpm expo install expo@58.1.0 --fix`.** That lets Expo choose every native
  package version, then each `~` range is pinned exactly for `check:pins`.
  - *Hand-picking newer versions (Reanimated 4.8, gesture-handler 3.5)*: rejected, because
    `expo-doctor` flags anything off its list.
- **Keep the gesture builder API.** It works in 3.3.0 and the card's tests use it directly.
  - *Moving to `usePanGesture` / `useTapGesture` / `useCompetingGestures` now*: rejected. It is a
    rewrite of the riskiest part of the app, mixed into an upgrade, and the nested example tap would
    need `InterceptingGestureDetector` / `VirtualGestureDetector`, which we haven't tried.
  - Deprecation warnings are accepted. If tests turn them into noise, they are filtered in
    `jest.setup.js`, not hidden in the app.
- **Compile against 37, target 36.** This matches React Native 0.88's own defaults. Pinning compile
  at 36 would fight the AndroidX versions 0.88 brings.
  - Raising the target is a Play Store decision, kept out of this change.
- **Jest 30 now, not later.** `jest-expo` 58 is built on Jest 30 packages. Staying on 29 would mix
  two Jest versions in one run.
- **Drop the `test-renderer` override** and let `jest-expo` 58's 1.3.0 be the only copy.
- **Keep R8 on**, SDK 58's default. It is checked on the phone with the preview APK. If something
  breaks only in release, turn it off in `expo-build-properties` rather than writing keep rules
  blind.
- **No `minimumReleaseAgeExclude`**: all the versions are over 24 hours old.

## Risks / Trade-offs

- **The tap and swipe can behave differently on the phone**, for three reasons:
  - React Native 0.88 sends events through the W3C EventTarget model.
  - gesture-handler 3 changed how detectors attach.
  - gesture-handler 3.x fixed an awaiting parent cancelling its child.

  Jest can't show any of this, so the phone check repeats the tap, swipe, example tap, and ↻ checks.
- **R8 can strip something one of the libraries reaches by reflection.** Only the release APK shows
  it. The fallback is above.
- **Route tests can break again** under Jest 30's newer fake timers together with Expo Router 58's
  deferred navigation. The `eventually` helper in `src/__tests__/app/index.test.tsx` is the first
  place to look. If it breaks, fix the test's waiting, not the app.
- **The dev build on the phone stops working.** It is replaced by a new development build after
  `scripts/setup-android.sh` installs platform 37 and build-tools 37.0.0. `android/` is generated,
  so the Gradle script regenerates it for AGP 9.
- **Deprecated gesture API**: a later gesture-handler major may remove it. That is a follow-up
  change, recorded in the roadmap.
