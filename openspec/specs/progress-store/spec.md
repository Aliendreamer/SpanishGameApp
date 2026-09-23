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

