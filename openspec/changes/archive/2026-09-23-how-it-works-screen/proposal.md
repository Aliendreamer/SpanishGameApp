## Why

How it works is the last onboarding step and, on later launches, the optional tutorial. Finishing
it is what makes onboarding "done", so this is also where the app starts deciding what to open at
launch — otherwise every launch would start at Welcome again.

## What Changes

- How it works screen (`src/screens/how-it-works/`): title, three explanation rows (tap, swipe
  right, swipe left), a "Show this screen when the app starts" checkbox (on by default), and
  "Start swiping". In tutorial mode it also shows "Hola, {username}" above the title.
- Onboarding step 4 (`/onboarding/how-it-works`) uses it; "Start swiping" saves the checkbox,
  marks onboarding done, and opens the Swipe screen.
- Tutorial (`/tutorial`): the same screen outside onboarding — no step dots, no Back — shown at
  launch when the checkbox is on; "Start swiping" saves the checkbox and opens Swipe.
- Launch routing at `/`: onboarding not done → Welcome; done and tutorial on → Tutorial;
  otherwise → Swipe. The root layout reads the flags before hiding the splash.
- Swipe placeholder route (`/swipe`) until the deck is built.
- `onboardingDone` and `showTutorial` stored in AsyncStorage next to the username.
- A shared `Checkbox` component, used by Level and How it works.

## Capabilities

### New Capabilities

- `launch-routing`: deciding the first screen from the stored onboarding and tutorial flags.

### Modified Capabilities

- `onboarding`: Welcome opens only while onboarding isn't done; the How it works placeholder is
  replaced by the How it works step and the launch tutorial; a Swipe placeholder is added.

## Impact

- New: `src/screens/how-it-works/`, `src/screens/swipe-placeholder/`, `src/components/checkbox.tsx`,
  `src/launch/`, `src/app/tutorial.tsx`, `src/app/swipe.tsx`.
- Changed: `src/app/_layout.tsx` (loads launch flags), `src/app/index.tsx`,
  `src/app/onboarding/how-it-works.tsx`, `src/storage/prefs.ts`, `src/screens/level/` (uses
  `Checkbox`). Removed: `src/screens/how-it-works-placeholder/`.
