# android-build Specification

## Purpose
Signed Android builds (development, preview, production) from EAS cloud, EAS local, and plain
Gradle, targeting API 36, with a verifiable toolchain and a recoverable signing key.
## Requirements
### Requirement: Build profiles

`eas.json` SHALL define `development`, `preview`, and `production` build profiles producing, for
Android, a development-client APK, a release APK, and an auto-incremented app bundle respectively.

#### Scenario: Profile outputs

- **WHEN** `eas.json` is read
- **THEN** `development` has `developmentClient: true` and `android.buildType: "apk"`, `preview`
  has `android.buildType: "apk"`, and `production` has `android.buildType: "app-bundle"` and
  `autoIncrement: true`

### Requirement: Target Android 16

The app SHALL compile against and target Android API level 36, set explicitly in the app config.

#### Scenario: SDK levels in resolved config

- **WHEN** the resolved Expo config is inspected
- **THEN** the `expo-build-properties` plugin sets `android.compileSdkVersion` and
  `android.targetSdkVersion` to 36

### Requirement: Three build paths

Every profile SHALL be buildable through EAS cloud, `eas build --local`, and a Gradle-only path that
does not require an Expo account.

#### Scenario: Scripts exist for every path

- **WHEN** `package.json` scripts are read
- **THEN** for each profile `P` there are `build:P`, `build:P:local`, and `build:P:gradle`

#### Scenario: Gradle-only preview build

- **WHEN** `pnpm build:preview:gradle` runs on a machine that passes `pnpm doctor:android`, with
  the credentials files present
- **THEN** a release-signed APK is written to `build/` without contacting EAS

### Requirement: Release signing survives prebuild

The Gradle-only path SHALL sign release builds with the upload key from `credentials.json` after
every prebuild, without passing passwords as arguments or environment variables, and SHALL leave
debug builds on the debug key.

#### Scenario: Release build signed with the upload key

- **WHEN** `pnpm build:preview:gradle` or `pnpm build:production:gradle` runs with valid credentials
- **THEN** the artifact's signing certificate matches the certificate in the upload keystore

#### Scenario: Debug build keeps the debug key

- **WHEN** `pnpm build:development:gradle` runs
- **THEN** the APK is signed with the Android debug certificate

#### Scenario: Incomplete credentials fail fast

- **WHEN** a release profile is built and a keystore field in `credentials.json` is missing or empty
- **THEN** the script exits non-zero before prebuild or Gradle run

### Requirement: Signing key recoverable and never uploaded

The upload keystore and its `credentials.json` SHALL be stored in the repo only in git-crypt
encrypted form and SHALL be excluded from EAS cloud uploads.

#### Scenario: Encrypted in git

- **WHEN** `git-crypt status` runs after the credentials are added
- **THEN** `credentials.json` and `credentials/android/keystore.jks` are listed as encrypted

#### Scenario: Excluded from cloud uploads

- **WHEN** `.easignore` is read
- **THEN** it excludes `credentials.json` and `credentials/`

### Requirement: Toolchain check

`pnpm doctor:android` SHALL report each toolchain prerequisite and exit non-zero when any is
missing.

#### Scenario: Missing SDK package

- **WHEN** `build-tools;36.0.0` is not installed under `ANDROID_HOME`
- **THEN** the check marks it missing and exits non-zero

#### Scenario: Complete toolchain

- **WHEN** JDK 17, `JAVA_HOME`, `ANDROID_HOME`, and all required SDK packages are present
- **THEN** every item is marked present and the command exits 0

