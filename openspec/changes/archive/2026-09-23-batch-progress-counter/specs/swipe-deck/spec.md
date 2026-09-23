## MODIFIED Requirements

### Requirement: Swipe header

The Swipe tab SHALL show a header with the level line (e.g. "Beginner · A1, A2"), "Hola,
{username}", and the batch progress as "answered / batch size" with a progress ring, counting every
answer, "I know it" or "Still learning".

#### Scenario: Progress counts every answer

- **WHEN** the user answers "I know it" on 2 of the first 3 cards of a 100-word batch and "Still
  learning" on the other
- **THEN** the header reads "3 / 100"

#### Scenario: End of the batch

- **WHEN** the user answers the last card of a 100-word batch
- **THEN** the header reads "100 / 100"
