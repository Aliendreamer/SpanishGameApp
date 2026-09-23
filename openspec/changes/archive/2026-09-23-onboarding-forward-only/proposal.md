## Why

Feedback after trying Username on the phone: someone who already has a username should not be
asked again, and onboarding should not lead back to Welcome or Username once left — the name can
be changed later in Settings.

## What Changes

- "Get started" skips the Username step when a username is already saved and goes to Level.
- Welcome, Username, and Level show no "Back"; "Back" appears from step 4 (How it works) on, to
  the previous step.
- Moving forward from Welcome and Username replaces the current screen instead of pushing it, so
  neither the Back link nor Android's system back returns to them.
- `src/storage/prefs.ts` gains `getUsername()`.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `onboarding`: Welcome's "Get started" branches on a saved username; Back moves to step 4 on;
  forward navigation from the first two steps is one-way.

## Impact

- Changed: `src/app/onboarding/_layout.tsx`, `src/app/onboarding/index.tsx`,
  `src/app/onboarding/username.tsx`, `src/screens/onboarding-shell/` (Back shown by a prop, not by
  step index), `src/storage/prefs.ts`, and their tests.
