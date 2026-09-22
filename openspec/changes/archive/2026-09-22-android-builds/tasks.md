## 1. Repo preparation

- [x] 1.5 Add `~/.gradle` to `sandbox.filesystem.allowWrite` (Gradle cache for agent-run builds)
- [x] 1.1 Add `services.gradle.org`, `plugins.gradle.org`, `repo.maven.apache.org`, `dl.google.com`, `maven.google.com` to `sandbox.network.allowedDomains`
- [x] 1.2 Add `LICENSE` (MIT, © 2026 Aliendreamer)
- [x] 1.3 Add `credentials.json` and `credentials/**` to `.gitattributes` with the git-crypt filter; add `build/` to `.gitignore`
- [x] 1.4 Write the `.easignore` test first (credential paths excluded, `.gitignore` entries repeated) and see it fail; then add `.easignore` and see it pass

## 2. Toolchain

- [x] 2.1 Write tests for the doctor check function (complete toolchain passes; wrong Java, missing env var, missing SDK package each fail) and see them fail
- [x] 2.2 Implement `scripts/doctor-android.js` (pure check function + thin fact collector) and the `doctor:android` script; tests pass
- [x] 2.3 Write `scripts/setup-android.sh` (JDK 17 via apt, command-line tools, sdkmanager packages, licences; re-runnable; prints shell lines instead of editing them)
- [x] 2.4 USER: run `scripts/setup-android.sh`, add the printed lines to `~/.zshrc`, and confirm `pnpm doctor:android` is all ✓

## 3. App config

- [x] 3.1 Write the resolved-config test (compile/target SDK 36 via `expo-build-properties`, `expo-dev-client` present) and see it fail
- [x] 3.2 `pnpm expo install expo-dev-client expo-build-properties`, pin exact versions, add the plugin config to `app.json`; test passes; `pnpm start` is `expo start --tunnel --go` so it still opens in Expo Go, `pnpm start:dev` serves the dev build

## 4. EAS profiles and scripts

- [x] 4.1 Write the `eas.json` test (three profiles and their outputs) and the scripts test (`build:P`, `build:P:local`, `build:P:gradle` for each profile) and see them fail
- [x] 4.2 Add an `eas` script running pinned `eas-cli` via `pnpm dlx` (not a dependency — `expo-doctor` rejects that); write `eas.json` (`cli.appVersionSource: remote`, profiles per design); add the nine build scripts; tests pass
- [x] 4.3 USER: `pnpm eas login`, then `pnpm eas init` (writes `extra.eas.projectId` to `app.json`)

## 5. Gradle-only path

- [x] 5.1 Write tests for the signing plugin's `build.gradle` transform (adds signing config and release wiring; idempotent; untouched when already present) and see them fail
- [x] 5.2 Implement `plugins/with-release-signing.js` and register it in `app.json`; tests pass
- [x] 5.3 Write `scripts/build-gradle.sh <profile>` (prebuild --clean, the Gradle task per profile, `-P` signing values from `credentials.json` via `jq`, artifact copied to `build/`)
- [x] 5.4 Agent runs `pnpm build:development:gradle` (debug-signed, needs no credentials) until it produces an APK

- [x] 4.4 Pin the toolchain for EAS: `packageManager: pnpm@12.5.1`, `eas.json` `base` profile (pnpm 12.5.1, Node 24.12.0) extended by every profile, pnpm settings moved to `pnpm-workspace.yaml`, lockfile re-resolved under `minimumReleaseAge`; test first

- [x] 5.5 Review fixes: one fail-fast `jq` read of `credentials.json`; pass signing values as `ORG_GRADLE_PROJECT_*` env vars instead of `-P`; rebuild preview and re-verify its signature — production skipped at the user's request, same signing path (Expo's `AndroidConfig.EasBuild` script was tried instead and fails on Gradle 9.3)

## 6. Signing key

- [x] 6.1 USER: first cloud build `pnpm build:preview` — EAS generates the upload keystore
- [x] 6.2 USER: `pnpm eas credentials` → download the keystore (EAS saves it at its default path; the Gradle script reads the path from `credentials.json`) to `credentials/android/keystore.jks` and write `credentials.json`; confirm `git-crypt status -e` lists both

- [x] 6.3 Fix `.gitignore`: anchor `/android/` and `/ios/` and re-include `credentials/**/*.jks` so the encrypted key backup is committed; tests assert git keeps it and `.easignore` still excludes it

## 7. Verify

- [x] 7.1 Agent runs `pnpm build:preview:gradle` and `pnpm build:production:gradle`; APK and AAB land in `build/`; `apksigner`/`jarsigner` confirm the upload key signed them
- [x] 7.2 Run `pnpm build:preview:local` (EAS local on WSL) — not run: skipped at the user's request; path configured, unverified on WSL (Expo does not officially support it there)
- [x] 7.3 USER: install the preview APKs from the cloud, EAS local, and Gradle paths on the phone; each shows the SpanishGameApp screen — cloud APK installed and shows the screen; Gradle APK verified by signature (upload key, targetSdk 36), not installed; EAS local not built
- [x] 7.4 USER: install the development build; it connects to `pnpm start:dev` — not run: skipped at the user's request; `build/development.apk` built and debug-signed
- [x] 7.5 Update `CLAUDE.md` (build commands, toolchain, credentials handling) and `openspec/config.yaml` context
- [x] 7.6 `pnpm check` all green
