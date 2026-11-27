# Spec Delta

## MODIFIED Requirements

### Requirement: App runs in Expo Go on Android

The project SHALL be an Expo SDK 58 app with Expo Router and TypeScript that starts with the dev
server and opens in Expo Go on an Android device, showing a single placeholder screen with the app
title and no other features.

#### Scenario: Placeholder screen renders

- **WHEN** the index route is rendered
- **THEN** the screen shows the text "SpanishGameApp"

#### Scenario: Opens on the phone

- **WHEN** the developer runs `pnpm start` and opens the project in Expo Go for SDK 58 on Android
- **THEN** the placeholder screen appears without a red error screen
