import { type DeckSettings, readBatch, saveBatch, startRound } from '@/storage/batches';
import type { ProgressDb } from '@/storage/progress-db';
import { dealBatch, getWords } from '@/vocabulary/deck';
import type { Round } from '@/vocabulary/queue';

// A round to play, and when its batch was dealt: misses before that can make a match.
export type OpenBatch = { round: Round; dealtAt: number };

// No words to swipe: the Swipe tab's empty state.
export const EMPTY_ROUND: Round = { queue: [], size: 0, batchSize: 0, learned: 0 };

// The saved batch for these settings, where the user left it; deals one if there is none.
export async function openBatch(db: ProgressDb, settings: DeckSettings): Promise<OpenBatch> {
  return (await resume(db, settings)) ?? deal(db, settings, 0);
}

// Starts and opens a round of the batch's words not learned yet.
export async function nextRound(db: ProgressDb, settings: DeckSettings): Promise<OpenBatch> {
  await startRound(db, settings);
  return openBatch(db, settings);
}

// Deals the batch after the saved one, leaving behind any words not learned.
export async function dealNextBatch(db: ProgressDb, settings: DeckSettings): Promise<OpenBatch> {
  const saved = await readBatch(db, settings);
  return deal(db, settings, saved ? saved.number + 1 : 0);
}

async function resume(db: ProgressDb, settings: DeckSettings): Promise<OpenBatch | null> {
  const saved = await readBatch(db, settings);
  if (!saved) return null;
  const { size, learned, roundSize, queue, dealtAt } = saved;
  return {
    round: { queue: await getWords(db, queue), size: roundSize, batchSize: size, learned },
    dealtAt,
  };
}

// With nothing to deal, the saved batch stays as it was, so its words aren't lost.
async function deal(db: ProgressDb, settings: DeckSettings, number: number): Promise<OpenBatch> {
  const { batch, words } = await dealBatch(db, settings, number);
  const dealtAt = Date.now();
  if (words.length === 0) return { round: EMPTY_ROUND, dealtAt };

  const keys = words.map((word) => word.key);
  await saveBatch(db, settings, { keys, number: batch }, dealtAt);
  return {
    round: { queue: words, size: words.length, batchSize: words.length, learned: 0 },
    dealtAt,
  };
}
