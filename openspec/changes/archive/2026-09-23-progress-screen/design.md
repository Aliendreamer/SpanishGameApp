## Context

From `docs/design/swipe-game-ui/README.md` ("Progress tab") and the prototype's `tabProgress` block
(which fakes a 6-day streak). Agreed with the user: build the streak now.

## Goals / Non-Goals

**Goals:** honest numbers from the swipe log; day rules that match what people expect.

**Non-Goals:** reminders or notifications; history beyond the current week; per-day charts.

## Decisions

- **Local days as day numbers**: a swipe's day is `floor((at + offset) / 86 400 000)`, where
  `offset` is the phone's current UTC offset. SQL returns the distinct day numbers (bounded by how
  many days the user has played), and pure functions in `src/progress/stats.ts` do the rest, so the
  rules are unit-tested without clocks or time zones.
- **Streak**: start at today if today has a swipe, else at yesterday; count back while each day has
  a swipe. No swipe today or yesterday → 0.
- **Week row**: Monday to Sunday of the current week (the design's M T W T F S S), each marked if
  that day has a swipe; days after today are always open.
- **Tiles**: swipes today = rows with today's day number; words known = latest swipe right,
  joined to the dictionary (as on the Words tab).
- **Known by level**: known words per CEFR level (A1–B2) over the level totals from
  `vocabulary-stats.json`; the bar is at least 2 % wide when any word is known, as in the
  prototype, so a first word shows.
- **Refresh on focus** with `useFocusEffect`, like Words.
- **Placeholder removed**: `TabPlaceholder` has no users left.

## Risks / Trade-offs

- [Daylight-saving changes use today's offset for older swipes] → a swipe within an hour of
  midnight on a DST-change day may land on the neighbouring day; acceptable for a streak.
