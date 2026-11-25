import type { ProgressDb, Settings } from '@/storage/progress-db';

// The batch being learned, one per choice of settings. Only its words and two places in the swipe
// log are stored: which words are answered and learned is read from the log, so answering a card
// writes nothing here and the two can't disagree.

export type DeckSettings = Pick<Settings, 'level' | 'includeLower' | 'includeKnown' | 'wordType'>;

export type SavedBatch = {
  // Which batch of the level this is (0-based), for dealing the next one with known words on.
  number: number;
  dealtAt: number;
  // Words in the batch, and those answered "I know it" in any of its rounds.
  size: number;
  learned: number;
  // The current round: the words not learned when it started, and the keys still to answer.
  roundSize: number;
  queue: string[];
};

// Full deals every level, so "include lower levels" makes no difference there.
export function deckKey({ level, includeLower, includeKnown, wordType }: DeckSettings): string {
  const lower = level !== 'full' && includeLower;
  return [level, lower ? 'lower' : 'only', includeKnown ? 'known' : 'new', wordType].join('|');
}

const LAST_SWIPE = '(SELECT coalesce(max(id), 0) FROM main.swipes)';

// One statement, so a batch is replaced whole or not at all.
export async function saveBatch(
  db: ProgressDb,
  settings: DeckSettings,
  { keys, number }: { keys: string[]; number: number },
  at = Date.now(),
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO main.batches (deck, words, start_swipe, round_swipe, number, dealt_at)
     VALUES (?, ?, ${LAST_SWIPE}, ${LAST_SWIPE}, ?, ?)`,
    [deckKey(settings), JSON.stringify(keys), number, at],
  );
}

// Starts a round of the words not learned yet.
export async function startRound(db: ProgressDb, settings: DeckSettings): Promise<void> {
  await db.runAsync(`UPDATE main.batches SET round_swipe = ${LAST_SWIPE} WHERE deck = ?`, [
    deckKey(settings),
  ]);
}

type WordRow = {
  key: string;
  number: number;
  dealt_at: number;
  learned: number;
  in_round: number;
  answered: number;
};

// Null when nothing is saved, or a dictionary update removed every word of the batch.
export async function readBatch(
  db: ProgressDb,
  settings: DeckSettings,
): Promise<SavedBatch | null> {
  const rows = await db.getAllAsync<WordRow>(
    `SELECT v.key, b.number, b.dealt_at,
       EXISTS (SELECT 1 FROM main.swipes s
               WHERE s.key = v.key AND s.direction = 'right' AND s.id > b.start_swipe) AS learned,
       NOT EXISTS (SELECT 1 FROM main.swipes s
                   WHERE s.key = v.key AND s.direction = 'right'
                     AND s.id > b.start_swipe AND s.id <= b.round_swipe) AS in_round,
       EXISTS (SELECT 1 FROM main.swipes s
               WHERE s.key = v.key AND s.id > b.round_swipe) AS answered
     FROM main.batches b, json_each(b.words) word
     JOIN vocab.vocabulary v ON v.key = word.value
     WHERE b.deck = ?
     ORDER BY word.key`,
    [deckKey(settings)],
  );
  if (rows.length === 0) return null;

  const round = rows.filter((row) => row.in_round);
  return {
    number: rows[0].number,
    dealtAt: rows[0].dealt_at,
    size: rows.length,
    learned: rows.filter((row) => row.learned).length,
    roundSize: round.length,
    queue: round.filter((row) => !row.answered).map((row) => row.key),
  };
}
