import type { DeckWord } from '@/vocabulary/deck';
import { answerCard, answeredCount, batchSummary, isMatch, type Round } from '@/vocabulary/queue';

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

const firstRound = (words: DeckWord[]): Round => ({
  queue: words,
  size: words.length,
  batchSize: words.length,
  learned: 0,
});

describe('round', () => {
  test('"I know it" removes the card and counts it as learned in the batch', () => {
    const round = answerCard(firstRound(three), true);

    expect(lemmas(round.queue)).toEqual(['mesa', 'silla']);
    expect(round.learned).toBe(1);
  });

  test('"Still learning" removes the card too, without learning it', () => {
    const round = answerCard(firstRound(three), false);

    expect(lemmas(round.queue)).toEqual(['mesa', 'silla']);
    expect(round.learned).toBe(0);
  });

  test('every answer counts toward the round', () => {
    const round = answerCard(answerCard(firstRound(three), true), false);

    expect(answeredCount(round)).toBe(2);
    expect(round.size).toBe(3);
  });

  test('carries on from where it was resumed', () => {
    const resumed: Round = { queue: three.slice(1), size: 3, batchSize: 10, learned: 7 };

    expect(answeredCount(resumed)).toBe(1);
    expect(answeredCount(answerCard(resumed, true))).toBe(2);
  });

  test('one pass ends it; the summary counts the whole batch over its rounds', () => {
    let round: Round = { queue: three, size: 3, batchSize: 10, learned: 7 };
    round = answerCard(round, false); // casa
    round = answerCard(round, true); // mesa
    round = answerCard(round, true); // silla

    expect(round.queue).toEqual([]);
    expect(batchSummary(round)).toEqual({ size: 10, known: 9, learning: 1 });
  });

  test('an answer with no card left changes nothing', () => {
    const over: Round = { queue: [], size: 3, batchSize: 3, learned: 3 };

    expect(answerCard(over, true)).toEqual(over);
  });
});

describe('isMatch', () => {
  const DEALT = 1000;

  test('a right answer on a word missed before this batch was dealt', () => {
    expect(isMatch(true, { direction: 'left', at: DEALT - 1 }, DEALT)).toBe(true);
  });

  test('not for a miss in this batch or a later round of it, a first answer, or a left answer', () => {
    expect(isMatch(true, { direction: 'left', at: DEALT + 1 }, DEALT)).toBe(false);
    expect(isMatch(true, null, DEALT)).toBe(false);
    expect(isMatch(true, { direction: 'right', at: 0 }, DEALT)).toBe(false);
    expect(isMatch(false, { direction: 'left', at: 0 }, DEALT)).toBe(false);
  });
});
