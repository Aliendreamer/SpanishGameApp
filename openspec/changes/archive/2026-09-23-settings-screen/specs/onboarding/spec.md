## MODIFIED Requirements

### Requirement: Tutorial on launch

The Tutorial (`/tutorial`) SHALL show the How it works content without step dots or Back, with
"Hola, {username}" above the title and the checkbox set from the saved `showTutorial` as it is when
the tutorial opens (so changes made in Settings show), and "Start swiping" SHALL save the checkbox
as `showTutorial` and open the Swipe screen.

#### Scenario: Turn the tutorial off

- **WHEN** the Tutorial is shown, the user unticks the checkbox and taps "Start swiping"
- **THEN** `showTutorial` is false and the app shows the Swipe screen

#### Scenario: Opened from Settings

- **WHEN** "Show tutorial at start" was turned off in Settings and the user opens "View tutorial now"
- **THEN** the tutorial's checkbox is unticked
