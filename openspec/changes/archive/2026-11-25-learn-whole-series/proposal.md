# Proposal

## Why

A tester asked to carry on with the same 100 words where she stopped, and to keep going round them
until all 100 are learned before getting new ones. Today the batch lives only in memory: restarting
the app or changing a setting deals 100 other words, and because swiped words are left out, the ones
she missed never come back unless "include known words" is on.

## What Changes

- **Saved batch**: the batch and the place in it survive closing the app.
- **Rounds until learned**: after a pass, the next round is the batch's words not learned yet, and so
  on until none are left. A card still never comes back within a round, as agreed in
  `single-pass-batches`.
- **End-of-round choice**: "Continue with the {n} left" becomes the main button and "Next batch" a
  secondary one, so a few stubborn words never block the user. When every word is learned the screen
  says so and "Next batch" is the main button.
- **One saved batch per choice of level, lower levels, known words, and word type**: trying Verbs and
  coming back does not lose the batch. Today every such change deals a new one.
- **Reset progress** also forgets the saved batches.
- The How it works swipe-left text matches the new rounds, in English and Bulgarian.

## Decided here, for the user to confirm

- Leaving words behind is allowed ("Next batch" before all are learned). Words left behind stay in
  My words and, as today, are dealt again only with "include known words".
- "It's a match!" keeps its rule: misses from the same batch never make a match. With "include known
  words" off, matches therefore stay as rare as they are now.

## Non-goals

- A "new 100" button in the middle of a round, reshuffling between rounds, spaced repetition, and
  recovering words missed before this version (no record exists of which batch they were in).

## Capabilities

### New Capabilities

### Modified Capabilities

- `swipe-deck`: saved batch, rounds, header, end-of-round screen, deck order across batches, match.
- `progress-store`: the saved batches, including migration.
- `settings`: a settings change resumes that choice's batch; reset also clears saved batches.
- `onboarding`: the How it works swipe-left row.

## Impact

- `src/storage/progress-db.ts` (migration 4), new `src/storage/batches.ts`, `src/storage/swipes.ts`
  (`clearSwipes`), `src/vocabulary/deck.ts`, `src/vocabulary/queue.ts`, `src/screens/swipe/`
  (`index.tsx`, `summary.tsx`), `src/app/(tabs)/swipe.tsx`, `src/i18n/en.ts`, `src/i18n/bg.ts`,
  `openspec/ROADMAP.md` (session rule).
- No new dependencies. Existing settings and swipes are kept.
