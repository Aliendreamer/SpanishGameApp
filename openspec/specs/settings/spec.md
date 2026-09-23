# settings Specification

## Purpose
TBD - created by archiving change settings-screen. Update Purpose after archive.
## Requirements
### Requirement: Settings sections

The Settings tab SHALL show the title "Settings" and, in cream section cards under labels PROFILE,
TUTORIAL, LEVEL, BATCH, and ABOUT: the username field; the "Show tutorial at start" switch and
"View tutorial now ›"; the four levels as radio rows with their word counts; the "Include lower
levels" and "Include known words" switches; and "Credits ›" and "Reset progress".

#### Scenario: Current values

- **WHEN** the Settings tab opens with username Ana, level Advanced, lower levels off, tutorial on
- **THEN** the field shows Ana, Advanced is selected, "Include lower levels" is off, and "Show
  tutorial at start" is on

### Requirement: Username

The username SHALL be saved when the field loses focus or Enter is pressed, if its trimmed length
is 2–20; the note SHALL read "Saved on this phone", or "Use 2–20 characters" while the entry is
invalid, in which case nothing is saved.

#### Scenario: Valid change

- **WHEN** the user changes the name to "Bea" and presses Enter
- **THEN** the username "Bea" is saved

#### Scenario: Too short

- **WHEN** the user clears the field and leaves it
- **THEN** "Use 2–20 characters" is shown and the saved username is unchanged

### Requirement: Tutorial settings

The "Show tutorial at start" switch SHALL save `showTutorial` when toggled, and "View tutorial now"
SHALL open the tutorial.

#### Scenario: Turn off

- **WHEN** the user turns the switch off
- **THEN** `showTutorial` is saved as false

### Requirement: Level and batch settings

Selecting a level or toggling a batch switch SHALL save the game settings at once. "Include lower
levels" SHALL be disabled for Full with the sub-line "Not used with Full". After any of these
changes the Swipe tab SHALL deal a fresh batch for the new settings when it is next shown.

#### Scenario: Change level

- **WHEN** the user selects Intermediate and opens the Swipe tab
- **THEN** the settings hold `intermediate` and the Swipe header reads "Intermediate · …"

### Requirement: Credits

"Credits ›" SHALL open a bottom sheet titled "Credits" with: "Vocabulary from Wiktionary via
Doozan, CC BY-SA.", "Example sentences from Tatoeba, CC BY, with per-sentence attribution.", and
"Levels from a CEFR word list, free for personal and educational use.", closed by "Close", a tap on
the backdrop, or Android back.

#### Scenario: Open and close

- **WHEN** the user taps "Credits" and then "Close"
- **THEN** the sheet appears with the three lines and then closes

### Requirement: Reset progress

"Reset progress" SHALL need two taps: the first changes the label to "Tap again to reset"; the
second SHALL clear all swipe data — every word becomes unknown — and keep the username, tutorial
setting, onboarding, level, and batch settings. The Swipe tab SHALL then deal a fresh batch.

#### Scenario: Reset

- **WHEN** the user taps "Reset progress" twice
- **THEN** the swipe log is empty, the level is unchanged, and "Progress reset" is shown

#### Scenario: One tap only

- **WHEN** the user taps "Reset progress" once
- **THEN** nothing is cleared and the label reads "Tap again to reset"

