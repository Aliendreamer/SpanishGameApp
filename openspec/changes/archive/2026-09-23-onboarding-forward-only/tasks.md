## 1. Storage

- [x] 1.1 Failing test: `getUsername` returns the saved name, or null; implement

## 2. Shell and routes

- [x] 2.1 Failing test: `OnboardingShell` shows Back only when `showBack` is set; implement
- [x] 2.2 Failing route tests: no Back on Welcome, Username, Level; Get started skips Username when a name is saved; forward steps leave no history (even after a double tap); wire replace navigation and per-step Back in the layout

## 3. Double tap (from code review)

- [x] 3.1 Failing test: `singleFlight` ignores calls while an action runs and recovers after a failure; implement in `src/utils/single-flight.ts`
- [x] 3.2 `PrimaryButton` runs `onPress` through `singleFlight`; Welcome and Username return their async actions
