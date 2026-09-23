import type { DeckWord } from '@/vocabulary/deck';
import { answerCard, batchSummary, startBatch } from '@/vocabulary/queue';

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
const lemmas = (batch: ReturnType<typeof startBatch>) => batch.queue.map((w) => w.lemma);
const five = ['casa', 'mesa', 'silla', 'vaso', 'perro'].map(word);

describe('batch queue', () => {
  test('starts with the dealt words in order, nothing known', () => {
    const batch = startBatch(five);

    expect(lemmas(batch)).toEqual(['casa', 'mesa', 'silla', 'vaso', 'perro']);
    expect(batch).toEqual(expect.objectContaining({ size: 5, known: 0 }));
  });

  test('"I know it" removes the card and counts it', () => {
    const batch = answerCard(startBatch(five), true);

    expect(lemmas(batch)).toEqual(['mesa', 'silla', 'vaso', 'perro']);
    expect(batch.known).toBe(1);
  });

  test('"Still learning" puts the card back after the next 3', () => {
    const batch = answerCard(startBatch(five), false);

    expect(lemmas(batch)).toEqual(['mesa', 'silla', 'vaso', 'casa', 'perro']);
    expect(batch.known).toBe(0);
  });

  test('with fewer than 3 left, "Still learning" puts the card last', () => {
    const two = startBatch([word('casa'), word('mesa')]);

    expect(lemmas(answerCard(two, false))).toEqual(['mesa', 'casa']);
    expect(lemmas(answerCard(startBatch([word('casa')]), false))).toEqual(['casa']);
  });

  test('the summary counts first-try words and words that took a few tries', () => {
    let batch = startBatch(five.slice(0, 3));
    batch = answerCard(batch, false); // casa → back
    batch = answerCard(batch, true); // mesa
    batch = answerCard(batch, true); // silla
    batch = answerCard(batch, false); // casa again
    batch = answerCard(batch, true); // casa

    expect(batch.queue).toEqual([]);
    expect(batchSummary(batch)).toEqual({ size: 3, firstTry: 2, fewTries: 1 });
  });
});
