## Context

Step 3 of onboarding, from `docs/design/swipe-game-ui/README.md` ("Pick your level") and the
prototype's `ob1` block. The user chose to set up `progress.db` now (roadmap: settings and the
swipe log live in SQLite, keyed so dictionary updates never touch them).

## Goals / Non-Goals

**Goals:** a migration-ready `progress.db`; game settings read and saved there; Level step
matching the prototype.

**Non-Goals:** the swipe log table (with the swipe deck); opening `vocabulary.db`; the Settings
screen.

## Decisions

- **`SQLiteProvider` in the root layout** (`databaseName="progress.db"`, `onInit={migrate}`), so
  every screen gets the same connection via `useSQLiteContext()` and migrations finish before any
  screen renders.
- **Migrations as an ordered array of SQL strings**; `migrate(db)` reads `PRAGMA user_version`,
  runs the missing ones in a transaction each, and bumps the version. Simple, testable, no library.
- **Settings as a one-row table** (`id INTEGER PRIMARY KEY CHECK (id = 1)`) with typed columns,
  inserted by the migration with defaults — reads never need a "missing row" branch.
- **Data functions take a small `ProgressDb` interface** (the `execAsync`, `runAsync`,
  `getFirstAsync` subset of expo-sqlite's `SQLiteDatabase`). Tests pass an adapter over Node's
  built-in `node:sqlite`, so the real SQL runs in Jest. The adapter is plain JS in `scripts/`
  (Node types aren't in the app's TypeScript config).
- **Level counts imported from `vocabulary-stats.json`** (under 1 KB) and formatted with
  `toLocaleString('en-US')`; Beginner sums A1 and A2, Full uses `totalWords`.
- **The Level route reads the saved settings on mount** so returning from How it works (or a
  reinstall with data) shows the saved choice; until they load it renders nothing.
- **Continue pushes How it works** (not replace), so How it works' Back returns to Level.

## Risks / Trade-offs

- [Settings read on mount is an effect] → it syncs with an external store (SQLite), the legitimate
  use; kept in the route, not the screen.
- [expo-sqlite in Expo Go] → part of Expo Go for SDK 57; the dev build needs a rebuild.
