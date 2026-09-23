## REMOVED Requirements

### Requirement: Level placeholder

**Reason**: The Level step is now built.
**Migration**: `/onboarding/level` shows the Level step (see "Level step").

## ADDED Requirements

### Requirement: Level step

The Level step SHALL show the title "Pick your level", the body "You can change this any time in
Settings.", four radio options — Beginner "A1 + A2 · {n} words", Intermediate "B1 · {n} words",
Advanced "B2 · {n} words", Full "Everything · {n} words" — with counts computed from the
vocabulary statistics, an "Include lower levels" checkbox that is disabled (40% opacity) while
Full is selected, and a "Continue" button. It SHALL open on the saved settings, and Continue SHALL
save the chosen level and checkbox to the game settings.

#### Scenario: Counts from the data

- **WHEN** the Level step is shown with the current vocabulary
- **THEN** the options read "A1 + A2 · 1,142 words", "B1 · 1,316 words", "B2 · 1,603 words", and
  "Everything · 19,171 words"

#### Scenario: Full disables the checkbox

- **WHEN** the user selects Full
- **THEN** "Include lower levels" is disabled

#### Scenario: Continue saves

- **WHEN** the user selects Intermediate, unticks "Include lower levels", and presses "Continue"
- **THEN** the settings hold level `intermediate` and includeLower false, and the app navigates to
  `/onboarding/how-it-works`

### Requirement: How it works placeholder

Until the How it works step is built, `/onboarding/how-it-works` SHALL show step 4 of the
onboarding shell with "Back" and the text "How it works — coming next"; Back SHALL return to Level.

#### Scenario: Back to Level

- **WHEN** the user taps "Back" on the How it works placeholder reached from Level
- **THEN** the app returns to the Level step
