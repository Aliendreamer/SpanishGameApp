# Spec Delta

## ADDED Requirements

### Requirement: Browse example sentences

When a word has more than one example sentence, the example box on the card back SHALL show the
position as "1 / 3" and a "›", and a tap on the box SHALL show the next sentence with its
translation, returning to the first after the last, without flipping the card. A new card SHALL start
at its first sentence. A drag that starts on the box SHALL swipe the card.

#### Scenario: Next sentence

- **WHEN** the back of a word with 3 sentences is showing and the user taps the example box
- **THEN** the second sentence and its translation are shown with "2 / 3" and the card stays flipped

#### Scenario: After the last

- **WHEN** the third of 3 sentences is showing and the user taps the box
- **THEN** the first sentence is shown with "1 / 3"

#### Scenario: One sentence

- **WHEN** the word has one sentence
- **THEN** no position or "›" is shown and a tap on the box flips the card

#### Scenario: Flipping keeps the place

- **WHEN** the second sentence is showing and the user flips the card to the front and back again
- **THEN** the second sentence is still showing

#### Scenario: Swipe from the box

- **WHEN** the user drags 120 dp right starting on the example box
- **THEN** the word is answered "I know it" and the next card starts at its first sentence

### Requirement: Next example for screen readers

While the back of a card with more than one example sentence is showing, the card SHALL offer a "Next
example" accessibility action that shows the next sentence. The action SHALL NOT be offered on the
front or with fewer than two sentences.

#### Scenario: Action

- **WHEN** a screen reader user chooses "Next example" on a flipped card with 3 sentences
- **THEN** the second sentence is shown

#### Scenario: Not offered

- **WHEN** the front is showing, or the word has one sentence or none
- **THEN** the card has no "Next example" action

## MODIFIED Requirements

### Requirement: Deck of words

The Swipe tab SHALL deal up to 100 words matching the saved level settings — Beginner A1 and A2,
Intermediate B1, Advanced B2, Full every word; with "include lower levels", also the levels below —
ordered by CEFR level, then frequency rank, with words that have no level last. Known words SHALL
be left out unless "include known words" is on, and words still being learned SHALL come after all
words never swiped, in the same order among themselves; with "include known words" on, no word is
left out or moved, and each following batch SHALL continue after the previous one instead of repeating it, also
after the app restarts, and start over after the last word. Each word SHALL carry its article
(nouns: "el", "la", or "el/la" from gender), level, part of speech, up to 3 meanings in priority
order, and up to 3 example sentences in priority order.

#### Scenario: Beginner deck

- **WHEN** the level is Beginner
- **THEN** the deck holds up to 100 A1 and A2 words, A1 first, each level in frequency order

#### Scenario: Lower levels included

- **WHEN** the level is Intermediate and "include lower levels" is on
- **THEN** the deck holds A1, A2, and B1 words

#### Scenario: Swiped words left out

- **WHEN** casa was answered "I know it", "include known words" is off, and a new batch is dealt
- **THEN** casa is not in it

#### Scenario: New words first

- **WHEN** mesa is still being learned, "include known words" is off, and 100 or more words have never
  been swiped
- **THEN** a new batch holds 100 of those and not mesa

#### Scenario: Topped up

- **WHEN** 40 words have never been swiped, 10 are still being learned, and "include known words" is
  off
- **THEN** a new batch holds the 40 and then the 10

#### Scenario: Known words included

- **WHEN** "include known words" is on
- **THEN** swiped words are dealt too

#### Scenario: Known words included after a restart

- **WHEN** "include known words" is on, the app restarts during the second batch, and the user
  presses "Next batch"
- **THEN** the third batch is dealt

#### Scenario: Words can't be loaded

- **WHEN** reading the settings or the dictionary fails
- **THEN** the Swipe tab shows the full-screen "Something went wrong" message

#### Scenario: Full

- **WHEN** the level is Full
- **THEN** words without a CEFR level come after all levelled words

#### Scenario: Examples

- **WHEN** a dealt word has 3 example sentences
- **THEN** it carries all 3, in priority order
