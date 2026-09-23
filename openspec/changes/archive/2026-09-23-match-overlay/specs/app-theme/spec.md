## MODIFIED Requirements

### Requirement: Primary button

`PrimaryButton` SHALL render a full-width pill (height 58, rose background, cream 17/800 label)
that darkens to the pressed colour while pressed and calls `onPress` when tapped. With
`tone="light"` it SHALL instead be cream with a rose label, for rose backgrounds. With `dimmed` it
SHALL show at 50% opacity and stay pressable. While an asynchronous `onPress` is still running,
further presses SHALL be ignored.

#### Scenario: Press

- **WHEN** the user taps the button
- **THEN** `onPress` is called once

#### Scenario: Light tone

- **WHEN** the button is rendered with `tone="light"`
- **THEN** its background is cream (`#FFF6F8`)

#### Scenario: Double tap during an async action

- **WHEN** the user taps twice while the first tap's save or navigation is still running
- **THEN** the action runs once
