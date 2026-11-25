import { BUNDLED_VOCABULARY, openTestDb, type TestDb } from '../../scripts/node-sqlite-db';

import { deckKey, readBatch, saveBatch, startRound } from '@/storage/batches';
import { DEFAULT_SETTINGS, migrate, type Settings } from '@/storage/progress-db';
import { logSwipe } from '@/storage/swipes';

const CASA = 'casa|noun';
const MESA = 'mesa|noun';
const SILLA = 'silla|noun';
const settings = (changes: Partial<Settings> = {}): Settings => ({
  ...DEFAULT_SETTINGS,
  ...changes,
});
const BEGINNER = settings();
const VERBS = settings({ wordType: 'verb' });

let db: TestDb;

beforeEach(async () => {
  db = openTestDb();
  await migrate(db);
  await db.runAsync('ATTACH DATABASE ? AS vocab', [BUNDLED_VOCABULARY]);
});
afterEach(() => db.close());

describe('deckKey', () => {
  test('differs by level, lower levels, known words, and word type', () => {
    const keys = [
      BEGINNER,
      VERBS,
      settings({ level: 'advanced' }),
      settings({ includeLower: false }),
      settings({ includeKnown: true }),
    ].map(deckKey);

    expect(new Set(keys).size).toBe(5);
  });

  test('ignores lower levels for Full, where they are not used', () => {
    expect(deckKey(settings({ level: 'full', includeLower: true }))).toBe(
      deckKey(settings({ level: 'full', includeLower: false })),
    );
  });
});

describe('saved batch', () => {
  test('is null before one is saved', async () => {
    expect(await readBatch(db, BEGINNER)).toBeNull();
  });

  test('reads back its words in order, its number, and when it was dealt', async () => {
    await saveBatch(db, BEGINNER, { keys: [SILLA, CASA, MESA], number: 2 }, 1000);

    expect(await readBatch(db, BEGINNER)).toEqual({
      number: 2,
      dealtAt: 1000,
      size: 3,
      learned: 0,
      roundSize: 3,
      queue: [SILLA, CASA, MESA],
    });
  });

  test('is kept per choice of settings; saving replaces only that one', async () => {
    await saveBatch(db, BEGINNER, { keys: [CASA], number: 0 });
    await saveBatch(db, VERBS, { keys: [MESA], number: 0 });
    await saveBatch(db, VERBS, { keys: [SILLA], number: 1 });

    expect((await readBatch(db, BEGINNER))?.queue).toEqual([CASA]);
    expect((await readBatch(db, VERBS))?.queue).toEqual([SILLA]);
  });

  test('follows the swipe log: answered words leave the queue, right ones are learned', async () => {
    await saveBatch(db, BEGINNER, { keys: [CASA, MESA, SILLA], number: 0 });
    await logSwipe(db, CASA, true);
    await logSwipe(db, MESA, false);

    expect(await readBatch(db, BEGINNER)).toEqual(
      expect.objectContaining({ size: 3, learned: 1, roundSize: 3, queue: [SILLA] }),
    );
  });

  test('a word known before the batch was dealt is not learned in it', async () => {
    await logSwipe(db, CASA, true);
    await saveBatch(db, BEGINNER, { keys: [CASA], number: 0 });

    expect(await readBatch(db, BEGINNER)).toEqual(
      expect.objectContaining({ learned: 0, queue: [CASA] }),
    );
  });

  test('a word stays learned when it is missed again later', async () => {
    await saveBatch(db, BEGINNER, { keys: [CASA], number: 0 });
    await logSwipe(db, CASA, true);
    await logSwipe(db, CASA, false);

    expect((await readBatch(db, BEGINNER))?.learned).toBe(1);
  });

  test('leaves out words a dictionary update removed', async () => {
    await saveBatch(db, BEGINNER, { keys: [CASA, 'nosuchword|noun'], number: 0 });

    expect(await readBatch(db, BEGINNER)).toEqual(
      expect.objectContaining({ size: 1, roundSize: 1, queue: [CASA] }),
    );
  });
});

describe('startRound', () => {
  test('is a round of the words not learned yet, in batch order', async () => {
    await saveBatch(db, BEGINNER, { keys: [CASA, MESA, SILLA], number: 0 });
    await logSwipe(db, CASA, false);
    await logSwipe(db, MESA, true);
    await logSwipe(db, SILLA, false);

    await startRound(db, BEGINNER);

    expect(await readBatch(db, BEGINNER)).toEqual(
      expect.objectContaining({ size: 3, learned: 1, roundSize: 2, queue: [CASA, SILLA] }),
    );
  });

  test('keeps the round size as its words are answered, until none are left to learn', async () => {
    await saveBatch(db, BEGINNER, { keys: [CASA, MESA], number: 0 });
    await logSwipe(db, CASA, false);
    await logSwipe(db, MESA, false);
    await startRound(db, BEGINNER);
    await logSwipe(db, CASA, true);

    expect(await readBatch(db, BEGINNER)).toEqual(
      expect.objectContaining({ learned: 1, roundSize: 2, queue: [MESA] }),
    );

    await logSwipe(db, MESA, true);
    expect(await readBatch(db, BEGINNER)).toEqual(
      expect.objectContaining({ size: 2, learned: 2, queue: [] }),
    );
  });

  test('leaves the other batches alone', async () => {
    await saveBatch(db, BEGINNER, { keys: [CASA], number: 0 });
    await saveBatch(db, VERBS, { keys: [MESA], number: 0 });
    await logSwipe(db, MESA, false);

    await startRound(db, BEGINNER);

    expect((await readBatch(db, VERBS))?.queue).toEqual([]);
  });
});
