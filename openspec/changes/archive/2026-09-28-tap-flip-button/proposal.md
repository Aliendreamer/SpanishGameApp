## Why

On some phones (reported on a Nothing Phone (3a) Pro) tapping the card does not flip it. The card
counts a release as a tap only if the finger moved under 6 dp, which is stricter than Android's own
~8 dp touch slop, so an ordinary tap often reads as a tiny drag and springs back with nothing
happening. There is also no way to flip the card other than tapping it.

## What Changes

- Raise the tap tolerance from 6 dp to 12 dp, so a tap with slight finger movement flips the card.
  Answering still needs a 90 dp drag.
- Add a compact round ↻ flip button between "Still learning" and "I know it". It turns the card
  over either way; its accessibility label reads "Show meaning" on the front and "Show word" on the
  back (English and Bulgarian).
- The How it works / Tutorial first row reads "Tap the card or ↻" (Bulgarian: "Докосни картата или
  ↻"); its body and the card's "Tap to see the meaning" hint are unchanged.

## Capabilities

### New Capabilities

### Modified Capabilities

- `swipe-deck`: tap tolerance becomes 12 dp; a flip button joins the answer buttons.
- `onboarding`: the How it works first row mentions the flip button.

## Impact

- `src/screens/swipe/motion.ts` (`TAP_DISTANCE`), `swipe-card.tsx` (`SwipeCardHandle.flip`),
  `index.tsx` (third button), a small round-button component.
- `src/i18n/en.ts`, `src/i18n/bg.ts`: new flip labels, updated tutorial row title.
- Tests next to each file. No dependencies, no data or storage changes.
