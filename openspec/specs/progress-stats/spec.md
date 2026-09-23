# progress-stats Specification

## Purpose
TBD - created by archiving change progress-screen. Update Purpose after archive.
## Requirements
### Requirement: Day streak

The Progress tab SHALL show a rose streak card with the number of consecutive days, in the phone's
local time, that have at least one swipe, followed by "day streak". The count SHALL start at today
when today has a swipe, otherwise at yesterday, and SHALL be 0 when neither has one. The card SHALL
show the current week Monday to Sunday, marking each day that has a swipe, and the note "Today's
done. See you tomorrow." when today has a swipe, otherwise "Swipe one card today to keep your
streak."

#### Scenario: Played today and the two days before

- **WHEN** there are swipes today, yesterday, and the day before, but not the day before that
- **THEN** the streak is 3 and the note reads "Today's done. See you tomorrow."

#### Scenario: Not yet today

- **WHEN** there are swipes yesterday and the day before, but none today
- **THEN** the streak is 2 and the note reads "Swipe one card today to keep your streak."

#### Scenario: Broken streak

- **WHEN** the last swipe was two days ago
- **THEN** the streak is 0

### Requirement: Today and known tiles

The Progress tab SHALL show two tiles: the number of swipes made today ("swipes today") and the
number of known words ("words known", latest swipe right).

#### Scenario: Counts

- **WHEN** today has 5 swipes and 3 words are known
- **THEN** the tiles read 5 swipes today and 3 words known

### Requirement: Known by level

The Progress tab SHALL list A1, A2, B1, and B2 with "{known} of {total}" (totals from the
dictionary's level counts) and a bar filled in proportion, at least a sliver when any word of the
level is known.

#### Scenario: One A1 word

- **WHEN** one A1 word is known
- **THEN** A1 reads "1 of 402" and its bar is visible

### Requirement: Fresh statistics

The Progress tab SHALL re-read its statistics each time it is shown.

#### Scenario: After swiping

- **WHEN** the user answers a card on Swipe and opens Progress
- **THEN** "swipes today" includes that answer

