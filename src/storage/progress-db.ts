import type { SQLiteDatabase } from 'expo-sqlite';

// progress.db: the app's own data (game settings now, the swipe log later), kept apart from the
// read-only vocabulary so a dictionary update never touches it.

// The part of expo-sqlite's database these functions use; tests pass a Node SQLite stand-in.
export type ProgressDb = Pick<
  SQLiteDatabase,
  'execAsync' | 'runAsync' | 'getFirstAsync' | 'getAllAsync' | 'withTransactionAsync'
>;

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'full';

export type Settings = {
  level: Level;
  includeLower: boolean;
  includeKnown: boolean;
};

// Matches the column defaults in the first migration.
export const DEFAULT_SETTINGS: Settings = {
  level: 'beginner',
  includeLower: true,
  includeKnown: false,
};

// Append only: each entry runs once, in order, and PRAGMA user_version records how many have run.
export const MIGRATIONS = [
  `CREATE TABLE settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    level TEXT NOT NULL DEFAULT 'beginner'
      CHECK (level IN ('beginner', 'intermediate', 'advanced', 'full')),
    include_lower INTEGER NOT NULL DEFAULT 1,
    include_known INTEGER NOT NULL DEFAULT 0
  );
  INSERT INTO settings (id) VALUES (1);`,
  // Every answer, append-only; a word's state is its latest swipe (see swipes.ts).
  `CREATE TABLE swipes (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('right', 'left')),
    at INTEGER NOT NULL
  );
  CREATE INDEX swipes_key ON swipes (key, id);`,
];

export async function migrate(db: ProgressDb): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;

  for (let next = version; next < MIGRATIONS.length; next++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[next]);
      // PRAGMA takes no bound parameters; `next` is a loop index, not input.
      await db.execAsync(`PRAGMA user_version = ${next + 1}`);
    });
  }
}

type SettingsRow = { level: Level; include_lower: number; include_known: number };

export async function getSettings(db: ProgressDb): Promise<Settings> {
  const row = await db.getFirstAsync<SettingsRow>(
    'SELECT level, include_lower, include_known FROM settings WHERE id = 1',
  );
  if (!row) throw new Error('progress.db has no settings row; was migrate() run?');
  return {
    level: row.level,
    includeLower: row.include_lower === 1,
    includeKnown: row.include_known === 1,
  };
}

export async function saveSettings(db: ProgressDb, changes: Partial<Settings>): Promise<void> {
  const current = await getSettings(db);
  const next = { ...current, ...changes };
  await db.runAsync(
    'UPDATE settings SET level = ?, include_lower = ?, include_known = ? WHERE id = 1',
    [next.level, next.includeLower ? 1 : 0, next.includeKnown ? 1 : 0],
  );
}
