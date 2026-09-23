# Roadmap

Android app (React Native + Expo + TypeScript): Tinder-style swipe cards for Spanish vocabulary.
Fully local on the phone — no backend, no accounts, no network at runtime.

Each step is its own OpenSpec change, approved and committed before the next starts.

1. **`app-skeleton`** — done (archived 2026-09-22).
2. **`android-builds`** — done (archived 2026-09-22).
3. **`vocabulary-import`** — done (archived 2026-09-23). Spanish → English only; CEFR is an
   optional input behind `--cefr` (without it, levels fall back to Doozan frequency bands).
   Data licence: vocabulary CC-BY-SA (Wiktionary via Doozan), example sentences CC-BY (Tatoeba).
   Ask the CEFR dataset author for a licence before any Play Store upload.
4. **`swipe-game-ui`** — done (2026-09-23), built from the Claude Design handoff in
   `docs/design/swipe-game-ui/` as separate changes: `welcome-screen`, `username-screen`,
   `onboarding-forward-only`, `level-screen`, `how-it-works-screen`, `swipe-card`, `swipe-gestures`,
   `game-rules`, `match-overlay`, `settings-screen`, `words-screen`, `progress-screen`. Streaks and
   statistics (listed as later below) came with the Progress tab.

Later: undo, English → Spanish, hints, topics, showing example sentences
(format and UI to be decided — e.g. browsing a word's up-to-3 sentences on the flipped card).

## Decisions agreed for step 4

- **Card:** Spanish lemma (with article for nouns); tap to reveal up to 3 English meanings and
  1 example. Swipe right = know it, left = don't; ✓/✗ buttons do the same.
- **Session:** batches of 100, one pass: every card is shown once (changed 2026-09-23 — re-queueing
  missed words ~4 cards later was too frequent and batches never finished). At the end: a summary
  with the choice of "Next batch" (words never swiped before) or "Practise the {n} still learning"
  (one pass over the batch's misses). "It's a match!" only for words missed before the current batch.
- **Known** = the word's most recent swipe was right. Every swipe is logged (word, direction, time).
- **Settings:** level Beginner (A1+A2) / Intermediate (B1) / Advanced (B2) / Full (everything,
  including no CEFR); "include lower levels" checkbox (n/a for Full); "include known words" toggle.
  No topic picker (sources have no topics).
- **Order:** CEFR level, then frequency rank ascending; no-CEFR words last.
- **Vocabulary DB:** ship `assets/vocabulary/vocabulary.db` as a bundled asset opened with
  `SQLiteProvider assetSource`; on launch, if its `metadata.dataset_version` differs from the
  installed copy, overwrite it (`forceOverwrite`). Progress lives in a separate `progress.db`, so
  dictionary updates never touch statistics.
- **Storage:** dictionary is read-only data; progress (swipe log, settings) in its own SQLite DB,
  keyed by `lemma|pos` so regenerating the dictionary keeps progress.
- **Errors:** bad data → full-screen error; failed swipe save → non-blocking banner; no matching
  words → empty state linking to Settings.
- **Credits screen** — attribution required by Doozan (Wiktionary CC-BY-SA, Tatoeba CC-BY).
  The CEFR dataset has no licence file ("free for personal and educational use") — check with the
  author before any Play Store release.
- No spaced repetition — refresh is the "include known words" toggle.
