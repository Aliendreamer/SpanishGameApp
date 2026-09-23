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
    });
  });

  test('save only the fields given', async () => {
    await saveSettings(db, { level: 'advanced', includeLower: false });

    expect(await getSettings(db)).toEqual({
      level: 'advanced',
      includeLower: false,
      includeKnown: false,
    });
  });
});
