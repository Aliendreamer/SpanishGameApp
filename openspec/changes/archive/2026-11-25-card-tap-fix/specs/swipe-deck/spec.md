# Spec Delta

## MODIFIED Requirements

### Requirement: Swipe to answer

A touch that is released before moving 12 dp in any direction, including one that does not move at
all, SHALL count as a tap and flip the card. Past 12 dp the card SHALL follow the horizontal drag
from there, moving by the drag distance and rotating by a twentieth of it in degrees. On release, a
drag past 90 dp to the right SHALL answer "I know it" and to the left "Still learning", flying the
card out (±560 dp, ±24°, 300 ms); any other release of a drag, and any cancelled touch, SHALL spring
the card back to the centre over 300 ms without flipping it.

#### Scenario: Swipe right

- **WHEN** the user drags the card 120 dp right and lets go
- **THEN** the word is answered "I know it" and the next card is shown

#### Scenario: Short drag

- **WHEN** the user drags the card 50 dp and lets go
- **THEN** the card springs back and nothing is answered

#### Scenario: Tap

- **WHEN** the user touches the card and lets go after moving 3 dp
- **THEN** the card flips

#### Scenario: Tap without any movement

- **WHEN** the user touches the card and lets go without the finger moving at all
- **THEN** the card flips

#### Scenario: Tap with finger drift

- **WHEN** the user touches the card and lets go after moving 10 dp
- **THEN** the card flips

#### Scenario: Drag back to the start

- **WHEN** the user drags the card 50 dp, drags it back to where it was, and lets go
- **THEN** the card stays centred, does not flip, and nothing is answered

#### Scenario: Cancelled touch

- **WHEN** the system cancels a touch on the card
- **THEN** the card is centred, does not flip, and nothing is answered
