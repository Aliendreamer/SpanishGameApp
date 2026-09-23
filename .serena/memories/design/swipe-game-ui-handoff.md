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

**Carried-forward follow-ups for the Username change:**
- Add `app/onboarding/_layout.tsx` owning the top row, dots, Back and padding, so the dots persist and animate between steps.
- Guard "Get started" against a double tap.

**Open technical points:**
- long real meanings vs the 36/800 meaning type on the card back
- "Full" level is ~15.1k of 19.2k words with no CEFR
- AsyncStorage alongside progress.db

Related: `mem:workflow/design-together`.
