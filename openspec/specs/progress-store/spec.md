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
`advanced`, or `full`; default `beginner`), `includeLower` (default true), and `includeKnown`
(default false). Saving SHALL update only the fields given.

#### Scenario: Defaults

- **WHEN** settings are read before anything was saved
- **THEN** they are level `beginner`, includeLower true, includeKnown false

#### Scenario: Partial save

- **WHEN** level `advanced` and includeLower false are saved
- **THEN** reading returns level `advanced`, includeLower false, and includeKnown unchanged

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

