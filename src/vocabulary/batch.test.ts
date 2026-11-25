import { BUNDLED_VOCABULARY, openTestDb, type TestDb } from '../../scripts/node-sqlite-db';

import { readBatch, saveBatch } from '@/storage/batches';
import { DEFAULT_SETTINGS, migrate, type Settings } from '@/storage/progress-db';
import { logSwipe } from '@/storage/swipes';
import { dealNextBatch, nextRound, openBatch } from '@/vocabulary/batch';
import { getDeck } from '@/vocabulary/deck';
import type { Round } from '@/vocabulary/queue';

const settings = (changes: Partial<Settings> = {}): Settings => ({
  ...DEFAULT_SETTINGS,
  ...changes,
});
const BEGINNER = settings();
const keysOf = (round: Round) => round.queue.map((word) => word.key);

let db: TestDb;

beforeEach(async () => {
  db = openTestDb();
  await migrate(db);
  await db.runAsync('ATTACH DATABASE ? AS vocab', [BUNDLED_VOCABULARY]);
});
afterEach(() => db.close());

// Marks every word of the Beginner levels as known, so nothing is left to deal.
const swipeEveryBeginnerWord = () =>
  db.execAsync(
    "INSERT INTO swipes (key, direction, at) SELECT key, 'right', 0 FROM vocab.vocabulary WHERE cefr IN ('A1', 'A2')",
  );

describe('openBatch', () => {
  test('with nothing saved, deals a batch and saves it', async () => {
    const { round, dealtAt } = await openBatch(db, BEGINNER);

    expect(keysOf(round)).toEqual((await getDeck(db, BEGINNER)).map((word) => word.key));
    expect(round).toEqual(expect.objectContaining({ size: 100, batchSize: 100, learned: 0 }));
    expect(await readBatch(db, BEGINNER)).toEqual(
      expect.objectContaining({ size: 100, dealtAt, queue: keysOf(round) }),
    );
  });

  test('resumes the saved batch at the first card not answered', async () => {
    const first = await openBatch(db, BEGINNER);
    const [one, two, three] = keysOf(first.round);
    await logSwipe(db, one, true);
    await logSwipe(db, two, false);

    const { round, dealtAt } = await openBatch(db, BEGINNER);

    expect(round.queue[0]).toEqual(first.round.queue[2]);
    expect(keysOf(round)[0]).toBe(three);
    expect(round).toEqual(expect.objectContaining({ size: 100, batchSize: 100, learned: 1 }));
    expect(dealtAt).toBe(first.dealtAt);
  });

  test('each choice of settings keeps its own place', async () => {
    const beginner = await openBatch(db, BEGINNER);
    await logSwipe(db, keysOf(beginner.round)[0], true);
    await openBatch(db, settings({ level: 'intermediate' }));

    expect(keysOf((await openBatch(db, BEGINNER)).round)).toEqual(keysOf(beginner.round).slice(1));
  });

  test('deals afresh when no word of the saved batch is in the dictionary any more', async () => {
    await saveBatch(db, BEGINNER, { keys: ['nosuchword|noun'], number: 0 });

    expect((await openBatch(db, BEGINNER)).round.size).toBe(100);
  });

  test('with no words to deal, the batch is empty and nothing is saved', async () => {
    await swipeEveryBeginnerWord();

    const { round } = await openBatch(db, BEGINNER);

    expect(round).toEqual({ queue: [], size: 0, batchSize: 0, learned: 0 });
    expect(await readBatch(db, BEGINNER)).toBeNull();
  });
});

describe('nextRound', () => {
  test('is the words not learned yet, and is resumed as such', async () => {
    const { round: first } = await openBatch(db, BEGINNER);
    for (const [i, key] of keysOf(first).entries()) await logSwipe(db, key, i >= 2);

    const { round } = await nextRound(db, BEGINNER);

    expect(keysOf(round)).toEqual(keysOf(first).slice(0, 2));
    expect(round).toEqual(expect.objectContaining({ size: 2, batchSize: 100, learned: 98 }));
    expect((await openBatch(db, BEGINNER)).round).toEqual(round);
  });
});

describe('dealNextBatch', () => {
  test('deals words not swiped before and replaces the saved batch', async () => {
    const { round: first } = await openBatch(db, BEGINNER);
    for (const key of keysOf(first)) await logSwipe(db, key, false);

    const { round } = await dealNextBatch(db, BEGINNER);

    expect(keysOf(round)).toHaveLength(100);
    expect(keysOf(round).filter((key) => keysOf(first).includes(key))).toEqual([]);
    expect((await openBatch(db, BEGINNER)).round).toEqual(round);
  });

  test('with known words on, continues after the saved batch', async () => {
    const all = settings({ includeKnown: true });
    const words = await getDeck(db, all, { limit: 300 });
    await openBatch(db, all);

    expect(keysOf((await dealNextBatch(db, all)).round)[0]).toBe(words[100].key);
    expect(keysOf((await dealNextBatch(db, all)).round)[0]).toBe(words[200].key);
  });

  test('with no new words, deals the words still being learned', async () => {
    const { round: first } = await openBatch(db, BEGINNER);
    await swipeEveryBeginnerWord();
    await logSwipe(db, keysOf(first)[0], false);

    const { round } = await dealNextBatch(db, BEGINNER);

    expect(keysOf(round)).toEqual([keysOf(first)[0]]);
    expect(round).toEqual(expect.objectContaining({ size: 1, batchSize: 1, learned: 0 }));
  });

  test('with every word known, shows none and keeps the saved batch', async () => {
    await openBatch(db, BEGINNER);
    await swipeEveryBeginnerWord();

    expect((await dealNextBatch(db, BEGINNER)).round.batchSize).toBe(0);
    expect((await openBatch(db, BEGINNER)).round.batchSize).toBe(100);
  });
});
