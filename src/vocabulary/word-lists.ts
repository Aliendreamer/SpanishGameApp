import type { ProgressDb } from '@/storage/progress-db';
import { LATEST_SWIPES } from '@/storage/swipes';
import { ARTICLES, articleFor } from '@/vocabulary/article';

// The Words tab's lists: a word is known or still learning by its latest swipe
// (docs/design/swipe-game-ui/README.md, "Words tab").

export type WordState = 'known' | 'learning';

export type ListedWord = {
  key: string;
  lemma: string;
  article: string | null;
  // The top 3 meanings, joined by ", ".
  meanings: string;
  level: string | null;
};

const DIRECTION: Record<WordState, 'right' | 'left'> = { known: 'right', learning: 'left' };

// The article as SQL, for searching "la casa"; built from the same map as articleFor.
const ARTICLE_SQL = `CASE WHEN v.part_of_speech = 'noun' THEN CASE v.gender ${Object.entries(
  ARTICLES,
)
  .map(([gender, article]) => `WHEN '${gender}' THEN '${article}'`)
  .join(' ')} END END`;

type Row = {
  key: string;
  spanish: string;
  part_of_speech: string;
  gender: string | null;
  cefr: string | null;
  meanings: string | null;
};

export async function getWordCounts(db: ProgressDb): Promise<Record<WordState, number>> {
  const rows = await db.getAllAsync<{ direction: 'right' | 'left'; n: number }>(
    // Joined to the dictionary like the lists, so words a dictionary update removed don't count.
    `SELECT latest.direction, count(*) AS n FROM (${LATEST_SWIPES}) AS latest
     JOIN vocab.vocabulary v ON v.key = latest.key
     GROUP BY latest.direction`,
  );
  const count = (direction: 'right' | 'left') =>
    rows.find((row) => row.direction === direction)?.n ?? 0;
  return { known: count('right'), learning: count('left') };
}

// Most recently answered first. `query` matches the lemma, the article and lemma, or any English
// meaning; SQLite's LIKE ignores case for ASCII.
export async function getWordList(
  db: ProgressDb,
  state: WordState,
  query = '',
): Promise<ListedWord[]> {
  const search = query.trim();
  // % and _ are LIKE wildcards; escape them so they match themselves.
  const like = `%${search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
  const rows = await db.getAllAsync<Row>(
    `SELECT latest.key, v.spanish, v.part_of_speech, v.gender, v.cefr,
       (SELECT group_concat(english, ', ') FROM (
          SELECT english FROM vocab.translations t
          WHERE t.key = latest.key ORDER BY priority LIMIT 3)) AS meanings
     FROM (${LATEST_SWIPES}) AS latest
     JOIN vocab.vocabulary v ON v.key = latest.key
     WHERE latest.direction = ?
       ${
         search
           ? `AND (v.spanish LIKE ? ESCAPE '\\'
               OR (${ARTICLE_SQL}) || ' ' || v.spanish LIKE ? ESCAPE '\\'
               OR EXISTS (SELECT 1 FROM vocab.translations t
                          WHERE t.key = latest.key AND t.english LIKE ? ESCAPE '\\'))`
           : ''
       }
     ORDER BY latest.id DESC`,
    search ? [DIRECTION[state], like, like, like] : [DIRECTION[state]],
  );
  return rows.map((row) => ({
    key: row.key,
    lemma: row.spanish,
    article: articleFor(row.part_of_speech, row.gender),
    meanings: row.meanings ?? '',
    level: row.cefr,
  }));
}
