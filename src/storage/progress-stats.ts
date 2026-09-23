import { DAY_MS } from '@/progress/stats';
import type { ProgressDb } from '@/storage/progress-db';
import { LATEST_SWIPES } from '@/storage/swipes';
import { CEFR_LEVELS, type CefrLevel } from '@/vocabulary/levels';

export type ProgressStats = {
  // Local day numbers (see progress/stats.ts) that have at least one swipe.
  days: Set<number>;
  swipesToday: number;
  wordsKnown: number;
  knownByLevel: Record<CefrLevel, number>;
};

// The Progress tab's numbers, straight from the swipe log. Known words are joined to the
// dictionary, as on the Words tab, so words a dictionary update removed don't count.
export async function getProgressStats(
  db: ProgressDb,
  { today, utcOffsetMs }: { today: number; utcOffsetMs: number },
): Promise<ProgressStats> {
  const day = `CAST((at + ?) / ${DAY_MS} AS INTEGER)`;
  const [dayRows, levelRows] = await Promise.all([
    // One pass over the log: every day played, with its swipe count.
    db.getAllAsync<{ day: number; n: number }>(
      `SELECT ${day} AS day, count(*) AS n FROM swipes GROUP BY day`,
      [utcOffsetMs],
    ),
    db.getAllAsync<{ cefr: string | null; n: number }>(
      `SELECT v.cefr, count(*) AS n FROM (${LATEST_SWIPES}) AS latest
       JOIN vocab.vocabulary v ON v.key = latest.key
       WHERE latest.direction = 'right'
       GROUP BY v.cefr`,
    ),
  ]);

  const known = (level: CefrLevel) => levelRows.find((row) => row.cefr === level)?.n ?? 0;
  return {
    days: new Set(dayRows.map((row) => row.day)),
    swipesToday: dayRows.find((row) => row.day === today)?.n ?? 0,
    wordsKnown: levelRows.reduce((sum, row) => sum + row.n, 0),
    knownByLevel: Object.fromEntries(CEFR_LEVELS.map((level) => [level, known(level)])) as Record<
      CefrLevel,
      number
    >,
  };
}
