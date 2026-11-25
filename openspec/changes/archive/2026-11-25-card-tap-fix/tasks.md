# Tasks

## 1. Gestures

- [x] 1.1 Test first (`motion.test.ts`): `releaseOutcome` gives `know`, `learn`, or `back` and never `tap`, even at 0 dp; then drop the tap outcome and `dy` from `motion.ts`, with its tests passing
- [x] 1.2 Test first (`swipe-card.test.tsx`): a successful `swipe-card-tap` flips the card and reports it, a failed or cancelled one does not, a tap after the card is leaving does nothing, and a pan released near its start springs back without flipping; then race `Gesture.Tap()` with the pan in `swipe-card.tsx`, with its tests passing
- [x] 1.3 Test first: the pan's minimum distance and the tap's maximum distance are both `TAP_DISTANCE`; verify the test fails with `minDistance(0)` and passes with the fix
- [x] 1.4 Move the Swipe screen's tap tests (`index.test.tsx`) to the tap gesture; verify `pnpm test -- src/screens/swipe` passes

## 2. Verify

- [x] 2.1 Run `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1 pnpm check`; verify every gate is green

## Workflow follow-up

- The user checks on a phone, the tester's if possible: a still tap flips the card, a swipe answers, a short drag springs back.
