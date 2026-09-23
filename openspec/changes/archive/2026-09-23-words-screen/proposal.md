## Why

The Words tab is a placeholder. The design's "My words" lets people see what they know and what
they are still learning, and find a word by Spanish or English.

## What Changes

- Words tab (`src/screens/words/`): title "My words"; pills "Known · n" and "Still learning · n";
  a "Search Spanish or English" field; a list of rows (word with article, meanings on one shortened
  line, CEFR chip); empty texts per case.
- A word is known or still learning by its latest swipe; lists are ordered by that swipe, most
  recent first, and read from `progress.db` + the attached dictionary in SQL (the known list can
  grow to thousands), shown in a virtualised list.
- The tab re-reads when it is shown, so words just swiped appear.
- The article rule moves to one shared helper used by the deck and the word lists.

## Capabilities

### New Capabilities

- `word-lists`: the Words tab — known and still-learning lists, counts, and search.

### Modified Capabilities

- `app-tabs`: Words is no longer a placeholder.

## Impact

- New: `src/vocabulary/word-lists.ts`, `src/screens/words/`.
- Changed: `src/app/(tabs)/words.tsx`, `src/vocabulary/deck.ts` (shared article helper).
