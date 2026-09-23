import type { DeckWord } from '@/vocabulary/deck';
import { answerCard, batchSummary, isMatch, startBatch } from '@/vocabulary/queue';

const word = (lemma: string): DeckWord => ({
  key: `${lemma}|noun`,
  lemma,
  article: null,
  level: 'A1',
  partOfSpeech: 'noun',
  rank: 1,
  meanings: [lemma],
  example: null,
});
const lemmas = (words: DeckWord[]) => words.map((w) => w.lemma);
const three = ['casa', 'mesa', 'silla'].map(word);

describe('batch queue', () => {
  test('starts with the dealt words in order, nothing answered', () => {
    const batch = startBatch(three);

    expect(lemmas(batch.queue)).toEqual(['casa', 'mesa', 'silla']);
    expect(batch).toEqual(expect.objectContaining({ size: 3, known: 0, learning: [] }));
  });

  test('"I know it" removes the card and counts it', () => {
    const batch = answerCard(startBatch(three), true);

    expect(lemmas(batch.queue)).toEqual(['mesa', 'silla']);
    expect(batch.known).toBe(1);
  });

  test('"Still learning" removes the card too, and records it for practice', () => {
    const batch = answerCard(startBatch(three), false);

    expect(lemmas(batch.queue)).toEqual(['mesa', 'silla']);
    expect(lemmas(batch.learning)).toEqual(['casa']);
    expect(batch.known).toBe(0);
  });

  test('one pass ends the batch; the summary counts known and still learning', () => {
    let batch = startBatch(three);
    batch = answerCard(batch, false); // casa
    batch = answerCard(batch, true); // mesa
    batch = answerCard(batch, true); // silla

    expect(batch.queue).toEqual([]);
    expect(batchSummary(batch)).toEqual({ size: 3, known: 2, learning: 1 });
  });
});

describe('isMatch', () => {
  const DEALT = 1000;

  test('a right answer on a word missed before this batch was dealt', () => {
    expect(isMatch(true, { direction: 'left', at: DEALT - 1 }, DEALT)).toBe(true);
  });

  test('not for a miss in this batch or its practise round, a first answer, or a left answer', () => {
    expect(isMatch(true, { direction: 'left', at: DEALT + 1 }, DEALT)).toBe(false);
    expect(isMatch(true, null, DEALT)).toBe(false);
    expect(isMatch(true, { direction: 'right', at: 0 }, DEALT)).toBe(false);
    expect(isMatch(false, { direction: 'left', at: 0 }, DEALT)).toBe(false);
  });
});
