# Spec Delta

## ADDED Requirements

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
