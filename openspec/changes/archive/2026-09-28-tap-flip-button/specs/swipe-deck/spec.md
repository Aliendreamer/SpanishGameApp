## MODIFIED Requirements

### Requirement: Answer buttons

"Still learning" and "I know it" SHALL fly the card out (left or right) and move to the next card;
"I know it" SHALL add one to the known count. Between them a round ↻ flip button SHALL turn the
card over, and back again on a second press; its accessibility label SHALL read "Show meaning"
while the front shows and "Show word" while the back shows.

#### Scenario: Next card

- **WHEN** the user presses "I know it" on the first card
- **THEN** the second card is shown front-side up and the known count is 1

#### Scenario: Flip button

- **WHEN** the user presses the "Show meaning" button on the card showing "casa"
- **THEN** the back shows "la casa" and the button's label reads "Show word"

#### Scenario: Flip back with the button

- **WHEN** the back is showing and the user presses "Show word"
- **THEN** the front shows again and the button's label reads "Show meaning"

### Requirement: Swipe to answer

The card SHALL follow a horizontal drag, moving by the drag distance and rotating by a twentieth
of it in degrees. On release, a drag past 90 dp to the right SHALL answer "I know it" and to the
left "Still learning", flying the card out (±560 dp, ±24°, 300 ms); a release under 12 dp from
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

#### Scenario: Tap with finger drift

- **WHEN** the user touches the card and lets go after moving 10 dp
- **THEN** the card flips
