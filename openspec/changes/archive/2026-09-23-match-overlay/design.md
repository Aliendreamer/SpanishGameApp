## Context

Part 4 of the swipe deck, built autonomously (decisions reported at the end). Source:
`docs/design/swipe-game-ui/README.md` ("It's a match!" overlay) and the prototype's match markup.

## Goals / Non-Goals

**Goals:** the overlay as designed, triggered from the swipe log so it also covers words learned
across sessions.

**Non-Goals:** haptics or sound; a setting to turn the moment off.

## Decisions

- **`logSwipe` returns the word's previous latest direction** (insert, then read the row before it
  by id — no transaction, since expo-sqlite transactions share the one connection and overlapping
  saves would collide), so the route knows a match; `onAnswer` resolves to
  `true` for a match. The screen shows the overlay when it resolves, so the game never waits on it.
- **The overlay is a transparent `Modal`** rendered by the Swipe screen, so it covers the whole app
  including the tab bar; Android back closes it, and `accessibilityViewIsModal` keeps screen
  readers inside it. "Keep swiping" closes it; the next card is already in place
  underneath.
- **Entrance with Reanimated entering animations** — `FadeIn.duration(350)` on the backdrop and a
  `Keyframe` for the card (rotate 8° → −4°, scale 0.6 → 1, 500 ms,
  `Easing.bezier(.2, 1.4, .4, 1)`). No effects or shared values needed.
- **Card top line**: the article for nouns, otherwise the part of speech (as the prototype).
- **Light `PrimaryButton` variant** (`tone="light"`: cream background, rose text, pressed soft
  pink) rather than a one-off button.

## Risks / Trade-offs

- [Overlay after a failed save] → no match is reported when saving fails, so the overlay can't
  claim progress that wasn't stored.
