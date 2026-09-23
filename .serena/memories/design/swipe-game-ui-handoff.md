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
- Level is done (change `level-screen`, archived 2026-09-23). How it works is a placeholder (`src/screens/how-it-works-placeholder`).
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
