# Spec Delta

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
order, and its first example sentence if it has one.

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

### Requirement: Batch summary

When a round ends the Swipe tab SHALL show "You know {x} of {n} words in this batch." and tiles "{x}
known" and "{y} still learning", counting the whole batch over all its rounds. While y > 0 the title
SHALL be "Round done", with "Continue with the {y} left" as the main button and "Next batch" below
it; when y is 0 the title SHALL be "Batch learned!", with "Next batch" as the main button. "Next
batch" SHALL deal the next batch, leaving any words not learned. "Change settings" SHALL open the
Settings tab.

#### Scenario: Summary numbers

- **WHEN** a 3-word batch's first round ends with casa answered "Still learning" and the others
  "I know it"
- **THEN** the summary reads "Round done", "You know 2 of 3 words in this batch." with 2 known and
  1 still learning

#### Scenario: Every word learned

- **WHEN** casa is then answered "I know it" in the second round
- **THEN** the summary reads "Batch learned!", "You know 3 of 3 words in this batch.", with no
  "Continue" button

#### Scenario: Practise

- **WHEN** the user presses "Continue with the 1 left"
- **THEN** a round with only casa starts

#### Scenario: Next batch

- **WHEN** the user presses "Next batch" and 100 or more words have never been swiped
- **THEN** a new batch of words not swiped before is dealt

#### Scenario: Leaving words behind

- **WHEN** the user presses "Next batch" with casa still learning, "include known words" off, and 100
  or more words never swiped
- **THEN** casa is not in the new batch and is listed under Still learning in My words

#### Scenario: No new words

- **WHEN** the user presses "Next batch" with casa still learning and no unswiped words are left
- **THEN** a new batch of the words still being learned, casa among them, is dealt

### Requirement: Empty state

When there are no words to deal the Swipe tab SHALL show "You know all these words!", "You know every
word for these settings. Try another level or word type, or include known words.", and an "Open
settings" button that opens the Settings tab.

#### Scenario: Nothing to deal

- **WHEN** every word for the chosen level and word type is known and known words are excluded
- **THEN** the empty state is shown

#### Scenario: Words still being learned

- **WHEN** every word for the chosen level and word type has been swiped and one is still being learned
- **THEN** that word is dealt instead of the empty state
