## 1. Setup

- [x] 1.1 Install and pin `@react-native-async-storage/async-storage`; add its Jest mock to `jest.setup.js`

## 2. Onboarding shell

- [x] 2.1 Failing test: `OnboardingShell` shows step dots, no Back on step 1, Back on step 2 calling `onBack`; implement
- [x] 2.2 Make Welcome content-only; move its route to `src/app/onboarding/index.tsx` under `_layout.tsx`; `/` redirects to `/onboarding`

## 3. Username

- [x] 3.1 Failing test: `saveUsername` stores the trimmed name under `username`; implement `src/storage/prefs.ts`
- [x] 3.2 Failing tests: Username content, counter, untouched vs touched error, Continue while invalid, valid submit via button and Enter; implement `src/screens/username/`
- [x] 3.3 Level placeholder screen and `/onboarding/level` route; remove the Username placeholder

## 4. Routes

- [x] 4.1 Failing route tests: Welcome → Username → save → Level; Back returns; a double tap keeps one Username in the stack; wire the routes
- [x] 4.2 Build the Android bundle with `expo export`
