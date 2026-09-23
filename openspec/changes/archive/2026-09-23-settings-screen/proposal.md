## Why

The Settings tab is a placeholder, but the Swipe tab's summary and empty state already send people
there. It is where the username, the tutorial, the level, and the batch options are changed after
onboarding, where the data credits live, and where swiping progress can be reset.

## What Changes

- Settings tab (`src/screens/settings/`), a scrolling screen of section cards as in the design:
  - **Profile**: the username field; saves on blur or Enter when valid (2–20 characters), with the
    note "Saved on this phone" or "Use 2–20 characters".
  - **Tutorial**: "Show tutorial at start" switch; "View tutorial now ›" opens the tutorial.
  - **Level**: the four levels as radio rows.
  - **Batch**: "Include lower levels" (disabled for Full, "Not used with Full") and "Include known
    words" switches.
  - **About**: "Credits ›" opens a bottom sheet with the data credits; "Reset progress" asks for a
    second tap, then clears the swipe log only — every word becomes unknown; the username, tutorial,
    onboarding, level, and batch settings stay.
- Changing the level or a batch switch saves at once; resetting progress or changing those settings
  makes the Swipe tab deal a fresh batch when it is next shown.
- The tutorial reads the saved preferences when it opens, so it reflects changes made in Settings.

## Capabilities

### New Capabilities

- `settings`: the Settings tab, the credits sheet, and resetting swipe progress.

### Modified Capabilities

- `app-tabs`: Settings is no longer a placeholder.
- `onboarding`: the tutorial shows the current saved preferences.

## Impact

- New: `src/screens/settings/`, `src/components/{section,switch-row,credits-sheet}.tsx` (or similar),
  `src/app/(tabs)/deck-refresh.ts` context, `clearSwipes` in `src/storage/swipes.ts`.
- Changed: `src/app/(tabs)/settings.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/swipe.tsx`,
  `src/app/tutorial.tsx`, `src/theme/index.ts` (credit text and scrim colours).
