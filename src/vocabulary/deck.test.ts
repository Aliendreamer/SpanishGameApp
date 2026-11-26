import { BUNDLED_VOCABULARY, openTestDb, type TestDb } from '../../scripts/node-sqlite-db';

import { DEFAULT_SETTINGS, migrate, type Settings } from '@/storage/progress-db';
import { logSwipe } from '@/storage/swipes';
import { dealBatch, type DeckWord, getDeck, getWords } from '@/vocabulary/deck';

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

  test('each word carries its article, part of speech, up to 3 meanings, and its examples', async () => {
    const deck = await getDeck(db, settings({ level: 'beginner' }), { limit: 5000 });
    const casa = deck.find((word) => word.key === 'casa|noun');

    expect(casa).toEqual(
      expect.objectContaining({
        lemma: 'casa',
        article: 'la',
        partOfSpeech: 'noun',
        level: 'A1',
        meanings: expect.arrayContaining(['house']),
      }),
    );
    expect(deck.every((word) => word.meanings.length >= 1 && word.meanings.length <= 3)).toBe(true);
    expect(deck.filter((word) => word.partOfSpeech !== 'noun').every((w) => !w.article)).toBe(true);
  });

  test('each word carries up to 3 examples in priority order, or none', async () => {
    const [casa, ella] = await getWords(db, ['casa|noun', 'ella|pronoun']);
    const stored = await db.getAllAsync<{ spanish: string; english: string }>(
      "SELECT spanish, english FROM vocab.examples WHERE key = 'casa|noun' ORDER BY priority",
    );

    expect(stored).toHaveLength(3);
    expect(casa.examples).toEqual(stored);
    expect(ella.examples).toEqual([]);
  });

  test('leaves out known words unless known words are included, which keeps the order', async () => {
    const [first, second] = await getDeck(db, settings({ level: 'advanced' }));
    await logSwipe(db, first.key, true);
    await logSwipe(db, second.key, false);

    const without = await getDeck(db, settings({ level: 'advanced' }));
    const withKnown = await getDeck(db, settings({ level: 'advanced', includeKnown: true }));

    expect(without.map((word) => word.key)).not.toContain(first.key);
    expect(withKnown.slice(0, 2).map((word) => word.key)).toEqual([first.key, second.key]);
  });

  describe('words still being learned', () => {
    const VERBS = settings({ level: 'advanced', includeLower: false, wordType: 'verb' });
    let own: TestDb;
    // Every B2 verb, in deck order.
    let all: string[];
    const keysDealt = async () => (await getDeck(own, VERBS)).map((word) => word.key);
    const swipeAll = async (keys: string[], knowIt: boolean) => {
      for (const key of keys) await logSwipe(own, key, knowIt);
    };

    beforeEach(async () => {
      own = openTestDb();
      await migrate(own);
      await own.runAsync('ATTACH DATABASE ? AS vocab', [BUNDLED_VOCABULARY]);
      all = (await getDeck(own, VERBS, { limit: 10_000 })).map((word) => word.key);
    });
    afterEach(() => own.close());

    test('wait until fewer than 100 new words are left', async () => {
      await swipeAll(all.slice(0, 2), false);

      expect(await keysDealt()).toEqual(all.slice(2, 102));
    });

    test('top up a short batch after the new words, in deck order', async () => {
      const learning = all.slice(0, 10);
      await swipeAll([...learning].reverse(), false);
      await swipeAll(all.slice(10, -40), true);

      expect(await keysDealt()).toEqual([...all.slice(-40), ...learning]);
    });

    test('make a batch alone once no new words are left', async () => {
      await swipeAll(all.slice(1), true);
      await swipeAll(all.slice(0, 1), false);

      expect(await keysDealt()).toEqual(all.slice(0, 1));
    });

    test('go by the latest swipe: known again is left out', async () => {
      await swipeAll(all, true);
      await logSwipe(own, all[0], false);
      await logSwipe(own, all[0], true);

      expect(await keysDealt()).toEqual([]);
    });
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

describe('getWords', () => {
  test('loads words by key in the order given, as the deck deals them', async () => {
    const deck = await getDeck(db, settings({}), { limit: 5 });
    const order = [deck[3], deck[0], deck[4]];

    expect(
      await getWords(
        db,
        order.map((word) => word.key),
      ),
    ).toEqual(order);
  });

  test('leaves out words the dictionary does not have', async () => {
    expect(await getWords(db, ['nosuchword|noun'])).toEqual([]);
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
