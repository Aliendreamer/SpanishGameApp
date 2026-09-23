import { BUNDLED_VOCABULARY, openTestDb, type TestDb } from '../../scripts/node-sqlite-db';

import { migrate } from '@/storage/progress-db';
import { logSwipe } from '@/storage/swipes';
import { getWordCounts, getWordList } from '@/vocabulary/word-lists';

let db: TestDb;

beforeEach(async () => {
  db = openTestDb();
  await migrate(db);
  await db.runAsync('ATTACH DATABASE ? AS vocab', [BUNDLED_VOCABULARY]);
  // perro is still learning; casa then mesa are known (mesa most recently).
  await logSwipe(db, 'casa|noun', false, 1);
  await logSwipe(db, 'perro|noun', false, 2);
  await logSwipe(db, 'casa|noun', true, 3);
  await logSwipe(db, 'mesa|noun', true, 4);
});
afterEach(() => db.close());

const lemmas = (rows: { lemma: string }[]) => rows.map((row) => row.lemma);

describe('word lists', () => {
  test('counts known and still-learning words by their latest swipe', async () => {
    expect(await getWordCounts(db)).toEqual({ known: 2, learning: 1 });
  });

  test('lists each state, most recently answered first', async () => {
    expect(lemmas(await getWordList(db, 'known'))).toEqual(['mesa', 'casa']);
    expect(lemmas(await getWordList(db, 'learning'))).toEqual(['perro']);
  });

  test('each row has the article, the meanings joined, and the level', async () => {
    const [mesa] = await getWordList(db, 'known');

    expect(mesa).toEqual({
      key: 'mesa|noun',
      lemma: 'mesa',
      article: 'la',
      meanings: 'table, dinner table, mesa',
      level: 'A1',
    });
  });

  test('search matches the lemma, article and lemma, or an English meaning, ignoring case', async () => {
    expect(lemmas(await getWordList(db, 'known', 'MES'))).toEqual(['mesa']);
    expect(lemmas(await getWordList(db, 'known', 'la casa'))).toEqual(['casa']);
    expect(lemmas(await getWordList(db, 'known', 'house'))).toEqual(['casa']);
    expect(lemmas(await getWordList(db, 'known', 'zzz'))).toEqual([]);
  });

  test('counts leave out words no longer in the dictionary, like the lists do', async () => {
    await logSwipe(db, 'removedword|noun', true);

    expect(await getWordCounts(db)).toEqual({ known: 2, learning: 1 });
  });

  test('% and _ in a search are literal characters, not wildcards', async () => {
    expect(await getWordList(db, 'known', '_')).toEqual([]);
    expect(await getWordList(db, 'known', '%')).toEqual([]);
  });
});
