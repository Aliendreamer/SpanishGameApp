## Why

Part 1 of 4 of the swipe deck (roadmap step 4): the app's main screen. After onboarding the user
should land on a tab bar with the Swipe tab showing real words from the bundled dictionary — the
card front, a tap to see the back, and the two answer buttons.

## What Changes

- Bundled dictionary: `vocabulary.db` is copied from the app bundle into the app's database
  directory when missing or when its `dataset_version` differs from the bundled one, and attached
  to the `progress.db` connection as `vocab` at startup.
- Deck query: up to 100 words for the saved level settings, ordered by CEFR level then frequency
  rank (words without a level last), each with its article, level, part of speech, up to 3
  meanings, and the first example sentence.
- Tab shell: a bottom tab bar (Swipe · Words · Progress · Settings, text-only pills); Words,
  Progress, and Settings are placeholders.
- Swipe tab: header (level line, "Hola, {username}", "known / batch" with a progress ring), the
  card front (level, article, lemma, "Tap to see the meaning"), the card back (article + lemma,
  part-of-speech chip, meanings, example), a next-card hint, and "Still learning" / "I know it"
  buttons that move to the next card. When the batch runs out, a simple "Batch done" message
  (part 3 builds the real summary and rules).

## Capabilities

### New Capabilities

- `swipe-deck`: the Swipe tab — dictionary access, the deck of words, the card, and the answer
  buttons.
- `app-tabs`: the bottom tab bar and the tab routes.

### Modified Capabilities

- `progress-store`: startup also attaches the bundled dictionary.
- `onboarding`: the Swipe placeholder is replaced by the Swipe tab.

## Impact

- New dependency (pinned): `react-native-svg` (progress ring). New `metro.config.js` (bundles
  `.db` assets).
- New: `src/storage/vocabulary-db.ts`, `src/vocabulary/deck.ts`, `src/components/tab-bar.tsx`,
  `src/components/progress-ring.tsx`, `src/screens/swipe/`, `src/screens/tab-placeholder/`,
  `src/app/(tabs)/`.
- Changed: `src/app/_layout.tsx` (database init), test helpers in `scripts/node-sqlite-db.js`.
  Removed: `src/app/swipe.tsx`, `src/screens/swipe-placeholder/`.
