import type { ProgressDb } from '@/storage/progress-db';

// The swipe log in progress.db: one row per answer, keyed by `lemma|pos` so dictionary updates
// keep it. Known and "still learning" are derived from each word's latest swipe, never stored.

export async function logSwipe(
  db: ProgressDb,
  key: string,
  knowIt: boolean,
  at = Date.now(),
): Promise<void> {
  await db.runAsync('INSERT INTO swipes (key, direction, at) VALUES (?, ?, ?)', [
    key,
    knowIt ? 'right' : 'left',
    at,
  ]);
}

// Each word's latest swipe. SQLite takes a bare column (direction) from the row that max(id) picks.
export const LATEST_SWIPES = 'SELECT key, direction, max(id) AS id FROM main.swipes GROUP BY key';

// Keys of known words: those whose latest swipe is right.
export const KNOWN_KEYS = `SELECT key FROM (${LATEST_SWIPES}) WHERE direction = 'right'`;

export async function knownKeys(db: ProgressDb): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ key: string }>(KNOWN_KEYS);
  return new Set(rows.map((row) => row.key));
}
