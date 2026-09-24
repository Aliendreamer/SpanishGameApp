## Context

User request after the tabs were finished; choice (b) agreed: All words / Nouns / Verbs /
Adjectives. The dictionary's `part_of_speech` column already holds `noun`, `verb`, `adjective`.

## Goals / Non-Goals

**Goals:** one more game setting that shapes the deck, stored and applied like the others.

**Non-Goals:** onboarding (the default fits everyone; Settings is where it changes); per-type counts
by level; the small parts of speech as their own choices.

## Decisions

- **Stored in the settings row** (`word_type TEXT NOT NULL DEFAULT 'all' CHECK (word_type IN
  ('all', 'noun', 'verb', 'adjective'))`) via migration 3, so upgrades keep the other settings and
  start at All words. `Settings.wordType`, saved per column like the rest.
- **Filter in `getDeck`**: `part_of_speech = ?` added to the conditions unless `all`; it composes
  with the level bands, the known filter, and `dealBatch`'s offsets unchanged.
- **Word types as data** (`WORD_TYPES` in `src/vocabulary/levels.ts`): id, label, plural for the
  level line, and a detail line with the word count from `vocabulary-stats.json` (not hardcoded).
- **Settings section** reuses `Section` + `RadioRow`; `onSettingsChange({ wordType })` already
  saves and invalidates the deck.
- **Level line**: `levelLine` appends " · Verbs" etc. for a specific type.

## Risks / Trade-offs

- [A level with few words of a type, e.g. Beginner adjectives, runs out sooner] → the existing
  empty state explains and links to Settings.
