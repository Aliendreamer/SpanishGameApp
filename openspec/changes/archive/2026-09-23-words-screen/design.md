## Context

From `docs/design/swipe-game-ui/README.md` ("Words tab") and the prototype's `tabWords` block.
Agreed with the user: lists are ordered most recently swiped first.

## Goals / Non-Goals

**Goals:** accurate lists straight from the swipe log; fast search over the dictionary text; fresh
data each time the tab is shown.

**Non-Goals:** opening a word's detail; editing a word's state from the list.

## Decisions

- **One query per list** (`getWordList(db, state, query)`): latest swipe per key
  (`LATEST_SWIPES`) filtered by direction, joined to `vocab.vocabulary`, ordered by the latest
  swipe `id` descending (most recent first). Meanings are the word's top 3 translations joined by
  ", " (a correlated `group_concat` over `vocab.translations` ordered by priority).
- **Counts** (`getWordCounts(db)`) come from one grouped query over the latest swipes, so the pill
  numbers ignore the search.
- **Search**: `LIKE '%query%'` on the lemma, on article + lemma (so "la casa" finds casa), and on
  any English meaning (`EXISTS` over translations). SQLite `LIKE` is case-insensitive for ASCII;
  accented letters must be typed as they are ("él").
- **Refresh on focus**: the route re-reads counts and the list with Expo Router's
  `useFocusEffect`, and whenever the tab or search changes. A stale response (the user typed on)
  is dropped.
- **Article helper** `articleFor(partOfSpeech, gender)` shared by `getDeck` and the lists.
- **FlatList** with the design's 8 dp row gap; the empty text replaces the list when it is empty.

## Risks / Trade-offs

- [Search cost on large lists] → the lists are bounded by the swipe log (words the user answered),
  not the 19k-word dictionary.
