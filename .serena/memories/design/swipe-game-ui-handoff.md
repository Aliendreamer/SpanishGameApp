# Chosen UI design: docs/design/swipe-game-ui/

The user designed the app UI in Claude Design and likes it. It is the reference for all UI work.

- **Where:** `docs/design/swipe-game-ui/`, committed.
- **Tooling:** the folder is excluded from Prettier and ESLint because it holds generated prototype code.
- **Contents:**
  - `README.md`: the full spec. Tokens, every screen, interactions, state, launch routing.
  - `Palabras App.dc.html`: the interactive prototype. Its markup has the exact px values (for example Welcome's padding 16/24/24 and 58 dp button).
  - `Swipe Directions.dc.html`: explorations; option 3a "Framed" card is the chosen one.
  - `screenshots/01-12`: one per screen, in flow order.
- **Look:** background #F7D6E0, rose #D6457A, ink #3B1624, cream #FFF6F8, olive "know" #5F7A3A. Font is Bricolage Grotesque. Tokens live in `src/theme/index.ts`.

**Build plan (user's choice):**
- One screen at a time, in flow order, each its own OpenSpec change.
- Order: Welcome → Username → Level → How it works → swipe deck → ...
- Welcome is done (change `welcome-screen`, archived 2026-09-23).
- Username is done (change `username-screen`, archived 2026-09-23).

**How the onboarding screens are built:**
- Routes live in `src/app/onboarding/`. `_layout.tsx` holds the ordered `STEPS` list of segment and href pairs, and wraps a Stack in `OnboardingShell`.
- `OnboardingShell` (`src/screens/onboarding-shell/`) provides the dots, Back and padding.
- Screens render only their content.
- Onboarding is one-way (user decision, 2026-09-23). Welcome and Username move forward with `router.replace`, and "Get started" skips Username when a username is saved.
- Back is set per step in `STEPS` (`back: true` from How it works on).
- `PrimaryButton` ignores presses while an async `onPress` runs, via `src/utils/single-flight.ts`.
- User prefs go through `src/storage/prefs.ts` (AsyncStorage).
- Level is done (change `level-screen`, archived 2026-09-23).
- How it works, the launch tutorial and launch routing are done (change `how-it-works-screen`, archived 2026-09-23). Onboarding is complete.
- Launch routing:
  - The root layout reads `getLaunchPrefs()` (AsyncStorage: username, onboardingDone, showTutorial) before hiding the splash, and shares the result via `LaunchContext` (`src/launch`).
  - `/` redirects via `launchTarget()` to `/onboarding`, `/tutorial` or `/swipe`.
  - `/tutorial` reuses the `HowItWorks` screen inside `ScreenFrame` with a greeting.
- The swipe deck is done in 4 parts, archived 2026-09-23:
  - `swipe-card`: tabs, dictionary attach, deck query, card.
  - `swipe-gestures`: pan, stamps, fly-out, 3D flip.
  - `game-rules`: swipe log, queue reducer, summary, empty state, banner.
  - `match-overlay`: "It's a match!".
- How the deck works:
  - The dictionary is attached to progress.db as `vocab`.
  - The deck is dealt by `getDeck` / `dealBatch` (`src/vocabulary/deck.ts`).
  - Queue rules live in `src/vocabulary/queue.ts`; the swipe log in `src/storage/swipes.ts`.
- Settings is done (change `settings-screen`, archived 2026-09-23).
  - Changes save at once, and the Swipe tab re-deals through the `DeckRefreshContext` in `src/state/deck-refresh.ts`.
  - Reset progress clears ONLY the swipe log (user decision). Username, tutorial, onboarding, level and batch settings stay.
- Words and Progress tabs are placeholders (`src/screens/tab-placeholder`). NEXT: those, screen by screen.
- Shared components: `Checkbox`, `ScreenFrame`, `StepHeading` (optional greeting and body).
- Game settings live in `progress.db` (user chose SQLite now over AsyncStorage).
  - `src/storage/progress-db.ts`: migrations tracked by `PRAGMA user_version` and a one-row `settings` table.
  - `SQLiteProvider` in the root layout; `onError` shows `StartupError`.
- Tests run the real SQL through `scripts/node-sqlite-db.js`, which uses `node:sqlite`, and mock `useSQLiteContext` to return it.
- Onboarding steps share a `StepHeading` component (`src/components/step-heading.tsx`).

**Open technical points:**
- long real meanings vs the 36/800 meaning type on the card back
- "Full" level is ~15.1k of 19.2k words with no CEFR
- AsyncStorage alongside progress.db

Related: `mem:workflow/design-together`.
