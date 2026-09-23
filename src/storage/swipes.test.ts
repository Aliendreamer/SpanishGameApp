import { openTestDb, type TestDb } from '../../scripts/node-sqlite-db';

import { getSettings, migrate, MIGRATIONS, saveSettings } from '@/storage/progress-db';
import { knownKeys, logSwipe } from '@/storage/swipes';

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

  test('a word is known when its latest swipe is right', async () => {
    await logSwipe(db, 'casa|noun', false);
    await logSwipe(db, 'casa|noun', true);
    await logSwipe(db, 'mesa|noun', true);
    await logSwipe(db, 'mesa|noun', false);

    expect(await knownKeys(db)).toEqual(new Set(['casa|noun']));
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
