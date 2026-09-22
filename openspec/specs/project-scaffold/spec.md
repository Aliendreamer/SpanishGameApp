# project-scaffold Specification

## Purpose
The Expo app project itself: it runs in Expo Go on Android, follows the agreed folder layout, and
exposes quality gates that pass on a clean checkout.
## Requirements
### Requirement: App runs in Expo Go on Android

The project SHALL be an Expo SDK 57 app with Expo Router and TypeScript that starts with the dev
server and opens in Expo Go on an Android device, showing a single placeholder screen with the app
title and no other features.

#### Scenario: Placeholder screen renders

- **WHEN** the index route is rendered
- **THEN** the screen shows the text "SpanishGameApp"

#### Scenario: Opens on the phone

- **WHEN** the developer runs `pnpm start` and opens the project in Expo Go on Android
- **THEN** the placeholder screen appears without a red error screen

### Requirement: Android-only configuration

The app config SHALL target Android only and SHALL NOT contain iOS or web configuration.

#### Scenario: Platforms restricted

- **WHEN** `app.json` is read
- **THEN** `expo.platforms` is `["android"]` and `expo.android.package` is set

### Requirement: Folder layout

App code SHALL live under `src/`, with `src/app` containing only route files, and sibling folders
`components`, `screens`, `hooks`, and `utils`. Imports SHALL use the `@/*` alias for `src/*`.

#### Scenario: Routes-only app folder

- **WHEN** the files in `src/app` are listed
- **THEN** every file is an Expo Router route or layout — no components, helpers, or tests

#### Scenario: Alias resolves

- **WHEN** a test imports `@/screens/home`
- **THEN** the import resolves to `src/screens/home/index.tsx`

### Requirement: Quality gates

`package.json` SHALL define `typecheck`, `lint`, `format:check`, `test`, `check:pins`,
`expo:doctor`, and `check` scripts, where `check` runs all the others and fails if any of them
fails.

#### Scenario: Clean checkout passes

- **WHEN** `pnpm install` then `pnpm check` run on a clean checkout
- **THEN** every gate passes and the command exits 0

#### Scenario: A failing gate fails the check

- **WHEN** a type error is introduced into a file under `src/`
- **THEN** `pnpm check` exits non-zero

### Requirement: Exact dependency versions

Every dependency and devDependency in `package.json` SHALL be an exact version, and the lockfile
and Node version SHALL be committed.

#### Scenario: No version ranges

- **WHEN** `package.json` dependencies are inspected
- **THEN** no version contains `^`, `~`, a range, a wildcard, or `latest`

#### Scenario: New installs stay exact

- **WHEN** a package is added with `pnpm add`
- **THEN** it is written to `package.json` with an exact version

#### Scenario: A range fails the check

- **WHEN** a dependency with a range (for example one written by `pnpm expo install`) is in
  `package.json`
- **THEN** `pnpm check:pins` exits non-zero and names the dependency

