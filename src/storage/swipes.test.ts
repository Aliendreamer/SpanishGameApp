import { openTestDb, type TestDb } from '../../scripts/node-sqlite-db';

import { getSettings, migrate, MIGRATIONS, saveSettings } from '@/storage/progress-db';
import { clearSwipes, knownKeys, logSwipe } from '@/storage/swipes';

let db: TestDb;

beforeEach(async () => {
  db = openTestDb();
  await migrate(db);
});
afterEach(() => db.close());

describe('swipe log', () => {
  test('stores the key, direction, and time of each answer', async () => {
    await logSwipe(db, 'casa|noun', true, 1000);
    await logSwipe(db, 'mesa|noun', false, 2000);

    expect(await db.getAllAsync('SELECT key, direction, at FROM swipes ORDER BY id')).toEqual([
      { key: 'casa|noun', direction: 'right', at: 1000 },
      { key: 'mesa|noun', direction: 'left', at: 2000 },
    ]);
  });

  test("reports the word's previous swipe: none, then each latest direction", async () => {
    expect(await logSwipe(db, 'casa|noun', false)).toBeNull();
    expect(await logSwipe(db, 'casa|noun', true)).toBe('left');
    expect(await logSwipe(db, 'casa|noun', true)).toBe('right');
    expect(await logSwipe(db, 'mesa|noun', true)).toBeNull();
  });

  test('saves answers given at the same time, each with its own previous swipe', async () => {
    await logSwipe(db, 'casa|noun', false);

    const previous = await Promise.all([
      logSwipe(db, 'casa|noun', true),
      logSwipe(db, 'mesa|noun', true),
    ]);

    expect(previous).toEqual(['left', null]);
    expect(await db.getFirstAsync('SELECT count(*) AS n FROM swipes')).toEqual({ n: 3 });
  });

  test('a word is known when its latest swipe is right', async () => {
    await logSwipe(db, 'casa|noun', false);
    await logSwipe(db, 'casa|noun', true);
    await logSwipe(db, 'mesa|noun', true);
    await logSwipe(db, 'mesa|noun', false);

    expect(await knownKeys(db)).toEqual(new Set(['casa|noun']));
  });
});

describe('clearSwipes', () => {
  test('empties the swipe log and leaves the settings alone', async () => {
    await saveSettings(db, { level: 'advanced' });
    await logSwipe(db, 'casa|noun', true);

    await clearSwipes(db);

    expect(await knownKeys(db)).toEqual(new Set());
    expect((await getSettings(db)).level).toBe('advanced');
  });
});

describe('migration 2', () => {
  test('adds the swipe log to a version 1 database and keeps its settings', async () => {
    const old = openTestDb();
    await old.execAsync(MIGRATIONS[0]);
    await old.execAsync('PRAGMA user_version = 1');
    await saveSettings(old, { level: 'advanced' });

    await migrate(old);

    expect((await getSettings(old)).level).toBe('advanced');
    await logSwipe(old, 'casa|noun', true);
    expect(await knownKeys(old)).toEqual(new Set(['casa|noun']));
    old.close();
  });
});
