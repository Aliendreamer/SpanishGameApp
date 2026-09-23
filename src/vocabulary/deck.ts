import type { ProgressDb, Settings } from '@/storage/progress-db';
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

const ARTICLES: Record<string, string> = { m: 'el', f: 'la', 'm/f': 'el/la' };

// Words for the saved level settings: level by level (unlevelled last), each level in frequency
// order — the order the roadmap sets for dealing batches.
export async function getDeck(
  db: ProgressDb,
  settings: Pick<Settings, 'level' | 'includeLower'>,
  limit = BATCH_SIZE,
): Promise<DeckWord[]> {
  const bands = deckBands(settings);
  const where = bands ? `WHERE cefr IN (${bands.map(() => '?').join(', ')})` : '';
  const rows = await db.getAllAsync<WordRow>(
    `SELECT key, spanish, part_of_speech, gender, cefr, frequency_rank
     FROM vocab.vocabulary ${where}
     ORDER BY cefr IS NULL, cefr, frequency_rank
     LIMIT ?`,
    [...(bands ?? []), limit],
  );
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
    article: row.part_of_speech === 'noun' && row.gender ? (ARTICLES[row.gender] ?? null) : null,
    level: row.cefr,
    partOfSpeech: row.part_of_speech,
    rank: row.frequency_rank,
    meanings: meanings.get(row.key) ?? [],
    example: firstExample.get(row.key) ?? null,
  }));
}
