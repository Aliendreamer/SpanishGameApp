## MODIFIED Requirements

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
"I know it" SHALL add one to the known count. After the last card the tab SHALL show "Batch done".

#### Scenario: Next card

- **WHEN** the user presses "I know it" on the first card
- **THEN** the second card is shown front-side up and the known count is 1

## ADDED Requirements

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
