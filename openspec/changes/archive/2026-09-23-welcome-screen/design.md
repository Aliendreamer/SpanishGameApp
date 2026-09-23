## Context

First UI change, built from `docs/design/swipe-game-ui/README.md` (moved from
`design_handoff_swipe_game_ui/`). The app today is a one-screen scaffold with no theme, fonts, or
animation library. Screens get built one at a time; this one lays the base.

## Goals / Non-Goals

**Goals:** Welcome matching the handoff; tokens and components later screens reuse; font loading
done once in the root layout.

**Non-Goals:** first-launch detection and storage (`onboardingDone`, AsyncStorage); the username
step; dark mode; the tab shell.

## Decisions

- **Tokens as plain TS objects** (`colors`, `radii`, `spacing`, `fonts`) exported from
  `src/theme/index.ts`. No theming library — light-only app, one palette.
- **Font:** `@expo-google-fonts/bricolage-grotesque` + `useFonts` in `src/app/_layout.tsx`;
  `SplashScreen.preventAutoHideAsync()` at module load, `hideAsync()` once loaded. Font family
  names map weights (`fonts.w800` etc.) because Android picks faces by family name, not
  `fontWeight`.
- **Reanimated for `StepDots`** — width is a layout prop the RN `Animated` native driver can't
  animate; Reanimated is needed for the swipe deck later anyway.
- **Hero cards** are plain Views with `transform` (rotate/translate), no images — as the handoff
  says.
- **Routing:** `src/app/index.tsx` renders Welcome; `src/app/onboarding/username.tsx` renders a
  placeholder screen from `src/screens/username-placeholder/`. Welcome takes an `onGetStarted`
  prop; the route passes `router.push('/onboarding/username')`, keeping the screen testable
  without the router.
- **Design handoff** committed under `docs/design/swipe-game-ui/` and ignored by Prettier and
  ESLint.

## Risks / Trade-offs

- [Reanimated in Jest] → use the library's Jest setup if rendering fails; keep animation logic
  thin.
- [Expo Go support for new native modules] → install with `pnpm expo install` so versions match
  SDK 57, then pin.

## Follow-ups (from review)

- Username step: move onboarding screens under an `app/onboarding/_layout.tsx` that owns the top
  row, step dots, Back, and padding, so the dots persist and animate between steps.
- Swipe deck: extract the framed rose card face (hero front card) into a shared component.
- Username step: guard "Get started" against a double tap pushing the route twice.
