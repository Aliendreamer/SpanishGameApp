## 1. Data

- [x] 1.1 Failing test: `articleFor` rule; move it out of `deck.ts` (deck tests stay green)
- [x] 1.2 Failing tests: `getWordCounts`; `getWordList` by state, most recent first, row fields, search by lemma / article + lemma / English; implement `src/vocabulary/word-lists.ts`

## 2. Screen

- [x] 2.1 Failing tests: title, pills with counts, rows, CEFR chip, tab switch and search callbacks, the three empty texts; implement `src/screens/words/`

## 3. Route and verify

- [x] 3.1 Failing route tests: a word answered on Swipe appears first in Known on Words; switching to Still learning; search; wire the route with refresh on focus
- [x] 3.2 Gates and Android bundle

## 4. From review

- [x] 4.1 Search follows typing at a lower priority (`useDeferredValue`); counts load only when the tab is shown; the SQL article rule is built from `ARTICLES`
- [x] 4.2 Failing tests: counts leave out words the dictionary no longer has; `%` and `_` search literally
- [x] 4.3 The pills follow the loaded list, so one list's rows never show under the other's pill
