# Proposal

## Why

With "include known words" off, a word swiped once is never dealt again, known or not. So once a level
has no new words, "Next batch" shows "No words match your settings" while words are still unlearned,
and words skipped with "Next batch" never return. The user agreed they should be shown.

## What Changes

- A batch deals new words first, then tops up with words still being learned at those settings, up to
  100. Only known words are left out.
- The empty state appears only when every word for the settings is known, and says so, in English and
  Bulgarian.
- Words missed before `learn-whole-series`, which nothing dealt again, come back this way too.
- "It's a match!" keeps its rule, so it now shows for each of these words that is learned: they were
  missed in an earlier batch.

## Non-goals

- Dealing still-learning words before new ones: "Next batch" would bring back the words just skipped.
- Any change with "include known words" on.

## Capabilities

### New Capabilities

### Modified Capabilities

- `swipe-deck`: which words are dealt, "Next batch", and the empty state.

## Impact

- `src/vocabulary/deck.ts` (`getDeck`), `src/i18n/en.ts`, `src/i18n/bg.ts`, their tests, the roadmap,
  and the `example-sentences` delta, which repeats the "Deck of words" requirement.
- No storage or dependency changes.
