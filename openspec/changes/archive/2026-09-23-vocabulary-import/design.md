## Context

Sources (`VOCABLARIRY_SOURCES.md`): Doozan `spanish_data` (CC-BY-4.0 repo; Wiktionary CC-BY-SA,
FrequencyWords CC-BY-SA, Tatoeba CC-BY) and the community CEFR dataset (no licence file; "free for
personal and educational use"). Pinned commits: Doozan `43c5aa2bdfc11c04b3ee44ea69e0a29957c1346a`
(2026-09-03), CEFR `9bbb7aa6739d6ea87eeadaa47e7ea9babc2b002a` (2026-07-13).

Files used (all at the pinned Doozan commit):

| File | Size | Gives |
|---|---|---|
| `frequency.csv` | 2.7 MB | 25,028 lemmas: count, POS, forms with counts (`15403031:la\|3687944:las`) |
| `es_merged_50k.txt` | 0.7 MB | 50,025 word forms with counts (`no\t13845008`) |
| `es-en.data` | 18 MB | 115k entries: per word, `pos:` blocks with `g:` gender and `gloss:` lines (+ `q:` qualifiers) |
| `sentences.tsv` | 42 MB | EN, ES, attribution, EN/ES proficiency, lemma tags (`:v,tengas\|tener`) |
| CEFR `vocab_json/es-{A1,A2,B1,B2}.json` | small | `lemma`, `pos`, `cefr_level` (definitions empty for Spanish) |

`es_allforms.csv` (73 MB) is not needed: forms come from `frequency.csv`.

## Goals / Non-Goals

**Goals:** reproducible dataset from pinned sources; lemma-centred entries with stable keys;
honest CEFR enrichment; validation that fails loudly; a report that makes data quality and
dataset changes visible; never leaving the repo with half-written output.

**Non-Goals:** app code; showing sentences; English → Spanish; C1/C2; AI or heuristic level
guessing; conjugation generation.

## Decisions

**Tool shape.** `tools/vocabulary-import/` in TypeScript, run directly by Node 24 (type
stripping) — no build step, no new dependencies. One module per stage, each a pure function with
colocated tests; `index.ts` wires them and owns all I/O:

```text
tools/vocabulary-import/
  sources.json          pinned commits + file list
  src/download.ts       fetch pinned files into a temp dir
  src/parse/frequency.ts, parse/dictionary.ts, parse/sentences.ts, parse/cefr.ts
  src/normalize.ts      NFC, lowercase, trim; accents kept; POS mapping
  src/merge.ts          frequency × dictionary → entries; meanings; gender; forms
  src/cefr.ts           lemma+POS matching + match report
  src/examples.ts       sentence selection
  src/validate.ts       errors vs warnings
  src/diff.ts           key diff vs previous vocabulary.json
  src/output/sqlite.ts, output/json.ts, output/report.ts
  src/index.ts          CLI: pnpm vocab:build [--cefr]
```

**Word list.** Union of two lists, ranked together by count:

1. every `frequency.csv` lemma whose POS maps to a learner label — excluding `prop` (proper
   nouns), `none` (no dictionary POS), and letters/prefixes;
2. every `es_merged_50k.txt` word form that is itself a dictionary entry and not already kept. If
   `frequency.csv` files the word as a form of a kept lemma, it is added only as **that lemma's part
   of speech** (*mamá* under *papá* → noun; *te* under *tú* → pronoun, not "letter: t"; *son* under
   *ser* has only a verb-form entry → skipped). Otherwise the first entry that is vocabulary and has a
   meaning is used. Pronoun/determiner form entries count as words (*eso*, *esto*).

Found during the first-dataset review and the code review: `frequency.csv` lemmatises aggressively
for Doozan's own deck — *no* is absent, *iglesia* only appears as the proper noun *Iglesia*, *muy*
is folded into *mucho*, *su* into *suyo*, *mamá* into *papá*. The second list restores ~1,500 such
words. A first version that ignored the "filed under" information re-added ~1,000 verb forms as
unrelated nouns (*son* "tone", *era*, *hay*) — the part-of-speech agreement rule prevents that.
Result: 19,171 words. Remaining source quirks: *la*/*las* are pronouns only (filed under *ella*; the
article sense is on *el*), and *mi* also keeps a "Greek letter mu" noun row from `frequency.csv`.

**Key.** `lemma|pos` (e.g. `comer|verb`), unique. The same spelling with different POS stays two
entries (`comer|verb`, `comer|noun`), per the plan.

**Meanings.** From the `es-en.data` blocks with the same POS (form entries ignored except for the
closed-class case above): top-level `gloss:` lines in order, skipping glosses whose `q:` qualifier
marks them obsolete or archaic, skipping sub-glosses (`_gloss`), de-duplicated, at most 5. Each gloss
is cleaned into a learner meaning:

- `[…]` grammar notes and `(# …)` reference notes removed; trailing `:` removed;
- the gloss is split on `;` **outside** parentheses and quotes; each part keeps its English after
  `:`, after `,`, or in (possibly nested) parentheses (`plural of "uno": some, a few`,
  `female equivalent of "perro" (“dog”): bitch`, `initialism of "…" (AI (artificial intelligence))`),
  and parts that only point elsewhere are dropped (`to him, for him; inflection of "él"`);
- a bare cross-reference (`apocopic form of "suyo"`) takes the target word's meanings **of the same
  part of speech** only; `al` (`contraction of "el"`) gets an explicit *to the (a + el)*;
- unrendered template markup (`{{…}}`) is dropped.

24 meanings still contain cross-reference text; validation counts them as a warning in the report.
Colloquial, vulgar, dated, rare, and regional meanings are kept with their qualifier in
`translations.qualifier`. Gender from `g:` (`m`, `f`, `mf` → `m/f`), nouns only.

**Frequency.** `frequency` = count / total count of kept words; `frequency_rank` = position after
sorting by count (1 = most frequent). Forms = the `usage` column's forms, de-duplicated, lemma
itself excluded (words from the second list have none).

**CEFR (`--cefr`).** Match on normalised lemma + learner part of speech (so the dataset's
`Determiner` meets Doozan's `art`), with pronoun/determiner treated as one class (possessives and
demonstratives are tagged either way). One match → that level. Several
matches with different levels → **ambiguous**, no level. No match → no level. Counts of matched /
unmatched / ambiguous / conflicting go in the report; the ambiguous ones are listed. Without
`--cefr`, every `cefr` is null and the report says CEFR was off.

**Examples.** A sentence belongs to an entry when its tags contain the entry's lemma with a
compatible POS. Up to 3 per entry: shortest Spanish text first, ties broken by higher Spanish
proficiency, then by source order. Stored with English, Spanish, and the attribution string.

**Normalisation.** Unicode NFC, lowercase, trim. Accents and `ñ`/`ü` kept (*él* ≠ *el*,
*sí* ≠ *si*).

**Validation.** Errors fail the run: empty lemma, no meanings, duplicate key, invalid POS, invalid
CEFR value, non-NFC text. Warnings are reported only: noun without gender, entry without forms,
entry without examples, CEFR ambiguity.

**SQLite schema** (`node:sqlite`, one transaction, `WITHOUT ROWID` tables — a rowid table stores
every primary key twice, which nearly doubled the file — plus `VACUUM`, which repacks half-full
pages; ~12 MB for 19,171 words):

```sql
CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  -- dataset_version, generated_at, doozan_commit, cefr_commit (or 'off'), counts
CREATE TABLE vocabulary (
  key TEXT PRIMARY KEY, spanish TEXT NOT NULL, part_of_speech TEXT NOT NULL,
  gender TEXT, frequency REAL NOT NULL, frequency_rank INTEGER NOT NULL, cefr TEXT);
CREATE TABLE translations (key TEXT NOT NULL REFERENCES vocabulary(key), english TEXT NOT NULL,
  qualifier TEXT, priority INTEGER NOT NULL, PRIMARY KEY (key, priority));
CREATE TABLE word_forms (key TEXT NOT NULL REFERENCES vocabulary(key), form TEXT NOT NULL,
  PRIMARY KEY (key, form));
CREATE TABLE examples (key TEXT NOT NULL REFERENCES vocabulary(key), spanish TEXT NOT NULL,
  english TEXT NOT NULL, attribution TEXT NOT NULL, priority INTEGER NOT NULL,
  PRIMARY KEY (key, priority));
CREATE INDEX vocabulary_level_rank ON vocabulary (cefr, frequency_rank);
```

Tables keyed by `key`, not row ids, so they stay meaningful across regenerations.
`dataset_version` is a content hash of the entries, so an unchanged rebuild keeps the same
version and the app does not needlessly replace the file.

**Progress output.** The CLI prints one line per stage (`[n/7] stage …`) with live counts while
it works — bytes per download, entries parsed, words kept/dropped with reasons, CEFR matches,
example coverage, validation errors/warnings — and each stage's duration, then the total. Progress
goes to stderr, so the summary on stdout stays clean. Stages report through a small `progress`
callback, so they stay pure and testable.

**Output and safe replacement.** Everything is written to a staging dir next to the output. Only
after the whole run and validation succeed does `swapInto` rename the old folder aside, rename the
staging folder into place (restoring the old folder if that fails), and delete the old copy. Any
failure leaves `assets/vocabulary/` as it was. Temp dirs are removed in `finally` and on Ctrl-C;
`assets/.vocabulary-staging-*` is gitignored in case a build is killed.

**Key diff.** Compares the new keys with the previous `assets/vocabulary/vocabulary.json` (if
present): added / removed counts and the full removed list in the report — the keys whose user
progress an update would orphan.

**Licence.** `DATA-LICENSE.md`: vocabulary data CC-BY-SA (Wiktionary via Doozan, FrequencyWords);
example sentences CC-BY 2.0 FR (Tatoeba, per-sentence attribution in the `examples` table); CEFR
labels from the community dataset (no licence file) when built with `--cefr`.

**Repo wiring.** `pnpm vocab:build` runs `node tools/vocabulary-import/src/index.ts`. Jest
already transforms TypeScript; tests live beside the modules. `assets/vocabulary/*.json` and
`*.md` are excluded from Prettier and cspell (generated).

**CEFR data quality (found in review).** The community CEFR list is unreliable for Spanish: 48 of
the 300 most frequent words are labelled B1/B2 (*de*, *poder*, *decir*, *día*, *vida*), and 2,578
records are inflected forms, feminines, or phrases that match no lemma. The tool stores the levels
as given (null when ambiguous or unmatched); how the app maps Beginner/Intermediate/Advanced is a
step 4 decision — frequency rank is the more trustworthy signal.

## Risks / Trade-offs

- [`node:sqlite` is experimental in Node 24] → isolated in `output/sqlite.ts`; swap to
  `better-sqlite3` behind the same function if it misbehaves.
- [Doozan format drift on a future pin bump] → parsers are tested on fixtures; an unexpected
  line fails the run instead of producing silent gaps.
- [Tatoeba lemma tags are machine-generated (FreeLing)] → sentences are optional, unused by the
  app for now, and filtered by POS as well as lemma.
- [Dropping obsolete/archaic glosses may remove a word's only gloss] → such words drop out and
  are counted in the report, so the effect is visible.
- [Generated files in git grow the repo] → `vocabulary.db` ~10–15 MB per dataset version; updates
  are rare and deliberate.
- [CEFR dataset licence] → optional input, off by default in the reproducible build; report and
  licence file state whether it was used.
