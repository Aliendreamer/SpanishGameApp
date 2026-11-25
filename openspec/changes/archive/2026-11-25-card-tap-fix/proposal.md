# Proposal

## Why

A tester running the build with the ↻ button reports that tapping the card still does not flip it,
while ↻ and swiping both work. `tap-flip-button` raised the tap limit to 12 dp, but the limit was
not the cause: a finger that lifts without moving at all never reaches the code that checks it.

## What Changes

- A tap flips the card even when the finger does not move at all, and still does with up to 12 dp of
  drift.
- The card starts following the finger once it has moved 12 dp, and moves by the distance dragged
  from there. Answering still needs the card to move 90 dp.
- A drag that comes back to where it started no longer counts as a tap: the card springs back.

## Capabilities

### New Capabilities

### Modified Capabilities

- `swipe-deck`: "Swipe to answer" — what counts as a tap, and where a drag is measured from.

## Impact

- `src/screens/swipe/swipe-card.tsx` (gestures), `src/screens/swipe/motion.ts` (`releaseOutcome`
  loses its tap outcome), and their tests; `src/screens/swipe/index.test.tsx` taps.
- No dependencies, text, data, or storage changes. ↻ and the accessibility actions are unchanged.
