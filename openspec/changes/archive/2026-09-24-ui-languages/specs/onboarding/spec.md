## MODIFIED Requirements

### Requirement: How it works step

Onboarding step 4 SHALL show the title "How it works"; three rows — "1" "Tap the card" / "It flips
to show the English meaning and an example.", "→" "Swipe right if you know it" / "The word leaves
this batch.", "←" "Swipe left if you're still learning" / "You can practise it at the end of the
batch."; a "Show this screen when the app starts" checkbox, ticked unless the user turned it off
before; and a "Start swiping" button. "Start swiping" SHALL save the checkbox as `showTutorial`,
mark onboarding done, and open the Swipe screen, leaving no way back into onboarding.

#### Scenario: Finish onboarding

- **WHEN** the user unticks the checkbox and taps "Start swiping"
- **THEN** `showTutorial` is false, onboarding is done, and the app shows the Swipe screen with no
  Back into onboarding

#### Scenario: Swipe-left row

- **WHEN** How it works is shown in English
- **THEN** the third row reads "Swipe left if you're still learning" / "You can practise it at the
  end of the batch."
