## Context

The card uses one `Gesture.Pan()` with `minDistance(0)` for both drags and taps: on release,
`releaseOutcome` returns `'tap'` when the finger moved under `TAP_DISTANCE` (6 dp). The answer
buttons call the card's imperative handle (`SwipeCardHandle.answer`). The flip state (`flipped`,
`turn`) lives inside `SwipeCard`.

## Goals / Non-Goals

**Goals:** taps flip reliably on phones where fingers drift a few dp; a button that flips the card
regardless of touch handling.

**Non-Goals:** reworking the gesture into separate Tap + Pan gestures; changing swipe thresholds,
animations, or the card faces.

## Decisions

- **Raise `TAP_DISTANCE` to 12 dp** rather than composing a separate `Gesture.Tap()`. It is a
  one-constant change that keeps the tested release logic; 12 dp sits above Android's touch slop
  and far below the 90 dp commit distance, so no drag that answers could be misread as a tap.
- **`SwipeCardHandle.flip()`** next to `answer()`: the flip state stays in the card, the screen's
  button calls it like the answer buttons do. It is ignored once the card is leaving.
- **The screen learns which face shows** (for the button's accessibility label) through an
  `onFlip(flipped)` callback from the card, stored as the turn whose card is flipped: a new card
  (new turn) reads as front-up without any reset.
- **A compact round button**: an `icon` option on `SecondaryButton` (58 dp circle in the same
  outline, ↻ glyph, label kept as its accessibility name), between the two answer buttons, which
  keep `flex: 1`. Three text buttons would not fit a narrow phone with the Bulgarian labels.
- **Not now: a separate `Gesture.Tap()` raced with the Pan.** It would hand tap detection to the
  native recognizer (platform touch slop, no hand-tuned constant), but means reworking the gesture
  tests; revisit if taps still fail on the device after this change.

## Risks / Trade-offs

- [The 6 dp limit may not be the only cause on the Nothing Phone (3a) Pro] → the flip button works
  regardless; the user retests taps on that phone, and a temporary release log in a dev build can
  confirm the distances if taps still fail.
- [A very slow 10 dp drag now flips instead of springing back] → acceptable; it would have answered
  nothing either way.
