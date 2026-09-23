## ADDED Requirements

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
