## ADDED Requirements

### Requirement: First screen at launch

At launch the app SHALL read the stored `onboardingDone` and `showTutorial` flags (defaults: false
and true) before hiding the splash screen, then open: Welcome when onboarding is not done; the
Tutorial when onboarding is done and `showTutorial` is true; otherwise the Swipe screen.

#### Scenario: First launch

- **WHEN** the app starts and onboarding has never been finished
- **THEN** it opens Welcome at `/onboarding`

#### Scenario: Returning with the tutorial on

- **WHEN** the app starts after onboarding was finished with "Show this screen when the app
  starts" ticked
- **THEN** it opens the Tutorial at `/tutorial`

#### Scenario: Returning with the tutorial off

- **WHEN** the app starts after onboarding was finished with the checkbox unticked
- **THEN** it opens the Swipe screen at `/swipe`

### Requirement: Launch flags on the phone

`onboardingDone` and `showTutorial` SHALL be stored in AsyncStorage, next to the username.

#### Scenario: Flags round-trip

- **WHEN** onboarding is marked done and `showTutorial` is saved as false
- **THEN** reading the launch flags returns onboardingDone true and showTutorial false
