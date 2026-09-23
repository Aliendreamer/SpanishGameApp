import { BUNDLED_VOCABULARY, openTestDb, type TestDb } from '../../scripts/node-sqlite-db';

import { DEFAULT_SETTINGS, type Settings } from '@/storage/progress-db';
import { type DeckWord, getDeck } from '@/vocabulary/deck';

let db: TestDb;

beforeAll(async () => {
  db = openTestDb();
  // Reads only, so the bundled file itself can be attached.
  await db.runAsync('ATTACH DATABASE ? AS vocab', [BUNDLED_VOCABULARY]);
});
afterAll(() => db.close());

const settings = (changes: Partial<Settings>): Settings => ({ ...DEFAULT_SETTINGS, ...changes });
const ORDER = ['A1', 'A2', 'B1', 'B2', null];
const levelsOf = (deck: DeckWord[]) => [...new Set(deck.map((word) => word.level))];

// True when words go level by level (unlevelled last), each level in frequency order.
function isInDeckOrder(deck: DeckWord[]) {
  return deck.every((word, i) => {
    if (i === 0) return true;
    const previous = deck[i - 1];
    const byLevel = ORDER.indexOf(previous.level) - ORDER.indexOf(word.level);
    return byLevel < 0 || (byLevel === 0 && previous.rank <= word.rank);
  });
}

describe('getDeck', () => {
  test('Beginner deals 100 A1 and A2 words, A1 first, in frequency order', async () => {
    const deck = await getDeck(db, settings({ level: 'beginner' }));

    expect(deck).toHaveLength(100);
    expect(levelsOf(deck).every((level) => level === 'A1' || level === 'A2')).toBe(true);
    expect(isInDeckOrder(deck)).toBe(true);
  });

  test('Intermediate is B1 only, or A1 to B1 with lower levels', async () => {
    const onlyB1 = await getDeck(
      db,
      settings({ level: 'intermediate', includeLower: false }),
      5000,
    );
    const withLower = await getDeck(
      db,
      settings({ level: 'intermediate', includeLower: true }),
      5000,
    );

    expect(levelsOf(onlyB1)).toEqual(['B1']);
    expect(levelsOf(withLower)).toEqual(['A1', 'A2', 'B1']);
  });

  test('Full puts words without a level after all levelled words', async () => {
    const deck = await getDeck(db, settings({ level: 'full' }), 5000);

    expect(levelsOf(deck)).toEqual(['A1', 'A2', 'B1', 'B2', null]);
    expect(isInDeckOrder(deck)).toBe(true);
  });

  test('each word carries its article, part of speech, up to 3 meanings, and an example', async () => {
    const deck = await getDeck(db, settings({ level: 'beginner' }), 5000);
    const casa = deck.find((word) => word.key === 'casa|noun');

    expect(casa).toEqual(
      expect.objectContaining({
        lemma: 'casa',
        article: 'la',
        partOfSpeech: 'noun',
        level: 'A1',
        meanings: expect.arrayContaining(['house']),
        example: { spanish: expect.any(String), english: expect.any(String) },
      }),
    );
    expect(deck.every((word) => word.meanings.length >= 1 && word.meanings.length <= 3)).toBe(true);
    expect(deck.filter((word) => word.partOfSpeech !== 'noun').every((w) => !w.article)).toBe(true);
  });
});
