import { BUNDLED_VOCABULARY, openTestDb, type TestDb } from '../../scripts/node-sqlite-db';

import { DEFAULT_SETTINGS, migrate, type Settings } from '@/storage/progress-db';
import { logSwipe } from '@/storage/swipes';
import { dealBatch, type DeckWord, getDeck } from '@/vocabulary/deck';

let db: TestDb;

beforeAll(async () => {
  db = openTestDb();
  await migrate(db);
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
    const onlyB1 = await getDeck(db, settings({ level: 'intermediate', includeLower: false }), {
      limit: 5000,
    });
    const withLower = await getDeck(db, settings({ level: 'intermediate', includeLower: true }), {
      limit: 5000,
    });

    expect(levelsOf(onlyB1)).toEqual(['B1']);
    expect(levelsOf(withLower)).toEqual(['A1', 'A2', 'B1']);
  });

  test('Full puts words without a level after all levelled words', async () => {
    const deck = await getDeck(db, settings({ level: 'full' }), { limit: 5000 });

    expect(levelsOf(deck)).toEqual(['A1', 'A2', 'B1', 'B2', null]);
    expect(isInDeckOrder(deck)).toBe(true);
  });

  test('each word carries its article, part of speech, up to 3 meanings, and an example', async () => {
    const deck = await getDeck(db, settings({ level: 'beginner' }), { limit: 5000 });
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

  test('leaves out every swiped word, known or still learning, unless known words are included', async () => {
    const [first, second] = await getDeck(db, settings({ level: 'advanced' }));
    await logSwipe(db, first.key, true);
    await logSwipe(db, second.key, false);

    const without = await getDeck(db, settings({ level: 'advanced' }));
    const withKnown = await getDeck(db, settings({ level: 'advanced', includeKnown: true }));

    expect(without.map((word) => word.key)).not.toContain(first.key);
    expect(without.map((word) => word.key)).not.toContain(second.key);
    expect(withKnown.slice(0, 2).map((word) => word.key)).toEqual([first.key, second.key]);
  });

  test('deals only the chosen word type, or every type for all words', async () => {
    const verbs = await getDeck(db, settings({ level: 'beginner', wordType: 'verb' }), {
      limit: 5000,
    });
    const all = await getDeck(db, settings({ level: 'beginner' }), { limit: 5000 });

    expect(verbs.length).toBeGreaterThan(0);
    expect(verbs.every((word) => word.partOfSpeech === 'verb')).toBe(true);
    expect(isInDeckOrder(verbs)).toBe(true);
    expect(
      ['noun', 'verb', 'adjective'].every((pos) => all.some((w) => w.partOfSpeech === pos)),
    ).toBe(true);
  });

  test('an offset continues where the previous batch ended', async () => {
    const two = await getDeck(db, settings({ level: 'intermediate' }), { limit: 200 });
    const second = await getDeck(db, settings({ level: 'intermediate' }), { offset: 100 });

    expect(second.map((word) => word.key)).toEqual(two.slice(100).map((word) => word.key));
  });
});

describe('dealBatch', () => {
  test('without known words, always deals from the start of what is left', async () => {
    const deal = await dealBatch(db, settings({ level: 'advanced' }), 3);

    expect(deal.batch).toBe(0);
    expect(deal.words[0].key).toBe((await getDeck(db, settings({ level: 'advanced' })))[0].key);
  });

  test('with known words, continues after the previous batch', async () => {
    const deal = await dealBatch(db, settings({ level: 'intermediate', includeKnown: true }), 1);
    const two = await getDeck(db, settings({ level: 'intermediate', includeKnown: true }), {
      limit: 200,
    });

    expect(deal.batch).toBe(1);
    expect(deal.words[0].key).toBe(two[100].key);
  });

  test('with known words, starts over after the last batch of the level', async () => {
    const all = settings({ level: 'intermediate', includeKnown: true });

    const deal = await dealBatch(db, all, 999);

    expect(deal.batch).toBe(0);
    expect(deal.words[0].key).toBe((await getDeck(db, all))[0].key);
  });
});
