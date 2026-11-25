# progress-store Specification

## Purpose
TBD - created by archiving change level-screen. Update Purpose after archive.

## Requirements

### Requirement: Progress database

The app SHALL keep its own data in a SQLite database named `progress.db`, opened once at startup,
and SHALL bring its schema up to date with numbered migrations tracked by `PRAGMA user_version`,
applying each migration once.

#### Scenario: Fresh install

- **WHEN** the app opens a new, empty `progress.db`
- **THEN** every migration runs and `user_version` equals the number of migrations

#### Scenario: Already migrated

- **WHEN** the app opens a `progress.db` that is already at the latest version
- **THEN** no migration runs again and existing data is kept

#### Scenario: Database cannot be opened

- **WHEN** opening or migrating `progress.db` fails at startup
- **THEN** the splash screen hides and a full-screen "Something went wrong" message is shown
  instead of the app crashing

### Requirement: Game settings

`progress.db` SHALL hold one row of game settings: `level` (`beginner`, `intermediate`,
`advanced`, or `full`; default `beginner`), `includeLower` (default true), `includeKnown` (default
false), and `wordType` (`all`, `noun`, `verb`, or `adjective`; default `all`). Saving SHALL update
only the fields given.

#### Scenario: Defaults

- **WHEN** settings are read before anything was saved
- **THEN** they are level `beginner`, includeLower true, includeKnown false, wordType `all`

#### Scenario: Partial save

- **WHEN** level `advanced` and includeLower false are saved
- **THEN** reading returns level `advanced`, includeLower false, and the other fields unchanged

#### Scenario: Upgrade keeps settings

- **WHEN** a `progress.db` at version 2 with level `advanced` is migrated
- **THEN** the level is still `advanced` and wordType is `all`

### Requirement: Bundled dictionary attached

At startup, after migrating `progress.db`, the app SHALL attach the dictionary `vocabulary.db` to
the same connection as `vocab`, first copying it from the app bundle when the installed copy is
missing, unreadable, or has a `dataset_version` different from the bundled one.

#### Scenario: First launch

- **WHEN** no dictionary is installed yet
- **THEN** the bundled dictionary is copied and attached

#### Scenario: Same version installed

- **WHEN** the installed dictionary has the bundled `dataset_version`
- **THEN** it is attached without copying

#### Scenario: Dictionary update

- **WHEN** the installed dictionary has a different `dataset_version`
- **THEN** it is replaced by the bundled one and attached, and `progress.db` data is untouched

### Requirement: Swipe log table

`progress.db` SHALL keep every swipe — word key (`lemma|pos`), direction (`right` or `left`), and
time — in an append-only `swipes` table added by the second migration. A word's state SHALL be
derived from its latest swipe: known when it is `right`, still learning when it is `left`.

#### Scenario: Latest swipe wins

- **WHEN** casa was swiped left and then right
- **THEN** casa is known

#### Scenario: Upgrade keeps settings

- **WHEN** a `progress.db` at version 1 is migrated
- **THEN** the `swipes` table exists and the saved settings are unchanged

### Requirement: Saved batches

`progress.db` SHALL keep, in a `batches` table added by the fourth migration, at most one batch for
each choice of level, lower levels, known words, and word type: its words in dealing order, when it
was dealt, and where its current round started. Which words are answered and learned SHALL be derived
from the swipe log. "Include lower levels" SHALL make no difference for Full.

#### Scenario: One batch per choice

- **WHEN** a batch is dealt for Beginner with all words and another for Beginner with verbs
- **THEN** both are kept, and dealing again for verbs replaces only the verbs batch

#### Scenario: Derived from the log

- **WHEN** casa and mesa are dealt and casa is swiped right
- **THEN** reading the batch gives casa as learned and mesa as still to answer

#### Scenario: Learned before the batch

- **WHEN** casa was swiped right before a batch holding casa was dealt
- **THEN** casa is not learned in that batch

#### Scenario: Word removed by a dictionary update

- **WHEN** a word of a saved batch is no longer in the dictionary
- **THEN** it is left out of the batch and of its size

#### Scenario: Upgrade keeps progress

- **WHEN** a `progress.db` at version 3 with settings and swipes is migrated
- **THEN** the settings and swipes are unchanged and no batch is saved
