## Why

The UI is being built screen by screen from the Claude Design handoff (now in
`docs/design/swipe-game-ui/`). Welcome is the first screen of the flow. It also needs the base
every later screen uses: the colour and spacing tokens, the Bricolage Grotesque font, and the
shared button and step-dot components.

## What Changes

- Theme tokens from the handoff (colours, radii, spacing, font families) in `src/theme/`.
- Bricolage Grotesque (400–800) loaded with `expo-font`; the splash screen stays up until the
  fonts are ready. Splash background becomes rose `#D6457A`; the app is light-only.
- Shared components: `PrimaryButton` (pill, pressed state) and `StepDots` (4 onboarding dots,
  active dot widens over 300 ms with Reanimated).
- Welcome screen (`src/screens/welcome/`): stacked hero cards with "hola", title, body, and
  "Get started" pinned to the bottom.
- Routing: Welcome is the start route; "Get started" opens a placeholder
  `/onboarding/username` route. The old Home screen is removed. First-launch detection comes with
  the change that stores `onboardingDone`.
- The design handoff moves to `docs/design/swipe-game-ui/`, committed, and excluded from
  Prettier and ESLint (it is generated prototype code).

## Capabilities

### New Capabilities

- `app-theme`: shared design tokens, fonts, and base components every screen uses.
- `onboarding`: the first-launch flow; this change adds the Welcome step.

### Modified Capabilities

<!-- none -->

## Impact

- New dependencies (pinned): `expo-font`, `@expo-google-fonts/bricolage-grotesque`,
  `react-native-reanimated` (and `react-native-worklets` if the SDK requires it).
- Changed: `app.json` (splash colour, `userInterfaceStyle`), `src/app/`, `.prettierignore`,
  `eslint.config.js`. Removed: `src/screens/home/`.
