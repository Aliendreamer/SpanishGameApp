## MODIFIED Requirements

### Requirement: Welcome screen

The app SHALL open on the Welcome screen at `/onboarding` (the `/` route redirects there), which
shows the step dots with step 1 active, two stacked hero cards (the front one reading "hola"), the
title "Learn Spanish one swipe at a time", the body "See a Spanish word, tap for the English
meaning, and swipe to sort it.", and a "Get started" button pinned to the bottom. "Get started"
SHALL go to the Username step when no username is saved, and straight to the Level step when one
is.

#### Scenario: Content

- **WHEN** the app starts
- **THEN** the Welcome screen shows the title, body, "hola" card, and "Get started" button

#### Scenario: Get started without a username

- **WHEN** no username is saved and the user taps "Get started"
- **THEN** the app navigates to `/onboarding/username`

#### Scenario: Get started with a saved username

- **WHEN** a username is already saved and the user taps "Get started"
- **THEN** the app navigates to `/onboarding/level`, skipping the Username step

### Requirement: Onboarding shell

Every onboarding step SHALL render inside one shared shell: 16/24/24 padding inside the safe
area, and a 36 dp top row with 4 step dots (the current step active) on the left and, from step 4
(How it works) on, a "Back" link on the right that returns to the previous step. Welcome,
Username, and Level SHALL show no "Back". The dots SHALL stay mounted across steps so their width
change animates.

#### Scenario: No Back on the first three steps

- **WHEN** Welcome, Username, or Level is shown
- **THEN** there is no "Back"

#### Scenario: Back without history

- **WHEN** a step with "Back" was opened directly (deep link or reload) and the user taps "Back"
- **THEN** the app goes to the previous step

### Requirement: Single step per navigation

Moving forward from Welcome or Username SHALL replace the current screen, so no navigation (the
Back link or the system back gesture) returns to Welcome or Username, and a double tap cannot add
a step twice.

#### Scenario: No way back to Welcome

- **WHEN** the user taps "Get started" (even twice quickly)
- **THEN** the next step is the only screen in the onboarding stack
