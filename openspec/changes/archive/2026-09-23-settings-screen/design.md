## Context

From `docs/design/swipe-game-ui/README.md` ("Settings tab", "Credits bottom sheet") and the
prototype's `tabSettings` block. Agreed with the user: Reset clears only the swipe data. Carries the
follow-up from `game-rules`: the Swipe tab must re-deal when settings change.

## Goals / Non-Goals

**Goals:** every setting editable after onboarding, saved immediately; a reset that only clears
swipes; the Swipe tab always dealing for the current settings and progress.

**Non-Goals:** the Words and Progress tabs; exporting or backing up progress.

## Decisions

- **One presentational `Settings` screen, one route that owns storage.** The screen takes the
  current values and callbacks (`onSaveUsername`, `onShowTutorialChange`, `onViewTutorial`,
  `onSettingsChange`, `onResetProgress`); the route reads prefs and `progress.db` and writes them.
- **Deck refresh signal**: a small context in the tabs layout, `DeckRefresh`, holding a counter and
  `invalidate()`. Settings calls it after a level or batch change and after a reset; the Swipe
  route includes the counter in its load effect, so it re-reads settings and deals again; it keys
  the Swipe screen by the version its deck was dealt for (not the live one), so the screen restarts
  only once the new words are there. No focus
  polling, and a batch in progress is only replaced when something that shapes it changed.
- **Switches** are React Native's `Switch` with the design's colours (`trackColor` rose / track,
  `thumbColor` cream), as the handoff allows on Android, inside a pressable row so the whole row
  toggles.
- **Username rule** shared with onboarding (`src/utils/username.ts`). The **field** keeps its own
  draft; blur or Enter saves when the trimmed name is 2–20
  characters, else shows the error note and keeps the saved name.
- **Settings saves** write only the given columns in one statement, so quick successive changes
  can't overwrite each other.
- **Reset**: first tap arms it ("Tap again to reset"); the second runs `clearSwipes` (`DELETE FROM
  swipes`), shows "Progress reset" in place of the label, and invalidates the deck. It stays armed until
  the second tap; a failure shows "Reset failed. Tap to try again".
- **Credits** is a transparent `Modal` bottom sheet (backdrop tap and Android back close it), text
  from the design.
- **Tutorial reads fresh prefs** on mount instead of the launch-time context, which is stale once
  Settings changes them.

## Risks / Trade-offs

- [A re-deal discards the current batch's position] → only on changes that alter what should be
  dealt, as the handoff specifies ("re-deals the current batch").
