## Why

Part 3 of 4 of the swipe deck: the game rules from the roadmap. Answers must be remembered — that
is what makes a word "known" and keeps known words out of later batches — and a batch should end
with a summary, not just "Batch done".

## What Changes

- Swipe log: every answer is stored in `progress.db` (`swipes`: word key, direction, time), keyed
  by `lemma|pos` so dictionary updates keep it. A word is known when its latest swipe is right.
- Batches leave out known words unless "include known words" is on; with it on, "Continue" deals
  the next 100 words rather than the same ones.
- Queue rules: "I know it" removes the card; "Still learning" puts it back about 4 cards later
  (position `min(3, remaining)`); the batch ends when every card is known.
- Batch summary: "Batch done", "You know all {n} words in this batch.", tiles "{x} known on the
  first swipe" and "{y} took a few tries", "Continue with the next batch", "Change settings".
- Empty state when no words match: "No words match your settings", its explanation, and "Open
  settings".
- A failed swipe save shows a non-blocking banner; the game carries on.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `swipe-deck`: batches exclude known words; queue rules; summary; empty state; save-failure
  banner.
- `progress-store`: the swipe log.

## Impact

- New: `src/vocabulary/queue.ts` (pure batch reducer), `src/storage/swipes.ts`,
  `src/screens/swipe/summary.tsx`, `src/screens/swipe/empty.tsx`.
- Changed: `src/storage/progress-db.ts` (migration 2), `src/vocabulary/deck.ts` (known filter,
  offset), `src/screens/swipe/index.tsx`, `src/app/(tabs)/swipe.tsx`.
