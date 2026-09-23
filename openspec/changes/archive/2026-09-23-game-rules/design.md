## Context

Part 3 of the swipe deck, built autonomously (decisions reported at the end). Sources: roadmap
"Decisions agreed for step 4" (batches, re-queue, known, swipe log, errors) and
`docs/design/swipe-game-ui/README.md` (queue rules, batch summary, empty state).

## Goals / Non-Goals

**Goals:** the roadmap's rules, with the swipe log as the single source of "known"; pure,
testable batch logic.

**Non-Goals:** the match overlay (part 4); the Settings tab (its buttons navigate to the
placeholder); re-dealing when settings change (with the Settings tab).

## Decisions

- **Migration 2 adds `swipes`** (`id INTEGER PRIMARY KEY`, `key TEXT`, `direction TEXT CHECK IN
  ('right','left')`, `at INTEGER` epoch ms) with an index on `(key, id)`. Append-only: known /
  learning is derived, never stored, so the log stays the one truth.
- **Latest swipe per key** via SQLite's bare-column rule: `SELECT key, direction, max(id) FROM
  swipes GROUP BY key` returns each key's latest direction. `getDeck` excludes keys whose latest
  direction is `right` unless `includeKnown`.
- **Next batch with "include known words" on**: nothing is excluded, so the same 100 would come
  back; `dealBatch` walks down the level by batch number (`getDeck` offset) and starts over after
  the last word, so review mode never ends on a misleading empty state. With it off, every batch
  starts from the top — answered words drop out by themselves.
- **Queue as a pure reducer** (`src/vocabulary/queue.ts`): state `{ queue, size, known, retried }`;
  `answer(state, knowIt)`; a left answer re-inserts the word at `min(3, rest.length)`. Summary
  numbers: first try = `size - retried.size`; a few tries = `retried.size`. The screen keeps it in
  state and starts a new one with each deal.
- **Logging happens in the route**, not the screen: the screen calls `onAnswer(word, knowIt)`; the
  route writes the swipe and reports failure back, which shows the banner ("Couldn't save your
  last answer.") until the next save succeeds. The game never
  waits on or undoes a swipe because of storage.
- **"Change settings" / "Open settings"** navigate to the Settings tab (a placeholder for now).

## Risks / Trade-offs

- [Swipe log growth] → one small row per answer; indexed by key.
- [Offset batches with "include known words" can skip words the user answered left in an earlier
  batch] → acceptable for review mode; unanswered order is still level then frequency.

## Follow-ups (from review)

- Settings tab: when the saved settings change, the Swipe tab must re-deal (it reads them once on
  mount today, which is harmless while Settings is a placeholder).
