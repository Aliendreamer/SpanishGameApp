# Tasks

## 1. Dealing

- [x] 1.1 Test first (`deck.test.ts`, `batch.test.ts`): known words are left out; still-learning words come after every new word, top up a short batch, and make a batch alone; known words on is unchanged; then change `getDeck`, with its tests passing
- [x] 1.2 Test first (route test): with every word swiped and one still learning, the Swipe tab shows that word; with every word known, the empty state; verify both pass

## 2. Texts and docs

- [x] 2.1 Test first (`summary.test.tsx`): the new empty-state texts in English and Bulgarian; then update `en.ts` and `bg.ts`
- [x] 2.2 Update the roadmap's session rule and the `example-sentences` delta's "Deck of words"; verify `openspec validate --strict` passes for both changes

## 3. Verify

- [x] 3.1 Run `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1 pnpm check`; verify every gate is green
