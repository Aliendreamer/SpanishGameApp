## MODIFIED Requirements

### Requirement: Settings sections

The Settings tab SHALL show the title "Settings" and, in cream section cards under labels LANGUAGE,
PROFILE, TUTORIAL, LEVEL, WORD TYPE, BATCH, and ABOUT: the "English" and "Български" radio rows;
the username field; the "Show tutorial at start" switch and "View tutorial now ›"; the four levels
as radio rows with their word counts; the four word types as radio rows with their word counts;
the "Include lower levels" and "Include known words" switches; and "Credits ›" and "Reset
progress".

#### Scenario: Current values

- **WHEN** the Settings tab opens with language English, username Ana, level Advanced, lower
  levels off, tutorial on
- **THEN** English is selected, the field shows Ana, Advanced is selected, "Include lower levels"
  is off, and "Show tutorial at start" is on

## ADDED Requirements

### Requirement: Language setting

The LANGUAGE section SHALL list "English" and "Български", each always written in its own
language, with the current language selected. Choosing one SHALL switch the whole interface at
once, with no restart, and save it on the phone. Changing the language SHALL NOT re-deal the
Swipe deck.

#### Scenario: Switch to Bulgarian

- **WHEN** the user taps "Български" in Settings
- **THEN** the Settings title reads "Настройки", the tabs read "Карти", "Думи", "Напредък",
  "Настройки", and the next launch opens in Bulgarian

#### Scenario: Way back

- **WHEN** the language is Bulgarian
- **THEN** the LANGUAGE section (labelled "ЕЗИК") still shows the row "English"

#### Scenario: Deck untouched

- **WHEN** the user is mid-batch and changes the language
- **THEN** the Swipe tab shows the same card and batch position as before
