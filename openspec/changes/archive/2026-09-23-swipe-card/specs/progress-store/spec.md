## ADDED Requirements

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
