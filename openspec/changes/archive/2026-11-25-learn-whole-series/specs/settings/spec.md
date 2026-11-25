# Spec Delta

## MODIFIED Requirements

### Requirement: Level and batch settings

Selecting a level or toggling a batch switch SHALL save the game settings at once. "Include lower
levels" SHALL be disabled for Full with the sub-line "Not used with Full". After any of these
changes the Swipe tab SHALL, when it is next shown, resume the batch saved for the new settings, or
deal one if there is none.

#### Scenario: Change level

- **WHEN** the user selects Intermediate and opens the Swipe tab
- **THEN** the settings hold `intermediate` and the Swipe header reads "Intermediate · …"

#### Scenario: Change back

- **WHEN** the user answers 3 cards as Beginner, selects Intermediate, opens the Swipe tab, and
  selects Beginner again
- **THEN** the Swipe tab shows the Beginner batch at "3 / 100"

### Requirement: Word type setting

The Settings tab SHALL show a WORD TYPE section, after LEVEL, with radio rows "All words", "Nouns",
"Verbs", and "Adjectives", each with its word count; selecting one SHALL save it at once, and the
Swipe tab SHALL, when next shown, resume the batch saved for it, or deal one if there is none.

#### Scenario: Choose verbs

- **WHEN** the user selects "Verbs" and opens the Swipe tab
- **THEN** the word type is saved as `verb` and the Swipe header reads "… · Verbs"

### Requirement: Reset progress

"Reset progress" SHALL need two taps: the first changes the label to "Tap again to reset"; the
second SHALL clear all swipe data and every saved batch — every word becomes unknown — and keep the
username, tutorial setting, onboarding, level, and batch settings. The Swipe tab SHALL then deal a
fresh batch.

#### Scenario: Reset

- **WHEN** the user taps "Reset progress" twice
- **THEN** the swipe log is empty, the level is unchanged, and "Progress reset" is shown

#### Scenario: Batch forgotten

- **WHEN** the user answers 3 cards and then resets the progress
- **THEN** the Swipe tab shows a fresh batch at 0 answered

#### Scenario: One tap only

- **WHEN** the user taps "Reset progress" once
- **THEN** nothing is cleared and the label reads "Tap again to reset"
