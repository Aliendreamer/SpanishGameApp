# Spec Delta

## ADDED Requirements

### Requirement: Batch resumes

The Swipe tab SHALL open on the saved batch for the current settings, at the first card of its round
not answered yet, with the header counting the answers already given in that round. A saved batch
whose round is finished SHALL open on the summary. If there is no saved batch, one SHALL be dealt and
saved.

#### Scenario: Continue after closing the app

- **WHEN** the user answers 40 cards of a 100-word batch, closes the app, and opens it again
- **THEN** the 41st word of the same batch is shown and the header reads "40 / 100"

#### Scenario: Continue in a later round

- **WHEN** a batch has 34 words left, the user answers 10 of them in the second round, and the app
  restarts
- **THEN** the 11th of those 34 is shown and the header reads "10 / 34"

#### Scenario: Closed on the summary

- **WHEN** the user finishes a round, closes the app on the summary, and opens it again
- **THEN** the same summary is shown

### Requirement: Rounds until learned

A word SHALL be learned in a batch once it is answered "I know it" in it. "Continue with the {n}
left" SHALL start a round of the batch's words not learned yet, in the batch's order. Rounds SHALL
repeat until every word is learned. Words answered "Still learning" SHALL NOT be replaced by new
words.

#### Scenario: Second round

- **WHEN** the batch is casa, mesa, silla, the user answers "Still learning" on casa and silla, and
  presses "Continue with the 2 left"
- **THEN** a round of casa then silla starts and the header reads "0 / 2"

#### Scenario: Missed again

- **WHEN** the user answers "Still learning" on casa in the second round too
- **THEN** casa is in the third round

#### Scenario: Pressed twice

- **WHEN** the user taps "Continue with the 2 left" twice quickly
- **THEN** one round starts

#### Scenario: Round can't be started

- **WHEN** saving or loading the next round fails
- **THEN** the Swipe tab shows the full-screen "Something went wrong" message

## MODIFIED Requirements

### Requirement: Deck of words

The Swipe tab SHALL deal up to 100 words matching the saved level settings — Beginner A1 and A2,
Intermediate B1, Advanced B2, Full every word; with "include lower levels", also the levels below —
ordered by CEFR level, then frequency rank, with words that have no level last. Words that have
been swiped before (known or still learning) SHALL be left out unless "include known words" is on;
with it on, each following batch SHALL continue after the previous one instead of repeating it, also
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

- **WHEN** casa was answered "I know it" and mesa "Still learning", "include known words" is off,
  and a new batch is dealt
- **THEN** neither casa nor mesa is in it

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

### Requirement: Swipe header

The Swipe tab SHALL show a header with the level line (e.g. "Beginner · A1, A2"), "Hola,
{username}", and the round's progress as "answered / round size" with a progress ring, counting every
answer, "I know it" or "Still learning". A batch's first round SHALL be the whole batch.

#### Scenario: Progress counts every answer

- **WHEN** the user answers "I know it" on 2 of the first 3 cards of a 100-word batch and "Still
  learning" on the other
- **THEN** the header reads "3 / 100"

#### Scenario: End of the batch

- **WHEN** the user answers the last card of a 100-word batch's first round
- **THEN** the header reads "100 / 100"

### Requirement: Batch queue

Each card of a round SHALL be shown once: "I know it" and "Still learning" both remove it, and
"Still learning" keeps the word for the next round. The round SHALL end after its last card.

#### Scenario: No re-queue

- **WHEN** the batch is casa, mesa, silla and the user answers "Still learning" on casa
- **THEN** mesa is next and casa does not come back in this round

#### Scenario: End of the pass

- **WHEN** the user answers the last card of the round
- **THEN** the batch summary is shown

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

- **WHEN** the user presses "Next batch"
- **THEN** a new batch of words not swiped before is dealt

#### Scenario: Leaving words behind

- **WHEN** the user presses "Next batch" with casa still learning and "include known words" off
- **THEN** casa is not in the new batch and is listed under Still learning in My words

#### Scenario: No new words

- **WHEN** the user presses "Next batch" with casa still learning and no unswiped words are left
- **THEN** the empty state is shown, and reopening the app shows the summary with casa left

### Requirement: It's a match

The Swipe tab SHALL show the "It's a match!" overlay when a word is answered "I know it", the answer
is saved, and the word's previous swipe was "Still learning" made before the current batch was
dealt (so misses from this batch and its later rounds don't count, also after the app restarts): a
rose full-screen layer
with "It's a match!", "You were still learning this one. Now you know it.", a card with the word's
article (or part of speech when it has none), lemma, and meanings joined by ", ", and a "Keep
swiping" button that closes it. The overlay SHALL fade in over 350 ms while the card springs from 8°
and 60% size to −4° and full size over 500 ms.

#### Scenario: Missed in an earlier batch

- **WHEN** casa was answered "Still learning" in an earlier batch and is now answered "I know it"
- **THEN** the overlay shows "la", "casa", and its meanings

#### Scenario: Missed in this batch

- **WHEN** casa was answered "Still learning" in this batch and "I know it" in a later round of it
- **THEN** no overlay is shown

#### Scenario: Missed in this batch before a restart

- **WHEN** casa was answered "Still learning" in this batch, the app restarts, and casa is answered
  "I know it" in a later round of it
- **THEN** no overlay is shown

#### Scenario: First answer

- **WHEN** the user answers "I know it" on a word never swiped before
- **THEN** no overlay is shown

#### Scenario: Keep swiping

- **WHEN** the overlay is shown and the user taps "Keep swiping"
- **THEN** the overlay closes and the next card is shown
