# app-theme Specification

## Purpose
Shared design tokens, the Bricolage Grotesque font, the light rose look, and base components
(PrimaryButton, StepDots) that every screen uses, per docs/design/swipe-game-ui/.
## Requirements
### Requirement: Design tokens

The app SHALL define its colours, radii, and spacing once, in `src/theme/`, with the values from
the design handoff, and screens SHALL use those tokens rather than literal values.

#### Scenario: Handoff colours

- **WHEN** the theme is read
- **THEN** background is `#F7D6E0`, rose is `#D6457A` (pressed `#C53A6C`), ink is `#3B1624`,
  surface is `#FFF6F8`, and know is `#5F7A3A`

### Requirement: Bricolage Grotesque font

The app SHALL load Bricolage Grotesque in weights 400, 500, 600, 700, and 800 before showing any
screen, keeping the splash screen visible until the fonts are loaded.

#### Scenario: Splash held while fonts load

- **WHEN** the fonts have not finished loading
- **THEN** the root layout renders nothing and the splash screen stays visible

#### Scenario: Fonts fail to load

- **WHEN** loading the fonts fails
- **THEN** the splash screen hides and the app shows in the system font

### Requirement: Light theme with rose splash

The app SHALL use a light appearance only, and its splash background SHALL be `#D6457A`.

#### Scenario: App config

- **WHEN** the app config is read
- **THEN** `userInterfaceStyle` is `light` and the splash `backgroundColor` is `#D6457A`

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

### Requirement: Step dots

`StepDots` SHALL show one dot per step: the active dot 28 wide, the others 8 wide, done and active
dots rose, upcoming dots `#EFBCCD`, with width changes animated over 300 ms.

#### Scenario: Active step

- **WHEN** `StepDots` renders with 4 steps and step 1 active
- **THEN** the first dot is wide and rose and the other three are narrow and `#EFBCCD`

