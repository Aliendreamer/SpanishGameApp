# swipe-deck Specification

## Purpose
TBD - created by archiving change swipe-card. Update Purpose after archive.
## Requirements
### Requirement: Deck of words

The Swipe tab SHALL deal up to 100 words matching the saved level settings — Beginner A1 and A2,
Intermediate B1, Advanced B2, Full every word; with "include lower levels", also the levels below —
ordered by CEFR level, then frequency rank, with words that have no level last. Words whose latest
swipe was "I know it" SHALL be left out unless "include known words" is on; with it on, each
following batch in the session SHALL continue after the previous one instead of repeating it. Each
word SHALL carry its article (nouns: "el", "la", or "el/la" from gender), level, part of speech,
up to 3 meanings in priority order, and its first example sentence if it has one.

#### Scenario: Beginner deck

- **WHEN** the level is Beginner
- **THEN** the deck holds up to 100 A1 and A2 words, A1 first, each level in frequency order

#### Scenario: Lower levels included

- **WHEN** the level is Intermediate and "include lower levels" is on
- **THEN** the deck holds A1, A2, and B1 words

#### Scenario: Known words left out

- **WHEN** "casa" was last answered "I know it" and "include known words" is off
- **THEN** "casa" is not dealt

#### Scenario: Known words included

- **WHEN** "include known words" is on
- **THEN** known words are dealt too

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
meaning"; a tap SHALL turn the card over with a 3D flip (450 ms) to the back: article and lemma, a
part-of-speech chip, the meanings, and the example sentence with its English translation. A new
card SHALL start front-side up. A next-card hint SHALL show behind the card while more than one
card is left.

#### Scenario: Flip

- **WHEN** the user taps the card showing "casa"
- **THEN** the back shows "la casa", the "noun" chip, and its meanings

### Requirement: Answer buttons

"Still learning" and "I know it" SHALL fly the card out (left or right) and move to the next card;
"I know it" SHALL add one to the known count.

#### Scenario: Next card

- **WHEN** the user presses "I know it" on the first card
- **THEN** the second card is shown front-side up and the known count is 1

### Requirement: Swipe to answer

The card SHALL follow a horizontal drag, moving by the drag distance and rotating by a twentieth
of it in degrees. On release, a drag past 90 dp to the right SHALL answer "I know it" and to the
left "Still learning", flying the card out (±560 dp, ±24°, 300 ms); a release under 6 dp from
the start in any direction SHALL count as a tap and flip the card; any other release, and any
cancelled touch, SHALL spring the card back to the centre over 300 ms.

#### Scenario: Swipe right

- **WHEN** the user drags the card 120 dp right and lets go
- **THEN** the word is answered "I know it" and the next card is shown

#### Scenario: Short drag

- **WHEN** the user drags the card 50 dp and lets go
- **THEN** the card springs back and nothing is answered

#### Scenario: Tap

- **WHEN** the user touches the card and lets go after moving 3 dp
- **THEN** the card flips

### Requirement: Swipe stamps

While dragging, an "I know it" stamp (olive, top-left) SHALL fade in on a right drag and a "Still
learning" stamp (ink, top-right) on a left drag, reaching full opacity at 90 dp.

#### Scenario: Half-way

- **WHEN** the card is dragged 45 dp to the right
- **THEN** the "I know it" stamp is at half opacity and "Still learning" is hidden

### Requirement: Batch queue

"I know it" SHALL remove the card from the batch; "Still learning" SHALL put it back so it returns
after the next 3 cards (or last, when fewer remain). The batch SHALL end when every card has been
answered "I know it".

#### Scenario: Re-queue

- **WHEN** the batch is casa, mesa, silla, vaso, perro and the user answers "Still learning" on casa
- **THEN** the order becomes mesa, silla, vaso, casa, perro

#### Scenario: Last card left

- **WHEN** only casa is left and the user answers "Still learning"
- **THEN** casa is shown again

### Requirement: Swipe log

Every answer SHALL be saved to `progress.db` as a swipe (word key, direction, time). If saving
fails, a non-blocking banner SHALL say so and the game SHALL carry on; the banner SHALL go away
after the next successful save.

#### Scenario: Answer saved

- **WHEN** the user answers "I know it" on casa
- **THEN** a right swipe for `casa|noun` is stored

#### Scenario: Save fails

- **WHEN** saving an answer fails
- **THEN** "Couldn't save your last answer." is shown and the next card is still shown

### Requirement: Batch summary

When a batch ends the Swipe tab SHALL show "Batch done", "You know all {n} words in this batch.",
"{x} known on the first swipe", "{y} took a few tries" (words answered "Still learning" at least
once), a "Continue with the next batch" button that deals the next batch, and a "Change settings"
button that opens the Settings tab.

#### Scenario: Summary numbers

- **WHEN** a 3-word batch ends after casa was answered "Still learning" once
- **THEN** the summary shows 2 known on the first swipe and 1 took a few tries

#### Scenario: Continue

- **WHEN** the user presses "Continue with the next batch"
- **THEN** a new batch is dealt without the words just learned

### Requirement: Empty state

When no words match the settings the Swipe tab SHALL show "No words match your settings", "You
already know every word at this level. Try another level, or include known words.", and an "Open
settings" button that opens the Settings tab.

#### Scenario: Nothing to deal

- **WHEN** every word of the chosen level is known and known words are excluded
- **THEN** the empty state is shown

### Requirement: It's a match

The Swipe tab SHALL show the "It's a match!" overlay when a word whose previous swipe was "Still
learning" — in this batch or any earlier session — is answered "I know it" and the answer is saved: a
rose full-screen layer with "It's a match!", "You were still learning this one. Now you know it.", a
card with the word's article (or part of speech when it has none), lemma, and meanings joined by
", ", and a "Keep swiping" button that closes it. The overlay SHALL fade in over 350 ms while the
card springs from 8° and 60% size to −4° and full size over 500 ms.

#### Scenario: Learned in the same batch

- **WHEN** the user answers "Still learning" on casa and later "I know it" on casa
- **THEN** the overlay shows "la", "casa", and its meanings

#### Scenario: First answer

- **WHEN** the user answers "I know it" on a word never swiped before
- **THEN** no overlay is shown

#### Scenario: Keep swiping

- **WHEN** the overlay is shown and the user taps "Keep swiping"
- **THEN** the overlay closes and the next card is shown

