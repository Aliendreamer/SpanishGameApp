## MODIFIED Requirements

### Requirement: Bottom tab bar

After onboarding the app SHALL show a bottom tab bar with four text-only tabs — Swipe, Words,
Progress, Settings — on a cream bar with a 24 dp top radius; the active tab is a rose pill with
cream text, the others have muted text. Words and Progress SHALL show placeholders until built.

#### Scenario: Switching tabs

- **WHEN** the user taps "Words" on the Swipe tab
- **THEN** the Words tab is shown and "Words" is the selected tab

#### Scenario: Placeholder

- **WHEN** the Progress tab is shown
- **THEN** it reads "Progress — coming next"
