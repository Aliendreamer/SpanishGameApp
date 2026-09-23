## Context

Part 2 of the swipe deck, built autonomously (decisions reported at the end). Source:
`docs/design/swipe-game-ui/README.md` ("Interactions & Behavior": swipe gesture, commit animation,
flip, buttons) and the prototype's pointer handlers.

## Goals / Non-Goals

**Goals:** the design's drag, stamps, fly-out, and flip, on the UI thread; answers still reported
to the screen through one callback.

**Non-Goals:** the queue rules and the swipe log (part 3); haptics; the next card animating in.

## Decisions

- **Pure drag rules in `motion.ts`** (`releaseOutcome(dx)`, `stampOpacities(dx)`, `dragRotation(dx)`,
  constants), marked as worklets so the gesture uses the same code the unit tests cover.
- **`SwipeCard` owns the gesture and animation**: a `Gesture.Pan()` updates a `dx` shared value; on
  release it springs back, flips (tap), or flies out and then calls `onAnswer(knowIt)` on the JS
  thread. Taps go through the same Pan (under 6 dp), as in the design, rather than a separate Tap
  gesture that could race it.
- **Buttons fly the card out too**: `SwipeCard` exposes `answer(knowIt)` through a ref
  (`useImperativeHandle`), so the screen's buttons trigger the same animation. While a fly-out
  runs, further answers are ignored.
- **The screen keys `SwipeCard` by the word**, so each card mounts fresh: front-side up, centred —
  no reset logic.
- **Flip** is two absolutely positioned faces with `backfaceVisibility: 'hidden'` and `rotateY`
  driven by a timed shared value (450 ms, `Easing.bezier(.3, .7, .3, 1)`); perspective 1400.
- **Timings** from the design: spring back 300 ms `Easing.bezier(.2, .7, .3, 1)`; fly-out 300 ms;
  the next card is shown when the fly-out ends (the design's 280 ms delay is covered by the
  fly-out itself).
- **Tests**: unit tests for `motion.ts`; component tests drive the Pan with Gesture Handler's
  `fireGestureHandler` and check the outcome (flip, answer, spring back). Reanimated's Jest setup
  finishes timed animations immediately, so callbacks run synchronously in tests.

## Risks / Trade-offs

- [Gestures only verifiable on a device] → rules unit-tested; the feel needs a phone check.
