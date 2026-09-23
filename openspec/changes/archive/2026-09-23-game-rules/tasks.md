## 1. Swipe log

- [x] 1.1 Failing tests: migration 2 adds `swipes` and keeps settings; `logSwipe` stores key, direction, time; `knownKeys` follows the latest swipe; implement
- [x] 1.2 Failing tests: `getDeck` leaves out known words unless `includeKnown`, and honours `offset`; implement

## 2. Queue

- [x] 2.1 Failing tests: queue reducer — right removes, left re-inserts at `min(3, rest)`, last-card case, summary numbers, done; implement `src/vocabulary/queue.ts`

## 3. Screens

- [x] 3.1 Failing tests: summary and empty-state components; implement
- [x] 3.2 Failing tests: Swipe screen uses the queue, reports answers, shows the summary, deals the next batch, shows the empty state and the save-failure banner; implement
- [x] 3.3 Swipe route logs swipes, deals batches (offset with known words), opens Settings

## 4. Routes and verify

- [x] 4.1 Failing route tests: an answer is logged; a finished batch shows the summary and Continue deals new words; settings buttons open the Settings tab
- [x] 4.2 Gates and Android bundle

## 5. From review

- [x] 5.1 One shared "known words" SQL (`KNOWN_KEYS`) for the deck and `knownKeys`
- [x] 5.2 Failing tests: `dealBatch` continues with known words and starts over after the level's last batch; the route uses it
