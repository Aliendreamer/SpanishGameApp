# Spec Delta

## MODIFIED Requirements

### Requirement: Target Android 16

The app SHALL target Android API level 36 and compile against API level 37, the level React Native
0.88 compiles against, both set explicitly in the app config.

#### Scenario: SDK levels in resolved config

- **WHEN** the resolved Expo config is inspected
- **THEN** the `expo-build-properties` plugin sets `android.compileSdkVersion` to 37 and
  `android.targetSdkVersion` to 36

### Requirement: Toolchain check

`pnpm doctor:android` SHALL report each toolchain prerequisite — JDK 17, `JAVA_HOME`,
`ANDROID_HOME`, `platform-tools`, `platforms;android-37`, `build-tools;37.0.0`, and
`ndk;27.1.12297006` — and exit non-zero when any is missing.

#### Scenario: Missing SDK package

- **WHEN** `build-tools;37.0.0` is not installed under `ANDROID_HOME`
- **THEN** the check marks it missing and exits non-zero

#### Scenario: Complete toolchain

- **WHEN** JDK 17, `JAVA_HOME`, `ANDROID_HOME`, and all required SDK packages are present
- **THEN** every item is marked present and the command exits 0
