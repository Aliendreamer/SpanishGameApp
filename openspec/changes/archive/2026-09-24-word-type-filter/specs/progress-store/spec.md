## MODIFIED Requirements

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
