# Tasks

## 1. Storage

- [x] 1.1 Test first (`progress-db.test.ts`): migration 4 adds `batches` to a version 3 database and keeps settings and swipes; then add the migration, with its tests passing
- [x] 1.2 Test first (`batches.test.ts`): the deck key differs by level, lower levels, known words, and word type, and ignores lower levels for Full; saving replaces only that key's batch; then implement saving and reading in `src/storage/batches.ts`
- [x] 1.3 Test first: reading a batch gives its size, words learned, the current round, and the cards still to answer, from the swipe log, covering right swipes before the batch, a left after a right, and a word no longer in the dictionary; then implement
- [x] 1.4 Test first: starting a round keeps exactly the words not learned, in batch order, and survives reopening; then implement
- [x] 1.5 Test first (`swipes.test.ts`): `clearSwipes` also clears the saved batches and keeps the settings; then implement, deleting batches first

## 2. Dealing and round rules

- [x] 2.1 Test first (`deck.test.ts`): words load by key in the given order with meanings and example; then implement, sharing the lookup with `getDeck`
- [x] 2.2 Test first: loading the batch for some settings resumes the saved one, deals and saves one when there is none or none of its words are left, continues the batch number with known words on, and keeps the saved batch when nothing can be dealt; then implement
- [x] 2.3 Test first (`queue.test.ts`): a round counts answers, learned words over the batch, and the misses, starting from a resumed position too; then rework `queue.ts`

## 3. Texts and summary

- [x] 3.1 Test first (`strings.test.ts`, `how-it-works/index.test.tsx`): the new round, continue, learned, and swipe-left texts in English and Bulgarian, with the practise text gone; then update `en.ts` and `bg.ts`
- [x] 3.2 Test first (`summary.test.tsx`): "Round done" with "Continue with the {y} left" as the main button and "Next batch" second; "Batch learned!" with only "Next batch" and "Change settings"; a double tap runs an action once; then implement in `summary.tsx`

## 4. Swipe screen and route

- [x] 4.1 Test first (`screens/swipe/index.test.tsx`): starts part-way with the right header, opens on the summary for a finished round, continues with only the words left until the batch is learned, and waits for the last save before continuing; then implement in `index.tsx`
- [x] 4.2 Test first (route tests): a batch resumes after the app is rendered again and after changing the level and back; reset deals afresh; a failed round start shows the full-screen error; misses in this batch make no match after a restart; then wire `src/app/(tabs)/swipe.tsx`
- [x] 4.3 Update the session rule in `openspec/ROADMAP.md`; verify it matches the specs

## 5. Verify

- [x] 5.1 Run `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1 pnpm check` and the Android `expo export` from CLAUDE.md; verify both are green

## Workflow follow-up

- The user checks on a phone: answer some cards, force-close, reopen on the same card; finish a round and continue; change level and back.
