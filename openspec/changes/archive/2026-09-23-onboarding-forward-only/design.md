## Context

User feedback on `username-screen`: skip Username when a name exists, and no way back to Welcome or
Username.

## Goals / Non-Goals

**Goals:** one-way onboarding through the first steps; no repeated username prompt.

**Non-Goals:** `onboardingDone` and launch routing (skipping Welcome itself) — they come with the
How it works step.

## Decisions

- **`router.replace` forward from Welcome and Username.** With no history there is nothing for
  the system back gesture to return to, and a double tap replaces a screen with itself instead of
  stacking it — so `dangerouslySingular` is no longer needed there.
- **Back per step in the layout's `STEPS` list** (`back: true` only for How it works), passed to
  the shell as `showBack`. The shell no longer infers Back from the step index.
- **Welcome's route reads the username on press** (`getUsername()`), not on mount — one storage
  read, only when needed, and no loading state on Welcome.

## Risks / Trade-offs

- [Level has no Back, so a mistyped name can't be fixed during onboarding] → Settings will edit
  the username.
