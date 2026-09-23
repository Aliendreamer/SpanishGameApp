## Context

Onboarding step 4 and the launch tutorial, from `docs/design/swipe-game-ui/README.md` ("How it
works", "Tutorial screen", "Launch routing") and the prototype's `ob2` block. The user asked to
include launch routing and the tutorial in this change.

## Goals / Non-Goals

**Goals:** How it works matching the prototype in both modes; one-way finish of onboarding; the
right first screen at launch with no flash of Welcome.

**Non-Goals:** the swipe deck and bottom tabs; Settings' "View tutorial now" (it will reuse
`/tutorial`).

## Decisions

- **One `HowItWorks` screen, two routes.** Props: optional `greeting`, `initialShowTutorial`,
  `onStart(showTutorial)`. `/onboarding/how-it-works` renders it inside the onboarding shell;
  `/tutorial` renders it in its own padded safe-area frame with the greeting.
- **Launch flags read in the root layout**, next to fonts and `progress.db`: the splash stays up
  until `getLaunchPrefs()` resolves (a read failure falls back to defaults — onboarding again,
  never a stuck splash). The result goes into a `LaunchContext`; `/` redirects using a pure
  `launchTarget(prefs)` function, unit-tested on its own.
- **Stale context is fine**: the context is only read by `/` at launch; flows that change the flags
  navigate explicitly.
- **Finishing onboarding replaces the stack** (`router.replace('/swipe')` from the root Stack's
  onboarding group), so Back never returns into onboarding.
- **`Checkbox` component** extracted from Level (label, checked, onToggle, disabled) and reused.
- **`StepHeading` gets an optional `greeting` and an optional `body`** — How it works has a title
  only, and the tutorial adds the greeting line.

## Risks / Trade-offs

- [An extra AsyncStorage read before the splash hides] → one `multiGet`, milliseconds.
