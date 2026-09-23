# Roadmap

Android app (React Native + Expo + TypeScript): Tinder-style swipe cards for Spanish vocabulary.
Fully local on the phone — no backend, no accounts, no network at runtime.

Each step is its own OpenSpec change, approved and committed before the next starts.

1. **`app-skeleton`** — done (archived 2026-09-22).
2. **`android-builds`** — done (archived 2026-09-22).
3. **`vocabulary-import`** — `tools/vocabulary-import` (`pnpm vocab:build [--cefr]`): downloads pinned
   Doozan files (+ CEFR when enabled) to a temp dir, builds `assets/vocabulary/vocabulary.db`
   (+ review JSON, stats, report with key diff, data licence), replaces committed output only on
   success, always deletes the downloads. ~17–18k lemmas (frequency list words with translations),
   up to 5 meanings, forms, CEFR by lemma+POS (ambiguous → none), up to 3 Tatoeba example
   sentences per word in their own table (parsed now, not shown by the app yet).
   - Spanish → English only.
   - CEFR is an **optional input behind a switch**: without it, levels fall back to Doozan
     frequency bands, so the app never depends on the unlicensed CEFR dataset.
   - Data licence notice: vocabulary CC-BY-SA (Wiktionary via Doozan), example sentences CC-BY
     (Tatoeba) with per-sentence attribution. Ask the CEFR dataset author for a licence before any
     Play Store upload.
4. **`swipe-game-ui`** — design and implement the game UI (see decisions below).

Later: undo, streaks, statistics, English → Spanish, hints, topics, showing example sentences
(format and UI to be decided — e.g. browsing a word's up-to-3 sentences on the flipped card).

## Decisions agreed for step 4

- **Card:** Spanish lemma (with article for nouns); tap to reveal up to 3 English meanings and
  1 example. Swipe right = know it, left = don't; ✓/✗ buttons do the same.
- **Session:** batches of 100. Right removes the card, left re-queues it ~4 cards later. At the end
  of a batch: summary + "Continue?" deals the next 100 with the same settings.
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
