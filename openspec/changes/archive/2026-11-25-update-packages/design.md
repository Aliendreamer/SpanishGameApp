# Design

## Context

See proposal.md. Versions are exact (`check:pins`), and pnpm refuses packages under 24 hours old.

## Goals / Non-Goals

**Goals:** green gates on the newest versions SDK 57 allows.

**Non-Goals:** see proposal.md. No app code changes unless an update needs one.

## Decisions

- **Versions come from `expo install --check`** for what Expo manages, and from the newest release in
  the same major for the rest.
- **No release-age exclusions**: if a version is under 24 hours old, take the one before it, or stop
  and ask if `expo-doctor` insists on it.
- **Re-resolve the lockfile** with `pnpm clean --lockfile && pnpm install`, as `CLAUDE.md` prescribes.
- **Committed apart from `card-tap-fix`**, so either can be reverted alone.
- **`eventually` instead of `waitFor(async …)` in the route tests.** Five of them failed from
  `expo-router` 57.0.29 on (57.0.28 passes), which clears a tab's animating state on a 32 ms timer.
  Under fake timers `waitFor` with an async check can resolve while its own `act()` is still advancing
  timers; with that timer pending, the next event overlaps it and React's act queue stays broken for
  the rest of the file. The helper advances timers, finishes, then checks. *Holding expo-router at
  57.0.28* was rejected: `expo-doctor` wants 57.0.32 and the fault is in the tests.

## Risks / Trade-offs

- [Jest does not bundle or run native code] → also run the Android `expo export`; the user checks a
  new build on the phone.
- [A newer Prettier may reformat files] → keep any reformatting in this change.
