## ADDED Requirements

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
