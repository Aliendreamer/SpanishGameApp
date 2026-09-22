## Why

The app only runs inside Expo Go. Step 2 of `openspec/ROADMAP.md` makes it a real Android app:
an installable build for the user's phone, a development build for when Expo Go is no longer
enough, and a Play Store bundle — buildable in the cloud and locally, including a path that keeps
working if EAS is dropped later. Google Play requires new apps to target Android 16 (API 36) from
31 August 2026.

## What Changes

- Three build profiles — `development` (APK with `expo-dev-client`), `preview` (release APK),
  `production` (AAB) — each buildable three ways: EAS cloud, `eas build --local`, and a Gradle-only
  path (`expo prebuild` + `./gradlew`) that needs no Expo account.
- Target and compile SDK pinned to 36 via `expo-build-properties`.
- WSL2 toolchain: a re-runnable setup script (JDK 17, Android command-line tools, platform 36,
  build-tools 36.0.0, NDK 27.1) and a `doctor:android` check.
- Signing: EAS-managed upload key, backed up in the repo under git-crypt (`credentials.json`,
  `credentials/android/keystore.jks`), used by both local paths; `.easignore` keeps it out of cloud
  uploads.
- A local config plugin that writes the release signing config into the generated Gradle project;
  the build script supplies the key through environment variables.
- `LICENSE` (MIT) for the code.
- Agent sandbox allows the Gradle download hosts so builds can be run and fixed by the agent.

Out of scope: uploading to the Play Store, store listing, CI, the vocabulary data licence notice
(step 3).

## Capabilities

### New Capabilities

- `android-build`: producing signed Android builds (development, preview, production) from EAS
  cloud, EAS local, and plain Gradle, with a verifiable toolchain and a recoverable signing key.

### Modified Capabilities

<!-- none -->

## Impact

- New: `eas.json`, `.easignore`, `LICENSE`, `plugins/with-release-signing.js`,
  `scripts/setup-android.sh`, `scripts/doctor-android.js`, `scripts/build-gradle.sh`, tests for
  config / eas.json / plugin / doctor.
- New encrypted files (added by the user after the first cloud build): `credentials.json`,
  `credentials/android/keystore.jks`.
- `app.json`: `expo-build-properties` and `expo-dev-client` plugins; `extra.eas.projectId` after
  `eas init`.
- Dependencies: `expo-dev-client`, `expo-build-properties`; `eas-cli` pinned and run through `pnpm dlx`
  (not a project dependency).
- `.gitattributes` (git-crypt for credentials), `.claude/settings.json` (sandbox domains),
  `CLAUDE.md` (build commands).
- Machine setup outside the repo: JDK 17 and `~/Android/Sdk` in WSL2.
