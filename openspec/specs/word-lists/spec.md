# word-lists Specification

## Purpose
TBD - created by archiving change words-screen. Update Purpose after archive.
## Requirements
### Requirement: Known and still-learning lists

The Words tab SHALL show the title "My words", pills "Known · {n}" and "Still learning · {n}" (the
active one ink with cream text), and the words of the active list: a word is known when its latest
swipe is "I know it" and still learning when it is "Still learning". The list SHALL be ordered by
that latest swipe, most recent first. Each row SHALL show the word with its article, its meanings
joined by ", " on one shortened line, and its CEFR level as a chip when it has one.

#### Scenario: Counts and default list

- **WHEN** casa and mesa are known and perro is still learning
- **THEN** the pills read "Known · 2" and "Still learning · 1", and Known lists the most recently
  answered of casa and mesa first

#### Scenario: Switching lists

- **WHEN** the user taps "Still learning · 1"
- **THEN** perro is listed

### Requirement: Search

The field "Search Spanish or English" SHALL filter the active list to words whose lemma, article
plus lemma, or English meanings contain the text, ignoring case.

#### Scenario: By English

- **WHEN** the user searches "house" on Known
- **THEN** casa is listed and mesa is not

#### Scenario: With the article

- **WHEN** the user searches "la casa"
- **THEN** casa is listed

#### Scenario: Special characters

- **WHEN** the user searches "_" or "%"
- **THEN** only words containing that character are listed

### Requirement: Empty lists

The Words tab SHALL show "Words you swipe right on show up here." for an empty Known list, "Words
you swipe left on show up here until you know them." for an empty Still learning list, and "No
words match your search." when a search finds nothing.

#### Scenario: Nothing known yet

- **WHEN** no word has been answered "I know it"
- **THEN** Known shows "Words you swipe right on show up here."

### Requirement: Fresh lists

The Words tab SHALL re-read its lists each time it is shown.

#### Scenario: Just swiped

- **WHEN** the user answers "I know it" on the Swipe tab and opens Words
- **THEN** that word is first in Known

