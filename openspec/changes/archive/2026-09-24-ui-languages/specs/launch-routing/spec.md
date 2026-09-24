## MODIFIED Requirements

### Requirement: Launch flags on the phone

`onboardingDone`, `showTutorial`, and the interface `language` SHALL be stored in AsyncStorage,
next to the username, and read together as the launch preferences.

#### Scenario: Flags round-trip

- **WHEN** onboarding is marked done and `showTutorial` is saved as false
- **THEN** reading the launch flags returns onboardingDone true and showTutorial false

#### Scenario: Language in the launch preferences

- **WHEN** the language is saved as Bulgarian
- **THEN** reading the launch preferences returns language Bulgarian
