# vocabulary-import Specification

## Purpose
A reproducible Node CLI (`pnpm vocab:build`) that builds the bundled Spanish–English vocabulary
database and its review files in `assets/vocabulary/` from pinned open-licence sources.
## Requirements
### Requirement: Reproducible sources

The tool SHALL download only the source files it needs, from commits pinned in
`tools/vocabulary-import/sources.json`, into a temporary directory that is deleted when the run
ends, whether it succeeded or failed.

#### Scenario: Downloads cleaned up after success

- **WHEN** `pnpm vocab:build` completes successfully
- **THEN** the temporary download directory no longer exists

#### Scenario: Downloads cleaned up after failure

- **WHEN** a run fails during parsing or validation
- **THEN** the temporary download directory no longer exists

### Requirement: Output replaced only on success

Generated files in `assets/vocabulary/` SHALL be replaced only when every stage and all
validation succeed.

#### Scenario: Failed run leaves output untouched

- **WHEN** validation reports an error
- **THEN** the command exits non-zero and every file in `assets/vocabulary/` is unchanged

### Requirement: Lemma entries with stable keys

Each entry SHALL be one lemma with one part of speech, keyed `lemma|pos`, with its Spanish text
normalised to NFC and lowercase and its accents preserved.

#### Scenario: Accents are significant

- **WHEN** the sources contain both `el` (article) and `él` (pronoun)
- **THEN** they produce distinct keys and neither is converted to the other

#### Scenario: Same spelling, different part of speech

- **WHEN** `comer` appears as a verb and as a noun
- **THEN** the output has both `comer|verb` and `comer|noun`

### Requirement: Word selection

The dataset SHALL contain every frequency-list lemma except proper nouns and lemmas without a
dictionary part of speech, plus every word from the word-form list that is itself a dictionary lemma
and is not already included, each only if it has at least one usable English meaning. Entries SHALL
be ranked by count.

#### Scenario: Proper noun excluded

- **WHEN** a frequency row has POS `prop`
- **THEN** no entry is produced for it

#### Scenario: Word without meanings excluded and counted

- **WHEN** a lemma has no usable gloss
- **THEN** no entry is produced and the report counts it as dropped

#### Scenario: Common word missing from the frequency list is added

- **WHEN** `no` is absent from `frequency.csv` but in the word-form list and a dictionary lemma
- **THEN** `no|adverb` is included, ranked by its own count

#### Scenario: Inflected form is not added as a word

- **WHEN** a word-form list entry is only a verb, noun, or adjective form in the dictionary
- **THEN** no entry is produced for it

### Requirement: Learner-appropriate meanings

Each entry SHALL have 1 to 5 English meanings from the matching dictionary block, in source order,
de-duplicated, excluding glosses qualified as obsolete or archaic, sub-glosses, and bracketed
grammar notes. Other qualifiers SHALL be kept and stored with the meaning.

#### Scenario: Obsolete gloss skipped

- **WHEN** a gloss has a `q:` qualifier containing `obsolete` or `archaic`
- **THEN** it does not appear among the entry's meanings

#### Scenario: Qualified current meaning kept with its label

- **WHEN** a gloss has the qualifier `colloquial` or `vulgar, Mexico`
- **THEN** it is kept and its `translations.qualifier` holds that text

#### Scenario: Cross-reference reduced to its English

- **WHEN** a gloss reads `apocopic form of "mucho"; very`
- **THEN** the meaning is `very`

#### Scenario: Bare cross-reference resolved

- **WHEN** a word's only gloss is `apocopic form of "suyo"`
- **THEN** its meanings are taken from `suyo`

#### Scenario: Meanings capped

- **WHEN** a word has more than 5 usable glosses
- **THEN** only the first 5 are kept

### Requirement: Optional CEFR levels

With `--cefr`, entries SHALL receive a CEFR level only when exactly one CEFR record matches on
normalised lemma and part of speech; otherwise the level SHALL be null. Without `--cefr`, every
level SHALL be null.

#### Scenario: Single match

- **WHEN** the CEFR data has `desarrollar` as a verb at B1 only
- **THEN** `desarrollar|verb` has level `B1`

#### Scenario: Conflicting levels

- **WHEN** a lemma and part of speech appear at two different levels
- **THEN** the entry's level is null and the report lists it as ambiguous

### Requirement: Example sentences stored separately

The database SHALL store up to 3 example sentences per entry in an `examples` table, selected by
lemma and part-of-speech tags, shortest first, each with its Tatoeba attribution.

#### Scenario: Selection limit and order

- **WHEN** five tagged sentences match an entry
- **THEN** the three shortest are stored with priorities 1–3

### Requirement: Database for the app

The tool SHALL write `vocabulary.db` with `metadata`, `vocabulary`, `translations`, `word_forms`,
and `examples` tables keyed by `key`, and a `metadata.dataset_version` that changes only when the
entries change.

#### Scenario: Unchanged rebuild keeps the version

- **WHEN** the tool runs twice on the same pinned sources
- **THEN** both databases have the same `dataset_version`

### Requirement: Report and licence

Each successful run SHALL write `vocabulary-stats.json`, `IMPORT_REPORT.md` with counts, CEFR
match statistics, warnings, and a key diff against the previous dataset, and `DATA-LICENSE.md`
naming every source and its licence.

#### Scenario: Removed keys listed

- **WHEN** a key present in the previous dataset is absent from the new one
- **THEN** the report lists it under removed keys

### Requirement: Progress while running

The CLI SHALL print progress for each stage while it runs, including counts and durations, and a
total at the end.

#### Scenario: Stage lines

- **WHEN** `pnpm vocab:build` runs
- **THEN** each of the stages prints a line with its counts and duration before the next stage starts
