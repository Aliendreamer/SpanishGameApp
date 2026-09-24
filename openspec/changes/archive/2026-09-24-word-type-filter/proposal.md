## Why

Requested by the user: practise one kind of word at a time — for example only verbs — or everything.
Every dictionary entry already has its part of speech, so the deck can filter on it.

## What Changes

- New game setting **word type**: All words (default), Nouns, Verbs, or Adjectives — the three
  large groups (11,084 / 2,940 / 4,195 words); the small groups are covered by All words.
- Settings: a WORD TYPE section with radio rows, under LEVEL; changing it saves at once and makes
  the Swipe tab deal a fresh batch.
- The deck deals only words of the chosen type, within the level and batch settings.
- The Swipe header's level line names the type when it isn't All words, e.g. "Beginner · A1, A2 ·
  Verbs".
- `progress.db` migration 3 adds the setting (existing installs start at All words).

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `progress-store`: game settings gain the word type.
- `swipe-deck`: the deck filters by word type; the level line shows it.
- `settings`: the WORD TYPE section.

## Impact

- Changed: `src/storage/progress-db.ts`, `src/vocabulary/deck.ts`, `src/vocabulary/levels.ts`,
  `src/screens/settings/index.tsx`, and their tests.
