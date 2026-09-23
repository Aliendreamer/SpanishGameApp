## Context

Part 1 of the swipe deck, built autonomously at the user's request (decisions below are mine and
reported at the end). Sources: `docs/design/swipe-game-ui/README.md` ("App shell", "Swipe tab"),
the prototype's `tabSwipe` block, and the roadmap's storage decisions.

## Goals / Non-Goals

**Goals:** real words on screen, matching the design's card and header; one database connection
the later parts can join words and swipes on.

**Non-Goals:** gestures and animations (part 2); swipe log, re-queueing, filters by known words,
summary, empty state, error banner (part 3); the match overlay (part 4); the other tabs' content.

## Decisions

- **Attach, don't open a second connection.** `SQLiteProvider` gives one connection; expo-sqlite's
  `useSQLiteContext` only sees the nearest provider. `initDatabase(db)` runs `migrate(db)` then
  `attachVocabulary(db, …)`: `ATTACH` `<database dir>/vocabulary.db AS vocab`, read
  `vocab.metadata.dataset_version`; if it isn't the bundled version (from
  `vocabulary-stats.json`'s `datasetVersion`, generated with the database) or can't be read,
  `DETACH`, copy the asset with `importDatabaseFromAssetAsync(…, { forceOverwrite: true })`, and
  `ATTACH` again. Queries then read `vocab.vocabulary` and, in part 3, join `main.swipes`.
- **`attachVocabulary` takes its dependencies** (path, bundled version, importer) so tests run it
  against Node SQLite with temp copies of the real `vocabulary.db`. The `require()` of the `.db`
  asset lives in `src/storage/vocabulary-asset.ts`, stubbed in Jest by a `moduleNameMapper` entry.
- **Deck query** (`getDeck(db, settings)`): levels per `LEVELS` (Beginner A1+A2; Intermediate B1;
  Advanced B2; Full everything); "include lower levels" adds the levels below; `ORDER BY cefr IS
  NULL, cefr, frequency_rank LIMIT 100` (uses the `(cefr, frequency_rank)` index). Meanings and
  the first example are fetched for the batch's keys in two follow-up queries.
- **Article** from gender for nouns: `m` → "el", `f` → "la", `m/f` → "el/la"; none otherwise.
  Known gap: feminine nouns with a stressed initial *a* take "el" ("el agua"); the data doesn't
  mark stress, so these show "la" for now.
- **Meaning size on the card back** (the design's 36/800 is sized for short sample words; real
  meanings run to hundreds of characters): 36 when the longest shown meaning is ≤ 16 characters,
  28 when ≤ 30, else 22; each meaning is capped at 3 lines with an ellipsis.
- **Lemma size on the front**: 72, or 54 above 9 characters (per the design), shrinking further to
  fit one line for very long words (`adjustsFontSizeToFit`).
- **Header level line** as in the prototype: "Beginner · A1, A2"; with lower levels included,
  "Intermediate · A1, A2, B1"; "Full" alone.
- **Username for the header** is read from storage on the Swipe tab (the launch context is read
  once at startup and is stale right after onboarding).
- **Tabs**: Expo Router `Tabs` with a custom text-only `TabBar` (pills per the design), in a
  `(tabs)` group so URLs stay `/swipe`, `/words`, `/progress`, `/settings`.
- **Progress ring** with `react-native-svg`: a 38 dp ring, `#EFBCCD` track and a rose arc.
- **Flip without animation for now** (part 2 adds the 3D flip): a tap shows the other face.

## Risks / Trade-offs

- [Copying 12 MB on first launch] → once per dataset version; the splash covers it.
- [Deck query cost] → indexed ordering, `LIMIT 100`, two small follow-up queries.
