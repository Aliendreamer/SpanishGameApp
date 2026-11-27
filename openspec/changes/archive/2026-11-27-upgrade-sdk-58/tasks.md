# Tasks

## 1. Android levels

- [x] 1.1 Test first (`scripts/build-config.test.js`): compile 37, target 36; then set them in `app.json`
- [x] 1.2 Test first (`scripts/doctor-android.test.js`): the check asks for `platforms;android-37` and `build-tools;37.0.0`; then update `scripts/doctor-android.js`

## 2. Packages

- [x] 2.1 Run `pnpm expo install expo@58.1.0 --fix`, pin every `~` range exactly, and remove the `minimumReleaseAgeExclude` entry and the `test-renderer` override from `pnpm-workspace.yaml`; verify `pnpm check:pins` and `expo install --check` pass
- [x] 2.2 Add `@react-native/jest-preset` 0.88.1 and bump `jest` 30.5.2, `@types/jest` 30.0.0, `@types/react` 19.3.3, and `expo-doctor` 1.21.9; verify one copy each of `react`, `react-native`, `test-renderer`, and `react-native-gesture-handler` (`pnpm why`)
- [x] 2.3 Run `pnpm typecheck`, `pnpm lint`, and `pnpm test`; fix what the upgrade breaks (Jest config, `jest.setup.js`, route-test waiting, types), with each fix shown by a test that failed first
- [x] 2.4 Verify the gesture tests in `swipe-card.test.tsx` and `screens/swipe/index.test.tsx` pass unchanged on gesture-handler 3.3.0

## 3. Docs

- [x] 3.1 Update `CLAUDE.md` (SDK 58, React Native 0.88, the v58 docs URL, the `test-renderer` note), `openspec/config.yaml`, and `openspec/ROADMAP.md` (gesture hook API as a later change)

## 4. Verify

- [x] 4.1 Run `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1 pnpm check`; verify every gate is green
- [x] 4.2 Run the Android `expo export` from `CLAUDE.md`; verify it bundles

## Workflow follow-up

- The user runs `scripts/setup-android.sh` (platform 37, build-tools 37.0.0), checks `pnpm doctor:android`, and builds a development build and a preview APK.
- Phone check in Expo Go 58 and on the preview APK:
  - The app opens.
  - Tapping the card flips it, and so does ↻.
  - Swiping both ways answers.
  - The example box shows the next sentence.
  - The round, batch, and the My words and Progress tabs work.
  - The release build doesn't crash, which checks R8.
