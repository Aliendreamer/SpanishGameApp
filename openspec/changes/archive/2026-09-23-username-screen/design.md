## Context

Second onboarding screen, from `docs/design/swipe-game-ui/README.md` ("Username") and the
prototype's markup (`Palabras App.dc.html`, the `obName` block). Follow-ups carried from
`welcome-screen`: a shared onboarding layout, and a double-tap guard.

## Goals / Non-Goals

**Goals:** Username matching the prototype; one onboarding shell the next steps reuse; the
username stored on the phone.

**Non-Goals:** `onboardingDone` and launch routing (with the tutorial step); the Level step;
editing the username in Settings.

## Decisions

- **Shell as a screen component, wired by the route layout.** `OnboardingShell` (in
  `src/screens/onboarding-shell/`) takes `step` and `onBack` and renders safe area, padding, top
  row, then `children`. `src/app/onboarding/_layout.tsx` derives `step` from the current segment
  (`index` → 0, `username` → 1, `level` → 2) and wraps a header-less `Stack`. Keeping the shell
  router-free makes it testable alone.
- **Welcome becomes content only** — the shell owns dots and padding. Its route is
  `src/app/onboarding/index.tsx`; `src/app/index.tsx` becomes `<Redirect href="/onboarding" />`,
  the place launch routing will branch later.
- **Validation in the screen, not a form library.** One `name` and one `touched` state; `valid`
  is derived. `onSubmit(name)` is called with the trimmed name only when valid; the route saves
  it and navigates. The screen stays storage- and router-free.
- **Storage:** `src/storage/prefs.ts` exposes `saveUsername(name)` over AsyncStorage (key
  `username`). Tests use the library's official Jest mock via `jest.setup.js`.
- **Double tap:** forward pushes pass `{ dangerouslySingular: true }`, so the stack keeps one copy
  of the target step.
- **Continue while invalid** stays pressable (dimmed), marking the field touched — as in the
  prototype — rather than a disabled button that gives no feedback.

## Risks / Trade-offs

- [Keyboard covering the button] → rely on Expo's default Android window resize (no
  `KeyboardAvoidingView`); check on the phone.
- [Save failure] → AsyncStorage errors are rare; the route ignores the error and still continues,
  since the name can be set again in Settings later.
