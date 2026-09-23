## Why

Trying the game on the phone: a "Still learning" card coming back 4 cards later is too frequent, a
batch can't end until every word is known (so 100 cards can take far longer), and the match overlay
fires constantly because of it. Agreed with the user: no re-queueing; one pass per batch; then a
choice.

## What Changes

- **One pass**: every card of a batch is shown once; "Still learning" no longer puts it back. A
  batch ends after its last card.
- **End-of-batch choice**: the summary reads "You know {x} of {n} words in this batch." with tiles
  "known" and "still learning", and offers "Next batch", "Practise the {y} still learning" (a new
  one-pass round of just those words, when there are any), and "Change settings".
- **Next batch deals new words only**: without "include known words", words already swiped (known
  or still learning) are left out; still-learning words come back through the practise round and
  stay listed on the Words tab. With "include known words" the review behaviour is unchanged.
- **Matches** need the word's earlier "Still learning" to come from before the current batch, so a
  practise round doesn't turn every correct answer into "It's a match!".
- The roadmap's session rule is updated.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `swipe-deck`: deck exclusion, batch queue, batch summary, and the match rule.

## Impact

- Changed: `src/vocabulary/queue.ts`, `src/vocabulary/deck.ts`, `src/storage/swipes.ts`
  (`logSwipe` returns the previous swipe's direction and time), `src/screens/swipe/`
  (`index.tsx`, `summary.tsx`), `src/app/(tabs)/swipe.tsx`, `openspec/ROADMAP.md`.
