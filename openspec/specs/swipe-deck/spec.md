# swipe-deck Specification

## Purpose
TBD - created by archiving change swipe-card. Update Purpose after archive.
## Requirements
### Requirement: Deck of words

The Swipe tab SHALL deal up to 100 words matching the saved level settings — Beginner A1 and A2,
Intermediate B1, Advanced B2, Full every word; with "include lower levels", also the levels below —
ordered by CEFR level, then frequency rank, with words that have no level last. Each word SHALL
carry its article (nouns: "el", "la", or "el/la" from gender), level, part of speech, up to 3
meanings in priority order, and its first example sentence if it has one.

#### Scenario: Beginner deck

- **WHEN** the level is Beginner
- **THEN** the deck holds up to 100 A1 and A2 words, A1 first, each level in frequency order

#### Scenario: Lower levels included

- **WHEN** the level is Intermediate and "include lower levels" is on
- **THEN** the deck holds A1, A2, and B1 words

#### Scenario: Words can't be loaded

- **WHEN** reading the settings or the dictionary fails
- **THEN** the Swipe tab shows the full-screen "Something went wrong" message

#### Scenario: Full

- **WHEN** the level is Full
- **THEN** words without a CEFR level come after all levelled words

### Requirement: Swipe header

The Swipe tab SHALL show a header with the level line (e.g. "Beginner · A1, A2"), "Hola,
{username}", and the batch progress as "known / batch size" with a progress ring.

#### Scenario: Progress counts known answers

- **WHEN** the user answers "I know it" on 2 of the first 3 cards of a 100-word batch
- **THEN** the header reads "2 / 100"

### Requirement: Word card

The card front SHALL show the word's level, its article (nouns), the lemma, and "Tap to see the
meaning"; a tap SHALL show the back: article and lemma, a part-of-speech chip, the meanings, and
the example sentence with its English translation. A new card SHALL start front-side up. A
next-card hint SHALL show behind the card while more than one card is left.

#### Scenario: Flip

- **WHEN** the user taps the card showing "casa"
- **THEN** the back shows "la casa", the "noun" chip, and its meanings

### Requirement: Answer buttons

"Still learning" and "I know it" SHALL move to the next card; "I know it" SHALL add one to the
known count. After the last card the tab SHALL show "Batch done".

#### Scenario: Next card

- **WHEN** the user presses "I know it" on the first card
- **THEN** the second card is shown front-side up and the known count is 1

