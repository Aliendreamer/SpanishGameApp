## 1. Setup

- [x] 1.1 Move `design_handoff_swipe_game_ui/` to `docs/design/swipe-game-ui/`; ignore it in Prettier and ESLint
- [x] 1.2 Install and pin `expo-font`, `@expo-google-fonts/bricolage-grotesque`, `react-native-reanimated` (+ `react-native-worklets` if required)

## 2. Theme and app config

- [x] 2.1 Failing test: theme tokens match the handoff; implement `src/theme/`
- [x] 2.2 Failing test: app config is light-only with splash `#D6457A`; update `app.json`
- [x] 2.3 Failing test: root layout renders nothing until fonts load; implement font loading and splash hold

## 3. Components

- [x] 3.1 Failing test: `PrimaryButton` shows its label and calls `onPress`; implement
- [x] 3.2 Failing test: `StepDots` marks the active dot; implement with Reanimated width animation

## 4. Screens and routes

- [x] 4.1 Failing test: Welcome shows title, body, "hola" card, and calls `onGetStarted`; implement `src/screens/welcome/`
- [x] 4.2 Failing test: username placeholder text; implement screen and `/onboarding/username` route; wire Welcome's route
- [x] 4.3 Remove `src/screens/home/`
