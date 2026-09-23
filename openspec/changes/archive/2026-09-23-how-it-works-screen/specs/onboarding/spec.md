## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: How it works placeholder

**Reason**: The How it works step is now built.
**Migration**: `/onboarding/how-it-works` shows the How it works step (see "How it works step").

## ADDED Requirements

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

### Requirement: Swipe placeholder

Until the swipe deck is built, `/swipe` SHALL show a themed screen reading "Swipe — coming next".

#### Scenario: Placeholder

- **WHEN** the app navigates to `/swipe`
- **THEN** the screen reads "Swipe — coming next"
