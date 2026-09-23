import type { ProgressDb, Settings } from '@/storage/progress-db';
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
// the order the roadmap sets for dealing batches. Words swiped before are left out unless the
// settings include known words; `offset` skips words already dealt this session.
export async function getDeck(
  db: ProgressDb,
  settings: Pick<Settings, 'level' | 'includeLower'> & Partial<Pick<Settings, 'includeKnown'>>,
  { limit = BATCH_SIZE, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<DeckWord[]> {
  const bands = deckBands(settings);
  const conditions = [
    ...(bands ? [`cefr IN (${bands.map(() => '?').join(', ')})`] : []),
    // New words only: anything swiped before (known or still learning) is left out.
    ...(settings.includeKnown ? [] : ['key NOT IN (SELECT key FROM main.swipes)']),
  ];
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.getAllAsync<WordRow>(
    `SELECT key, spanish, part_of_speech, gender, cefr, frequency_rank
     FROM vocab.vocabulary ${where}
     ORDER BY cefr IS NULL, cefr, frequency_rank
     LIMIT ? OFFSET ?`,
    [...(bands ?? []), limit, offset],
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
    article: articleFor(row.part_of_speech, row.gender),
    level: row.cefr,
    partOfSpeech: row.part_of_speech,
    rank: row.frequency_rank,
    meanings: meanings.get(row.key) ?? [],
    example: firstExample.get(row.key) ?? null,
  }));
}

// Deals batch number `batch` (0-based) of a session. Without known words, answered words drop out,
// so every batch starts from the top of what is left. With them, batches walk down the level and
// start over after its last word, rather than dealing nothing.
export async function dealBatch(
  db: ProgressDb,
  settings: Pick<Settings, 'level' | 'includeLower' | 'includeKnown'>,
  batch: number,
): Promise<{ batch: number; words: DeckWord[] }> {
  if (!settings.includeKnown) return { batch: 0, words: await getDeck(db, settings) };

  const words = await getDeck(db, settings, { offset: batch * BATCH_SIZE });
  if (words.length > 0 || batch === 0) return { batch, words };
  return { batch: 0, words: await getDeck(db, settings) };
}
