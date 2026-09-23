## 1. Tool skeleton

- [x] 1.1 Create `tools/vocabulary-import/` with `sources.json` (pinned Doozan + CEFR commits and file list) and `src/index.ts`; add `vocab:build` script; make Jest, TypeScript, ESLint cover `tools/`; confirm Node runs `.ts` directly
- [x] 1.2 Write the shared types (`Entry`, `Meaning`, `Example`, report shapes) and a tiny fixture set under `tools/vocabulary-import/fixtures/` (a few `frequency.csv` rows, `es-en.data` entries incl. multi-POS/gender/qualifiers, `sentences.tsv` rows, CEFR JSON)

## 2. Parsers (test-first)

- [x] 2.1 `normalize.ts`: tests for NFC, lowercase, trim, accents kept (`él`/`el`, `sí`/`si`), POS mapping; then implement
- [x] 2.2 `parse/frequency.ts`: tests for lemma, POS, count, forms from the usage column; then implement
- [x] 2.3 `parse/dictionary.ts`: tests for entries with several `pos:` blocks, `g:` gender, `gloss:` + `q:`, `_gloss` sub-glosses; then implement
- [x] 2.4 `parse/sentences.ts`: tests for columns, attribution, proficiency, lemma tags (`:v,tengas|tener`, multi-word, `phrase-*`); then implement
- [x] 2.5 `parse/cefr.ts`: tests for the four level files; then implement

## 3. Pipeline stages (test-first)

- [x] 3.1 `merge.ts`: tests for word selection (prop/none excluded, no-meaning words dropped and counted), meanings (obsolete/archaic dropped, other qualifiers kept in `qualifier`, `[…]` stripped, dedupe, max 5), gender, frequency + rank, forms; then implement
- [x] 3.2 `cefr.ts`: tests for single match, no match, conflicting levels → null + listed, `--cefr` off → all null; then implement
- [x] 3.3 `examples.ts`: tests for tag matching by lemma + POS, shortest-first, proficiency tie-break, max 3; then implement
- [x] 3.4 `validate.ts`: tests that each error fails and each warning only reports; then implement
- [x] 3.5 `diff.ts`: tests for added / removed keys vs a previous dataset (and none); then implement

## 4. Output (test-first)

- [x] 4.1 `output/sqlite.ts` with `node:sqlite`: tests read back schema, rows, `metadata`, and that `dataset_version` is stable for identical entries and changes when entries change; then implement
- [x] 4.2 `output/json.ts`, `output/report.ts` (stats JSON, `IMPORT_REPORT.md`, `DATA-LICENSE.md`): tests; then implement
- [x] 4.3 `download.ts`: fetch pinned files into a temp dir; tests with an injected fetch (no network) including a failed download

## 5. CLI and safety (test-first)

- [x] 5.1 End-to-end test on fixtures: full run writes all five files; a run with a validation error exits non-zero and leaves an existing output dir byte-for-byte unchanged; the temp download dir is gone in both cases
- [x] 5.2 Implement `index.ts` (`--cefr` flag, temp dirs, `finally` cleanup, move-into-place only on success, per-stage progress lines with counts and durations on stderr, summary on stdout); test that each stage reports progress

## 5b. Review fixes

- [x] 5.3 Simplification review: parallel streamed downloads, `util.parseArgs` (strict), shared formatter, one drop-reason table, `keep()` returns its reason, `writeOutputs` extracted, push instead of spread in the parser. Kept `VACUUM` (removing it grew the db 12.6 → 14.5 MB). Skipped: reading cross-references from `meta:` templates — the words that need it (su, muy, lo) have plain `{{head|…}}` metas; the relation only exists in gloss text
- [x] 5.4 Code review, all test-first: word-form list additions agree with the part of speech the word is filed under (removed ~1,000 false entries like son "tone"); `;` split only outside parentheses/quotes and per-part English kept; nested parentheses; `{{…}}` markup dropped; bare cross-references resolve within the same part of speech; `al` → to the; CEFR matched on learner label with pronoun/determiner as one class; examples sorted once; hash and stats computed once; `swapInto` restores the old output if the swap fails; temp dirs created inside `try` and removed on Ctrl-C; staging dirs gitignored; cross-reference warning in the report

## 6. First dataset

- [x] 6.1 Run `pnpm vocab:build --cefr`; review `IMPORT_REPORT.md` with the user (counts, CEFR stats, samples such as `casa`, `comer`, `llevar`, `él`/`el`)
- [x] 6.2 Adjust rules only if the review shows a problem; rerun — review found: `frequency.csv` omits/folds very common words (*no*, *iglesia*, *muy*, *su*, *mamá*) → union with `es_merged_50k.txt` (test-first; *Iglesia*-as-proper-noun regression test); Wiktionary cross-reference glosses (*su*, *me*, *lo*, *los*, *tu*) → `cleanGloss` rules + bare cross-reference resolution (0.1% left); `WITHOUT ROWID` tables (18.8 → 12.6 MB); output dir permissions 0755; monotonic stage timer; `|` escaped in the report table. CEFR list found unreliable (48 of the top 300 words at B1/B2) — recorded for the user, levels stored as given
- [x] 6.3 Exclude generated `assets/vocabulary/*.{json,md}` from Prettier and cspell; update `CLAUDE.md` (command, sources, outputs) and `openspec/config.yaml` context
- [x] 6.4 `pnpm check` all green
