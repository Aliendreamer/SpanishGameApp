# onboarding Specification

## Purpose
The first-launch flow: Welcome, then username, level, and tutorial steps (built one screen at a
time), per docs/design/swipe-game-ui/.
## Requirements
### Requirement: Welcome screen

While onboarding is not done, the app SHALL open on the Welcome screen at `/onboarding` (the `/`
route redirects there), which shows the step dots with step 1 active, two stacked hero cards (the
front one reading "hola"), the title "Learn Spanish one swipe at a time", the body "See a Spanish
word, tap for the English meaning, and swipe to sort it.", and a "Get started" button pinned to
the bottom. "Get started" SHALL go to the Username step when no username is saved, and straight to
the Level step when one is.

#### Scenario: Content

- **WHEN** the app starts before onboarding is done
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

Moving forward from Welcome or Username SHALL replace the current screen, so no navigation (the
Back link or the system back gesture) returns to Welcome or Username, and a double tap cannot add
a step twice.

#### Scenario: No way back to Welcome

- **WHEN** the user taps "Get started" (even twice quickly)
- **THEN** the next step is the only screen in the onboarding stack

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

### Requirement: How it works step

Onboarding step 4 SHALL show the title "How it works"; three rows — "1" "Tap the card" / "It flips
to show the English meaning and an example.", "→" "Swipe right if you know it" / "The word leaves
this batch.", "←" "Swipe left if you're still learning" / "It comes back a few cards later."; a
"Show this screen when the app starts" checkbox, ticked unless the user turned it off before; and a
"Start swiping" button. "Start swiping" SHALL save the checkbox as `showTutorial`, mark onboarding
done, and open the Swipe screen, leaving no way back into onboarding.

#### Scenario: Finish onboarding

- **WHEN** the user unticks the checkbox and taps "Start swiping"
- **THEN** `showTutorial` is false, onboarding is done, and the app shows the Swipe screen with no
  Back into onboarding

### Requirement: Tutorial on launch

The Tutorial (`/tutorial`) SHALL show the How it works content without step dots or Back, with
"Hola, {username}" above the title, and "Start swiping" SHALL save the checkbox as `showTutorial`
and open the Swipe screen.

#### Scenario: Turn the tutorial off

- **WHEN** the Tutorial is shown, the user unticks the checkbox and taps "Start swiping"
- **THEN** `showTutorial` is false and the app shows the Swipe screen

