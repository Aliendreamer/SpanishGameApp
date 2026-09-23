## MODIFIED Requirements

### Requirement: Welcome screen

The app SHALL open on the Welcome screen at `/onboarding` (the `/` route redirects there), which
shows the step dots with step 1 active, two stacked hero cards (the front one reading "hola"), the
title "Learn Spanish one swipe at a time", the body "See a Spanish word, tap for the English
meaning, and swipe to sort it.", and a "Get started" button pinned to the bottom.

#### Scenario: Content

- **WHEN** the app starts
- **THEN** the Welcome screen shows the title, body, "hola" card, and "Get started" button

#### Scenario: Get started

- **WHEN** the user taps "Get started"
- **THEN** the app navigates to `/onboarding/username`

## REMOVED Requirements

### Requirement: Username placeholder

**Reason**: The Username step is now built.
**Migration**: `/onboarding/username` shows the Username step (see "Username step").

## ADDED Requirements

### Requirement: Onboarding shell

Every onboarding step SHALL render inside one shared shell: 16/24/24 padding inside the safe
area, and a 36 dp top row with 4 step dots (the current step active) on the left and, from step 2
on, a "Back" link on the right that returns to the previous step. The dots SHALL stay mounted
across steps so their width change animates.

#### Scenario: Step 1 has no Back

- **WHEN** Welcome is shown
- **THEN** the dots show step 1 of 4 and there is no "Back"

#### Scenario: Back from step 2

- **WHEN** the user taps "Back" on the Username step
- **THEN** the app returns to Welcome

#### Scenario: Back without history

- **WHEN** a step was opened directly (deep link or reload) and the user taps "Back"
- **THEN** the app goes to the previous step

### Requirement: Username step

The Username step SHALL show the title "What should we call you?", the body "Pick a username. It
stays on this phone.", a text field (placeholder "Username", focused on open, at most 20
characters), a counter "n / 20", and a "Continue" button. A name is valid when its trimmed length
is at least 2. While the name is invalid, "Continue" SHALL be shown at 50% opacity; once the field
is touched (typed in, or Continue pressed) and the name is invalid, the field SHALL get a 2 dp
error border and the message "Use at least 2 characters".

#### Scenario: Untouched empty field

- **WHEN** the Username step opens
- **THEN** no error message is shown and the counter reads "0 / 20"

#### Scenario: Too short after typing

- **WHEN** the user types "a"
- **THEN** "Use at least 2 characters" is shown and the counter reads "1 / 20"

#### Scenario: Continue while invalid

- **WHEN** the user presses "Continue" with an empty or whitespace-only name
- **THEN** the error is shown and the app stays on the Username step

#### Scenario: Valid name

- **WHEN** the user types "Ana" and presses "Continue" or the keyboard's Enter key
- **THEN** the username "Ana" is saved and the app navigates to `/onboarding/level`

### Requirement: Username stored on the phone

On Continue, the app SHALL save the trimmed username to AsyncStorage under the key `username`.

#### Scenario: Surrounding spaces trimmed

- **WHEN** the user continues with "  Ana  "
- **THEN** AsyncStorage holds `username` = "Ana"

### Requirement: Single step per navigation

Moving forward through onboarding SHALL keep at most one copy of each step in the navigation
stack.

#### Scenario: Double tap

- **WHEN** the user taps "Get started" twice quickly
- **THEN** one "Back" from the Username step returns to Welcome

### Requirement: Level placeholder

Until the Level step is built, `/onboarding/level` SHALL show step 3 of the onboarding shell with
the text "Level — coming next".

#### Scenario: Placeholder

- **WHEN** the app navigates to `/onboarding/level`
- **THEN** the dots show step 3 of 4 and the screen reads "Level — coming next"
