# Proposal

## Why

A tester suggested, as a later step, example sentences with the words, "or on the cards themselves",
and wondered how they would be generated. Nothing needs generating: the dictionary ships up to 3 real
Tatoeba sentences per word and the card back shows the first. The other two are never shown, and
browsing them has been on the roadmap since step 4.

Of the 4,061 A1–B2 words, 3,724 (92%) have a sentence and 3,442 (85%) have three; of the 15,110 words
without a level, 8,110 (54%) have one.

## What Changes

- The example box on the card back shows "1 / 3" and a "›" when the word has more than one sentence.
- Tapping the box shows the next sentence, returning to the first after the last. Tapping anywhere
  else on the card still flips it, and dragging from the box still swipes.
- Screen readers get a "Next example" action on the flipped card, in English and Bulgarian.

## Decided here, for the user to confirm

- The sentences go on the card, not on the My words tab.
- The tester has not yet said what she wants beyond the one sentence already shown; ask before
  building this.

## Non-goals

- Generating sentences for the words that have none, Bulgarian translations, sentences in My words,
  audio, and fill-in-the-gap exercises.

## Capabilities

### New Capabilities

### Modified Capabilities

- `swipe-deck`: each word carries up to 3 examples; the card back lets the user browse them.

## Impact

- `src/vocabulary/deck.ts` (`example` becomes `examples`), `src/screens/swipe/card.tsx`,
  `swipe-card.tsx`, `src/i18n/en.ts`, `src/i18n/bg.ts`, their tests, and `openspec/ROADMAP.md`.
- No dictionary rebuild, dependencies, or storage changes. Credits already cover Tatoeba.
- Build after `card-tap-fix` (it needs the separate tap gesture), and `learn-whole-series` and
  `deal-unlearned-words` (all change the "Deck of words" requirement; this delta is written on top).
