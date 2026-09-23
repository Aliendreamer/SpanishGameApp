import { BUNDLED_VOCABULARY, openTestDb, type TestDb } from '../../scripts/node-sqlite-db';

import { DAY_MS } from '@/progress/stats';
import { getProgressStats } from '@/storage/progress-stats';
import { migrate } from '@/storage/progress-db';
import { logSwipe } from '@/storage/swipes';

let db: TestDb;
const TODAY = 20_000;
const at = (day: number, hour = 12) => day * DAY_MS + hour * 3600 * 1000;

beforeEach(async () => {
  db = openTestDb();
  await migrate(db);
  await db.runAsync('ATTACH DATABASE ? AS vocab', [BUNDLED_VOCABULARY]);
});
afterEach(() => db.close());

describe('getProgressStats', () => {
  test("reads the swipe days, today's swipes, and known words per level", async () => {
    await logSwipe(db, 'casa|noun', false, at(TODAY - 2)); // A1
    await logSwipe(db, 'casa|noun', true, at(TODAY - 1));
    await logSwipe(db, 'perro|noun', true, at(TODAY)); // A2
    await logSwipe(db, 'mesa|noun', false, at(TODAY)); // A1, still learning
    await logSwipe(db, 'removedword|noun', true, at(TODAY)); // no longer in the dictionary

    const stats = await getProgressStats(db, { today: TODAY, utcOffsetMs: 0 });

    expect(stats.days).toEqual(new Set([TODAY - 2, TODAY - 1, TODAY]));
    expect(stats.swipesToday).toBe(3);
    expect(stats.wordsKnown).toBe(2);
    expect(stats.knownByLevel).toEqual({ A1: 1, A2: 1, B1: 0, B2: 0 });
  });

  test("uses the phone's offset to decide which day a swipe belongs to", async () => {
    // 23:00 UTC is already the next day at UTC+2.
    await logSwipe(db, 'casa|noun', true, at(TODAY - 1, 23));

    const stats = await getProgressStats(db, { today: TODAY, utcOffsetMs: 2 * 3600 * 1000 });

    expect(stats.days).toEqual(new Set([TODAY]));
    expect(stats.swipesToday).toBe(1);
  });
});
