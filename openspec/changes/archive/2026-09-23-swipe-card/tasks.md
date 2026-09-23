## 1. Dictionary

- [x] 1.1 Test helpers: temp copies of the real `vocabulary.db` with a chosen version; Jest stub for `.db` assets
- [x] 1.2 Failing tests: `attachVocabulary` copies when missing or outdated and attaches without copying when current; implement `src/storage/vocabulary-db.ts`; root layout runs `initDatabase`
- [x] 1.3 Failing tests: `getDeck` filters and orders by level settings and returns article, meanings, example; implement `src/vocabulary/deck.ts`
- [x] 1.4 Failing test: level line text; implement

## 2. Components

- [x] 2.1 Failing tests: `TabBar` shows four tabs, marks the active one, reports presses; implement
- [x] 2.2 `ProgressRing` (react-native-svg) renders the ring with an accessible value

## 3. Swipe tab

- [x] 3.1 Failing tests: card front and back content, meaning size by length
- [x] 3.2 Failing tests: Swipe screen header, tap to flip, answer buttons advance and count, next-card hint, "Batch done"; implement `src/screens/swipe/`
- [x] 3.3 Tabs routes (`src/app/(tabs)/`), placeholders for Words, Progress, Settings; Swipe route loads settings, username, and deck

## 4. Routes and bundle

- [x] 4.1 Failing route tests: finishing onboarding lands on the Swipe tab with a card; switching tabs; wire it
- [x] 4.2 Build the Android bundle with `expo export`

## 5. From review

- [x] 5.1 Theme tokens for the card shadow, frame and bar radii; drop redundant backgrounds
- [x] 5.2 Failing test: a failed deck load shows the full-screen error; catch it in the Swipe route
