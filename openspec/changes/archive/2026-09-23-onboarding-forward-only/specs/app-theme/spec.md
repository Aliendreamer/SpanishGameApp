## MODIFIED Requirements

### Requirement: Primary button

`PrimaryButton` SHALL render a full-width pill (height 58, rose background, cream 17/800 label)
that darkens to the pressed colour while pressed and calls `onPress` when tapped. With `dimmed`
it SHALL show at 50% opacity and stay pressable. While an asynchronous `onPress` is still running,
further presses SHALL be ignored.

#### Scenario: Press

- **WHEN** the user taps the button
- **THEN** `onPress` is called once

#### Scenario: Double tap during an async action

- **WHEN** the user taps twice while the first tap's save or navigation is still running
- **THEN** the action runs once
