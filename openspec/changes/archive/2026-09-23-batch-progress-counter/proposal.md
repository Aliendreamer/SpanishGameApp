## Why

With one pass per batch, the header's "known / batch size" counter stops short of the total (e.g.
"72 / 100" at the end), which reads as unfinished. Agreed with the user: count cards answered, so a
batch ends at "100 / 100"; known versus still learning is on the summary.

## What Changes

- The Swipe header's counter and ring show cards answered (either direction) out of the batch size.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `swipe-deck`: the header counts answered cards.

## Impact

- Changed: `src/screens/swipe/index.tsx` and its tests.
