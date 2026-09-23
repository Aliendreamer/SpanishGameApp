## Why

Username is onboarding step 2 in the design (`docs/design/swipe-game-ui/`). With a second step,
the onboarding layout (top row, step dots, Back, padding) should live in one place, so the dots
persist and animate between steps instead of being rebuilt by each screen.

## What Changes

- Onboarding route group: `src/app/onboarding/_layout.tsx` wraps every step in a shared shell
  (safe area, 16/24/24 padding, 36 dp top row with step dots and "Back" from step 2). Welcome
  moves to `/onboarding` (step 1); `/` redirects there.
- Username screen (`/onboarding/username`, step 2): title, body, a 20-character text field that
  opens focused, an error line and "n / 20" counter, and a "Continue" button dimmed until the
  name is valid. The error shows once the field is touched (typed in, or Continue pressed while
  invalid), as in the prototype.
- The username (trimmed, 2–20 characters) is saved to AsyncStorage on Continue, through a small
  `src/storage/prefs.ts` module that later onboarding and tutorial flags reuse.
- Continue opens a placeholder Level route (`/onboarding/level`, step 3); the Username placeholder
  is removed.
- Forward navigation keeps one copy of each step in the stack, so a double tap can't push a step
  twice.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `onboarding`: Welcome moves under the onboarding group; the Username placeholder requirement is
  replaced by the Username step, and a Level placeholder is added.

## Impact

- New dependency (pinned): `@react-native-async-storage/async-storage`.
- New: `src/app/onboarding/_layout.tsx`, `src/app/onboarding/index.tsx`,
  `src/app/onboarding/level.tsx`, `src/screens/onboarding-shell/`, `src/screens/username/`,
  `src/screens/level-placeholder/`, `src/storage/prefs.ts`.
- Changed: `src/app/index.tsx` (redirect), `src/screens/welcome/` (content only; the shell owns
  the top row), `jest.setup.js` (AsyncStorage mock). Removed: `src/screens/username-placeholder/`.
