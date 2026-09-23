## Why

The game needs vocabulary. Step 3 of `openspec/ROADMAP.md` builds it from open data, as planned in
`VOCABLARIRY_SOURCES.md`, into a SQLite file the app can ship and open directly — reproducibly, and
without ever shipping or re-processing the raw sources in the app.

## What Changes

- New tool `tools/vocabulary-import`, run with `pnpm vocab:build [--cefr]`:
  - downloads the needed Doozan files (and, with `--cefr`, the Spanish CEFR lists) at pinned
    commits into a temp directory, and always deletes them afterwards;
  - parses, normalises (accents kept), merges, validates, and ranks lemmas;
  - writes `vocabulary.db`, `vocabulary.json` (review only), `vocabulary-stats.json`,
    `IMPORT_REPORT.md` (with a key diff against the previous dataset), and `DATA-LICENSE.md`;
  - replaces the committed files in `assets/vocabulary/` only when the whole run succeeds.
- Dataset: every frequency-list lemma with an English translation (~17–18k), proper nouns
  excluded; up to 5 learner-appropriate meanings; gender; frequency and rank; forms; CEFR level
  matched by lemma + part of speech (ambiguous or unmatched → no level); up to 3 Tatoeba example
  sentences per word in their own table, with attribution.
- Stable key `lemma|pos` for every word, plus a `metadata` table with dataset version and source
  commits — so the app can replace the dictionary on update without touching user progress.
- First generated dataset committed.

Out of scope: any app code (step 4), showing example sentences, English → Spanish, C1/C2.

## Capabilities

### New Capabilities

- `vocabulary-import`: generating the app's vocabulary database from pinned open-data sources,
  with validation, reporting, licensing, and safe replacement of the committed output.

### Modified Capabilities

<!-- none -->

## Impact

- New: `tools/vocabulary-import/` (TypeScript run directly by Node 24, tests colocated),
  `tools/vocabulary-import/sources.json` (pinned commits), `assets/vocabulary/` (generated, committed).
- `package.json`: `vocab:build` script. No new dependencies — SQLite via Node's built-in
  `node:sqlite` (fallback: `better-sqlite3` if it proves unworkable).
- Config: Jest and TypeScript cover `tools/`; `.prettierignore` / cspell ignore generated output.
- Network at build time only: `raw.githubusercontent.com` (already allowed).
