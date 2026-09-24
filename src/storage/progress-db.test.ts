import { openTestDb, type TestDb } from '../../scripts/node-sqlite-db';

import { getSettings, migrate, MIGRATIONS, saveSettings } from '@/storage/progress-db';

let db: TestDb;

beforeEach(() => {
  db = openTestDb();
});
afterEach(() => db.close());

async function userVersion() {
  return (await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version'))?.user_version;
}

describe('migrate', () => {
  test('brings a fresh database to the latest version', async () => {
    await migrate(db);

    expect(await userVersion()).toBe(MIGRATIONS.length);
  });

  test('runs each migration once and keeps data on a second run', async () => {
    await migrate(db);
    await saveSettings(db, { level: 'advanced' });

    await migrate(db);

    expect(await userVersion()).toBe(MIGRATIONS.length);
    expect((await getSettings(db)).level).toBe('advanced');
  });
});

describe('settings', () => {
  beforeEach(() => migrate(db));

  test('start at the defaults', async () => {
    expect(await getSettings(db)).toEqual({
      level: 'beginner',
      includeLower: true,
      includeKnown: false,
      wordType: 'all',
    });
  });

  test('save only the fields given', async () => {
    await saveSettings(db, { level: 'advanced', includeLower: false });

    expect(await getSettings(db)).toEqual({
      level: 'advanced',
      includeLower: false,
      includeKnown: false,
      wordType: 'all',
    });
  });

  test('changes saved at the same time all land', async () => {
    await Promise.all([
      saveSettings(db, { level: 'intermediate' }),
      saveSettings(db, { includeKnown: true }),
    ]);

    expect(await getSettings(db)).toEqual({
      level: 'intermediate',
      includeLower: true,
      includeKnown: true,
      wordType: 'all',
    });
  });

  test('the word type saves and reads back', async () => {
    await saveSettings(db, { wordType: 'verb' });

    expect((await getSettings(db)).wordType).toBe('verb');
  });
});

describe('migration 3', () => {
  test('adds the word type to a version 2 database and keeps its settings', async () => {
    const old = openTestDb();
    await old.execAsync(MIGRATIONS[0]);
    await old.execAsync(MIGRATIONS[1]);
    await old.execAsync('PRAGMA user_version = 2');
    await old.runAsync("UPDATE settings SET level = 'advanced' WHERE id = 1");

    await migrate(old);

    expect(await getSettings(old)).toEqual(
      expect.objectContaining({ level: 'advanced', wordType: 'all' }),
    );
    old.close();
  });
});
