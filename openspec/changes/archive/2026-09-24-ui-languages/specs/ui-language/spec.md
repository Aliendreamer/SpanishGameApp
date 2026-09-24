## ADDED Requirements

### Requirement: Interface languages

The app SHALL show all of its own text in the chosen interface language, English or Bulgarian.
This covers every screen, button, label, message, tab name, level and word-type name,
part-of-speech chip, the credits sheet, the startup error screen, and accessibility labels and
hints. Spanish words, English meanings, and example sentences are vocabulary data and SHALL NOT be
translated. The Swipe greeting "Hola" / "Hola, {name}" SHALL stay Spanish in both languages.

#### Scenario: Bulgarian interface

- **WHEN** the language is Bulgarian and the Swipe tab shows the word "casa"
- **THEN** the tabs read "Карти", "Думи", "Напредък", "Настройки", the buttons read "Още я уча"
  and "Знам я", and the card back still shows "la casa" with its English meanings

#### Scenario: Greeting stays Spanish

- **WHEN** the language is Bulgarian and the username is Ana
- **THEN** the Swipe header reads "Hola, Ana"

#### Scenario: Part-of-speech chip

- **WHEN** the language is Bulgarian and the card back shows a verb
- **THEN** its chip reads "глагол"

### Requirement: English by default

The interface language SHALL be English until the user chooses another, whatever the phone's
language.

#### Scenario: First launch

- **WHEN** the app starts with no language saved
- **THEN** the Welcome screen shows "Learn Spanish one swipe at a time"

### Requirement: Language stored on the phone

The chosen language SHALL be stored in AsyncStorage next to the username and read with the launch
preferences, so the first screen after the splash is already in that language. A missing or
unknown stored value SHALL read as English.

#### Scenario: Language round-trips

- **WHEN** the language is saved as Bulgarian and the launch preferences are read again
- **THEN** they return language Bulgarian

#### Scenario: Unknown value

- **WHEN** the stored language is "fr"
- **THEN** the launch preferences return language English

### Requirement: Counts follow the language

Numbers SHALL use the language's grouping ("1,142" and "19,171" in English; "1142" and "19 171"
in Bulgarian, which groups from five digits on). Counted
words SHALL use the singular for exactly 1 and the plural otherwise, in both languages.

#### Scenario: Bulgarian counts

- **WHEN** the language is Bulgarian and the Progress tab shows 1 word known and 5 swipes today
- **THEN** the tiles read "1" "позната дума" and "5" "плъзгания днес"

#### Scenario: Level word counts

- **WHEN** the language is Bulgarian and the dictionary has 19171 words
- **THEN** the Full level's detail reads "Всичко · 19 171 думи"

### Requirement: Complete translations

Every English text SHALL have a Bulgarian counterpart. A missing Bulgarian text SHALL fail the
typecheck, and no text in either language SHALL be empty.

#### Scenario: Missing key

- **WHEN** a new English text is added without its Bulgarian counterpart
- **THEN** `pnpm typecheck` fails
