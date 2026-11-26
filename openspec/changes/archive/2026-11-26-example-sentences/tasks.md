# Tasks

## 1. Data

- [x] 1.1 Test first (`deck.test.ts`): a word carries up to 3 examples in priority order, or none; then replace `example` with `examples` in `deck.ts` and update the test words that use it, with `pnpm typecheck` and the tests passing

## 2. Card

- [x] 2.1 Test first (`strings.test.ts`): "Next example" / "Следващ пример"; then add it to `en.ts` and `bg.ts`
- [x] 2.2 Test first (`card.test.tsx`): the back shows the chosen sentence with "2 / 3" and "›", shows neither for one sentence, and no box for none; then implement in `card.tsx`
- [x] 2.3 Test first (`swipe-card.test.tsx`): a tap on the box shows the next sentence, wraps after the last, keeps the place across flips, does not flip the card, and has no effect on the front; the "Next example" action is offered only on a flipped card with more than one sentence; then implement in `swipe-card.tsx`
- [x] 2.4 Test first (`screens/swipe/index.test.tsx`): the next card starts at its first sentence; verify it passes
- [x] 2.5 Update `openspec/ROADMAP.md` (example sentences done, and the card decision now 3 examples); verify it matches the specs

## 3. Verify

- [x] 3.1 Run `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1 pnpm check`; verify every gate is green

## Workflow follow-up

- The user checks on a phone: tapping the box changes the sentence without flipping, tapping elsewhere flips, and a drag starting on the box swipes.
