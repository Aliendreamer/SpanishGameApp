## ADDED Requirements

### Requirement: Welcome screen

The app SHALL open on the Welcome screen, which shows the step dots with step 1 active, two stacked
hero cards (the front one reading "hola"), the title "Learn Spanish one swipe at a time", the body
"See a Spanish word, tap for the English meaning, and swipe to sort it.", and a "Get started"
button pinned to the bottom.

#### Scenario: Content

- **WHEN** the app starts
- **THEN** the Welcome screen shows the title, body, "hola" card, and "Get started" button

#### Scenario: Get started

- **WHEN** the user taps "Get started"
- **THEN** the app navigates to `/onboarding/username`

### Requirement: Username placeholder

Until the Username step is built, `/onboarding/username` SHALL show a placeholder screen in the app
theme.

#### Scenario: Placeholder

- **WHEN** the app navigates to `/onboarding/username`
- **THEN** a themed screen reads "Username — coming next"
