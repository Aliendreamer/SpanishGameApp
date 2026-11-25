import type { DeckSettings } from '@/storage/batches';
import type { ProgressDb, Settings } from '@/storage/progress-db';
import { KNOWN_KEYS } from '@/storage/swipes';
import { articleFor } from '@/vocabulary/article';
import { deckBands } from '@/vocabulary/levels';

export const BATCH_SIZE = 100;
const MAX_MEANINGS = 3;

export type DeckWord = {
  // `lemma|pos`, the key progress is stored under.
  key: string;
  lemma: string;
  // "el", "la", or "el/la" for nouns; null otherwise.
  article: string | null;
  level: string | null;
  partOfSpeech: string;
  rank: number;
  meanings: string[];
  example: { spanish: string; english: string } | null;
};

type WordRow = {
  key: string;
  spanish: string;
  part_of_speech: string;
  gender: string | null;
  cefr: string | null;
  frequency_rank: number;
};

// Words for the saved settings: level by level (unlevelled last), each level in frequency order —
// the order the roadmap sets for dealing batches. Unless the settings include known words, those are
// left out and words still being learned come after every new one; `offset` skips the words of
// earlier batches.
export async function getDeck(
  db: ProgressDb,
  settings: Pick<Settings, 'level' | 'includeLower'> &
    Partial<Pick<Settings, 'includeKnown' | 'wordType'>>,
  { limit = BATCH_SIZE, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<DeckWord[]> {
  const bands = deckBands(settings);
  const wordType = settings.wordType ?? 'all';
  const conditions = [
    ...(bands ? [`cefr IN (${bands.map(() => '?').join(', ')})`] : []),
    ...(wordType === 'all' ? [] : ['part_of_speech = ?']),
    ...(settings.includeKnown ? [] : [`key NOT IN (${KNOWN_KEYS})`]),
  ];
  // Of the words left, those swiped before are the ones still being learned.
  const newFirst = settings.includeKnown ? '' : 'key IN (SELECT key FROM main.swipes), ';
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.getAllAsync<WordRow>(
    `SELECT key, spanish, part_of_speech, gender, cefr, frequency_rank
     FROM vocab.vocabulary ${where}
     ORDER BY ${newFirst}cefr IS NULL, cefr, frequency_rank
     LIMIT ? OFFSET ?`,
    [...(bands ?? []), ...(wordType === 'all' ? [] : [wordType]), limit, offset],
  );
  return addDetails(db, rows);
}

// The words with these keys, in the order given; keys the dictionary doesn't have are left out.
export async function getWords(db: ProgressDb, keys: string[]): Promise<DeckWord[]> {
  const rows = await db.getAllAsync<WordRow>(
    `SELECT v.key, v.spanish, v.part_of_speech, v.gender, v.cefr, v.frequency_rank
     FROM json_each(?) word JOIN vocab.vocabulary v ON v.key = word.value
     ORDER BY word.key`,
    [JSON.stringify(keys)],
  );
  return addDetails(db, rows);
}

// Adds the meanings and the first example to each word.
async function addDetails(db: ProgressDb, rows: WordRow[]): Promise<DeckWord[]> {
  if (rows.length === 0) return [];

  const keys = rows.map((row) => row.key);
  const inKeys = keys.map(() => '?').join(', ');
  const [translations, examples] = await Promise.all([
    db.getAllAsync<{ key: string; english: string }>(
      `SELECT key, english FROM vocab.translations WHERE key IN (${inKeys}) ORDER BY key, priority`,
      keys,
    ),
    db.getAllAsync<{ key: string; spanish: string; english: string }>(
      `SELECT key, spanish, english FROM vocab.examples WHERE key IN (${inKeys})
       ORDER BY key, priority`,
      keys,
    ),
  ]);

  const meanings = new Map<string, string[]>();
  for (const { key, english } of translations) {
    const list = meanings.get(key) ?? [];
    if (list.length < MAX_MEANINGS) meanings.set(key, [...list, english]);
  }
  const firstExample = new Map<string, { spanish: string; english: string }>();
  for (const { key, spanish, english } of examples) {
    if (!firstExample.has(key)) firstExample.set(key, { spanish, english });
  }

  return rows.map((row) => ({
    key: row.key,
    lemma: row.spanish,
    article: articleFor(row.part_of_speech, row.gender),
    level: row.cefr,
    partOfSpeech: row.part_of_speech,
    rank: row.frequency_rank,
    meanings: meanings.get(row.key) ?? [],
    example: firstExample.get(row.key) ?? null,
  }));
}

// Deals batch number `batch` (0-based) of the level. Without known words, known ones drop out, so
// every batch starts from the top of what is left. With them, batches walk down the level and
// start over after its last word, rather than dealing nothing.
export async function dealBatch(
  db: ProgressDb,
  settings: DeckSettings,
  batch: number,
): Promise<{ batch: number; words: DeckWord[] }> {
  if (!settings.includeKnown) return { batch: 0, words: await getDeck(db, settings) };

  const words = await getDeck(db, settings, { offset: batch * BATCH_SIZE });
  if (words.length > 0 || batch === 0) return { batch, words };
  return { batch: 0, words: await getDeck(db, settings) };
}
