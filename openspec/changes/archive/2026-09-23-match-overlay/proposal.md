## Why

Part 4 of 4 of the swipe deck: the design's reward moment. When a word the user was still learning
is finally answered "I know it", the app celebrates it with "It's a match!".

## What Changes

- Saving a swipe also reports the word's previous swipe; a right answer whose previous swipe was
  left (in this batch or any earlier session) is a match.
- "It's a match!" overlay over the Swipe tab: rose full screen, the title, "You were still learning
  this one. Now you know it.", a cream card with the article (or part of speech), the lemma, and the
  meanings, and a "Keep swiping" button that closes it. It fades in (350 ms) while the card springs
  from 8° / 60% to −4° / 100% (500 ms, overshoot).
- `PrimaryButton` gains a light variant (cream with rose text) for use on rose backgrounds.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `swipe-deck`: the match overlay.
- `app-theme`: the primary button's light variant.

## Impact

- New: `src/screens/swipe/match.tsx`.
- Changed: `src/storage/swipes.ts` (`logSwipe` returns the previous direction),
  `src/screens/swipe/index.tsx`, `src/app/(tabs)/swipe.tsx`, `src/components/primary-button.tsx`,
  `src/theme/index.ts` (match card shadow).
