## 1. Storage and launch decision

- [x] 1.1 Failing tests: launch prefs defaults, `setOnboardingDone`, `saveShowTutorial`, round-trip; implement in `src/storage/prefs.ts`
- [x] 1.2 Failing tests: `launchTarget` for the three cases; implement in `src/launch/`

## 2. Components

- [x] 2.1 Failing test: `Checkbox` shows its state, toggles, and can be disabled; implement; Level uses it
- [x] 2.2 `StepHeading` supports an optional greeting and body (test)

## 3. Screens

- [x] 3.1 Failing tests: How it works content, checkbox initial state and toggle, greeting in tutorial mode, `onStart` with the checkbox value; implement `src/screens/how-it-works/`
- [x] 3.2 Swipe placeholder screen and `/swipe` route; remove the How it works placeholder

## 4. Routes and launch

- [x] 4.1 Failing test: the root layout keeps the splash until launch flags load and provides them
- [x] 4.2 Failing route tests: `/` opens Welcome, Tutorial, or Swipe from the flags; finishing onboarding saves flags and lands on Swipe with no Back; Tutorial saves its checkbox and opens Swipe; wire the routes
- [x] 4.3 Build the Android bundle with `expo export`
