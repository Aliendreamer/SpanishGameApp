## ADDED Requirements

### Requirement: Word type filter

When the word type setting is Nouns, Verbs, or Adjectives, the Swipe tab SHALL deal only words with
that part of speech, within the level and batch settings, and the header's level line SHALL end
with the type (e.g. "Beginner · A1, A2 · Verbs"). With All words, every part of speech is dealt and
the level line is unchanged.

#### Scenario: Verbs only

- **WHEN** the word type is Verbs and the level is Beginner
- **THEN** every dealt word is a verb and the level line reads "Beginner · A1, A2 · Verbs"

#### Scenario: All words

- **WHEN** the word type is All words
- **THEN** nouns, verbs, adjectives, and other words are all dealt

## MODIFIED Requirements

### Requirement: Empty state

When no words match the settings the Swipe tab SHALL show "No words match your settings", "You've
already swiped every word for these settings. Try another level or word type, or include known
words.", and an "Open settings" button that opens the Settings tab.

#### Scenario: Nothing to deal

- **WHEN** every word for the chosen level and word type has been swiped and known words are
  excluded
- **THEN** the empty state is shown
