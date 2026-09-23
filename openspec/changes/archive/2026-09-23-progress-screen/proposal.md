## Why

Progress is the last placeholder tab. The design shows a day streak, today's activity, and how
much of each level is known — all derivable from the swipe log the app already keeps.

## What Changes

- Progress tab (`src/screens/progress/`):
  - A rose streak card: the number of consecutive days with at least one swipe and "day streak";
    a Monday–Sunday row for the current week (filled for days with a swipe, outlined otherwise);
    "Today's done. See you tomorrow." or "Swipe one card today to keep your streak."
  - Tiles: "swipes today" and "words known".
  - "Known by level": A1–B2 rows with "{known} of {total}" and an 8 dp bar.
- Day rules: days are local to the phone; the streak counts back from today, or from yesterday
  while today has no swipe yet, so it doesn't reset each morning.
- The tab re-reads when shown. With this, all four tabs are built.

## Capabilities

### New Capabilities

- `progress-stats`: the Progress tab and the streak and level statistics.

### Modified Capabilities

- `app-tabs`: no placeholders remain.

## Impact

- New: `src/progress/stats.ts` (pure day and streak rules), `src/storage/progress-stats.ts`
  (queries), `src/screens/progress/`.
- Changed: `src/app/(tabs)/progress.tsx`, `src/theme/index.ts` (week outline colour). Removed:
  `src/screens/tab-placeholder/`.
