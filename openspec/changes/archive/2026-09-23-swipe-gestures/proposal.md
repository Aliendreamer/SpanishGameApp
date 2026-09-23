## Why

Part 2 of 4 of the swipe deck: the card should feel like the design — drag to answer, see which
answer a drag means, and flip in 3D — instead of the tap-and-buttons-only card from part 1.

## What Changes

- Drag: the card follows the finger (translate by the drag, rotate by drag / 20 degrees).
  Releasing past 90 dp answers ("I know it" right, "Still learning" left); a release under 6 dp is a
  tap and flips the card; anything else springs back over 300 ms.
- Stamps: "I know it" (olive, top-left) and "Still learning" (ink, top-right) fade in with the drag
  distance (full at 90 dp).
- Answering flies the card out (±560 dp, ±24°, 300 ms) before the next card appears; the buttons
  run the same fly-out.
- Flip: a 3D rotation (rotateY 0↔180°, 450 ms) between the two faces; a new card starts front-side
  up.
- The app root gets `GestureHandlerRootView`.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `swipe-deck`: answering by swipe, the stamps, the fly-out, and the animated flip.

## Impact

- New dependency (pinned): `react-native-gesture-handler`.
- New: `src/screens/swipe/swipe-card.tsx` (gesture, animation), `src/screens/swipe/motion.ts`
  (pure drag rules).
- Changed: `src/screens/swipe/index.tsx`, `src/app/_layout.tsx`, `jest.setup.js`.
