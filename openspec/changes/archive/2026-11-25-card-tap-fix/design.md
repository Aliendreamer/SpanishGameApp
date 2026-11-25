# Design

## Context

See proposal.md for motivation. The card uses one `Gesture.Pan().minDistance(0)` and decides between
tap, drag, and answer in `onEnd`.

Cause, read from the react-native-gesture-handler 2.32.0 source (the pinned version):

- Android `PanGestureHandler.onHandle`: a touch-down only begins the gesture; it activates on a
  later *move* event. On touch-up, a gesture that is not active calls `fail()`.
- `useAnimatedGesture.ts`: `onEnd` runs only when the previous state was ACTIVE. A gesture that goes
  from BEGAN to FAILED runs `onFinalize` only.

So a touch with no move event between down and up never reaches `onEnd`, and the card does not
flip. Phones that report tiny movements during a tap do flip, which is why it worked elsewhere. The
tests missed it because `fireGestureHandler` always passed an ACTIVE event.

This is established from the source, not yet observed on the affected phone.

## Goals / Non-Goals

**Goals:** tap detection that does not depend on the finger moving.

**Non-Goals:** changing the commit distance, animations, stamps, card faces, or the ↻ button.

## Decisions

- **`Gesture.Race(pan, tap)`** with `Gesture.Pan().minDistance(TAP_DISTANCE)` and
  `Gesture.Tap().maxDistance(TAP_DISTANCE)`. One constant splits the two: under 12 dp only the tap
  can succeed, past it only the pan. The native tap recognizer ends on touch-up, with or without
  move events. `tap.onEnd` flips only when `success` is true.
  - *Handle it in the pan's `onFinalize`*: rejected; it can't tell a still tap from a touch the
    system took away.
  - *Activate the pan by hand on touch-down*: rejected; it takes every touch at once and keeps the
    hand-written tap detection that failed here.
- **`maxDuration(60_000)`** on the tap: the library default is 500 ms, and today a slow press flips
  too. A minute is in effect no limit.
- **`releaseOutcome(dx)`** returns `know`, `learn`, or `back`. Its tap outcome and `dy` argument go.
- **Drag distance is measured from where the drag starts.** The pan resets its origin on activation
  (`resetProgress`), so the card does not jump 12 dp; the finger travels about 102 dp to answer
  where it travelled 90. The card itself still moves 90.
- **Test ids**: the pan keeps `swipe-card`; the tap gets `swipe-card-tap`.

## Risks / Trade-offs

- [Jest cannot reproduce the native state machine] → tests cover the callbacks and that both
  gestures share `TAP_DISTANCE`; the fix counts as confirmed only after a tap works on the tester's
  phone.
- [Answering needs slightly more finger travel] → small next to 90 dp; if it feels heavy on the
  phone, lower `COMMIT_DISTANCE` in a follow-up.
