## Why

"Pick your level" is onboarding step 3 in the design. Its choices are game settings, which the
roadmap keeps in the app's own SQLite database, `progress.db`, beside the swipe log to come — so
this step also sets that database up.

## What Changes

- `progress.db` (expo-sqlite), opened once by the root layout with versioned migrations; the first
  migration creates a one-row `settings` table: `level` (default `beginner`), `include_lower`
  (default on), `include_known` (default off).
- Level list (`src/vocabulary/levels.ts`): Beginner (A1 + A2), Intermediate (B1), Advanced (B2),
  Full (everything), with word counts computed from `assets/vocabulary/vocabulary-stats.json`.
- Level screen (`/onboarding/level`, step 3): title, body, four radio cards, an "Include lower
  levels" checkbox (disabled at 40% for Full), and Continue, as in the design. It opens on the
  saved settings and saves the choice on Continue.
- Continue pushes a placeholder How it works step (`/onboarding/how-it-works`, step 4), whose Back
  returns to Level. The Level placeholder is removed.

## Capabilities

### New Capabilities

- `progress-store`: the app's `progress.db` — opening, migrations, and game settings.

### Modified Capabilities

- `onboarding`: the Level placeholder is replaced by the Level step; a How it works placeholder is
  added.

## Impact

- New dependency (pinned): `expo-sqlite`.
- New: `src/storage/progress-db.ts`, `src/vocabulary/levels.ts`, `src/screens/level/`,
  `src/screens/how-it-works-placeholder/`, `src/app/onboarding/how-it-works.tsx`, a Node SQLite
  test adapter.
- Changed: `src/app/_layout.tsx` (database provider), `src/app/onboarding/level.tsx`.
  Removed: `src/screens/level-placeholder/`.
