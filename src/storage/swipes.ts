import type { ProgressDb } from '@/storage/progress-db';

// The swipe log in progress.db: one row per answer, keyed by `lemma|pos` so dictionary updates
// keep it. Known and "still learning" are derived from each word's latest swipe, never stored.

export type Direction = 'right' | 'left';

// Logs an answer and returns the word's previous latest swipe (null the first time), so a
// "Still learning" word finally answered "I know it" can be celebrated. No transaction: expo-sqlite
// transactions share the one connection, so overlapping saves would collide. Inserting first and
// then reading the row before it is safe however saves overlap.
export async function logSwipe(
  db: ProgressDb,
  key: string,
  knowIt: boolean,
  at = Date.now(),
): Promise<Direction | null> {
  const { lastInsertRowId } = await db.runAsync(
    'INSERT INTO swipes (key, direction, at) VALUES (?, ?, ?)',
    [key, knowIt ? 'right' : 'left', at],
  );
  const previous = await db.getFirstAsync<{ direction: Direction }>(
    'SELECT direction FROM swipes WHERE key = ? AND id < ? ORDER BY id DESC LIMIT 1',
    [key, lastInsertRowId],
  );
  return previous?.direction ?? null;
}

// Each word's latest swipe. SQLite takes a bare column (direction) from the row that max(id) picks.
export const LATEST_SWIPES = 'SELECT key, direction, max(id) AS id FROM main.swipes GROUP BY key';

// Keys of known words: those whose latest swipe is right.
export const KNOWN_KEYS = `SELECT key FROM (${LATEST_SWIPES}) WHERE direction = 'right'`;

export async function knownKeys(db: ProgressDb): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ key: string }>(KNOWN_KEYS);
  return new Set(rows.map((row) => row.key));
}

// "Reset progress": forget every answer, so every word is unknown again. Settings, the username,
// and onboarding are kept (they live elsewhere).
export async function clearSwipes(db: ProgressDb): Promise<void> {
  await db.execAsync('DELETE FROM swipes');
}
