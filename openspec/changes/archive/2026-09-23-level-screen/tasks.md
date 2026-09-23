## 1. Progress database

- [x] 1.1 Install and pin `expo-sqlite`; add a Node SQLite test adapter in `scripts/`
- [x] 1.2 Failing tests: `migrate` runs each migration once and sets `user_version`; settings defaults and partial save; implement `src/storage/progress-db.ts`
- [x] 1.3 Root layout opens `progress.db` with `SQLiteProvider` and `migrate`

## 2. Levels

- [x] 2.1 Failing test: level options and word counts from the stats file; implement `src/vocabulary/levels.ts`

## 3. Level step

- [x] 3.1 Failing tests: Level content, radio selection, checkbox toggle and disabled on Full, Continue returns the choice; implement `src/screens/level/`
- [x] 3.2 How it works placeholder screen and route; remove the Level placeholder

## 4. Routes

- [x] 4.1 Failing route tests: Level opens on saved settings, Continue saves and pushes How it works, Back returns to Level; wire the Level route
- [x] 4.2 Build the Android bundle with `expo export`

## 5. Startup error (from code review)

- [x] 5.1 Failing test: a failed `progress.db` open shows a full-screen error and hides the splash; implement `src/screens/startup-error/` and `onError` in the root layout
