## ADDED Requirements

### Requirement: Word type setting

The Settings tab SHALL show a WORD TYPE section, after LEVEL, with radio rows "All words", "Nouns",
"Verbs", and "Adjectives", each with its word count; selecting one SHALL save it at once, and the
Swipe tab SHALL deal a fresh batch for it when next shown.

#### Scenario: Choose verbs

- **WHEN** the user selects "Verbs" and opens the Swipe tab
- **THEN** the word type is saved as `verb` and the Swipe header reads "… · Verbs"
