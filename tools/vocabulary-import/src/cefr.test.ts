import { applyCefr } from './cefr.ts';
import type { CefrRecord, Entry } from './types.ts';

const entry = (spanish: string, posCode: string, partOfSpeech: string): Entry => ({
  key: `${spanish}|${partOfSpeech}`,
  spanish,
  partOfSpeech,
  posCode,
  gender: null,
  frequency: 0,
  frequencyRank: 1,
  cefr: null,
  meanings: [{ english: 'x', qualifier: null }],
  forms: [],
  examples: [],
});

const ENTRIES = [
  entry('desarrollar', 'v', 'verb'),
  entry('casa', 'n', 'noun'),
  entry('banco', 'n', 'noun'),
  entry('comer', 'n', 'noun'),
];

const RECORDS: CefrRecord[] = [
  { lemma: 'desarrollar', pos: 'v', level: 'B1' },
  { lemma: 'casa', pos: 'n', level: 'A1' },
  { lemma: 'casa', pos: 'n', level: 'A1' },
  { lemma: 'banco', pos: 'n', level: 'A1' },
  { lemma: 'banco', pos: 'n', level: 'B1' },
  { lemma: 'comer', pos: 'v', level: 'A1' },
  { lemma: 'entraron', pos: null, level: 'B2' },
  { lemma: 'nada', pos: 'pron', level: 'A1' },
];

describe('applyCefr', () => {
  const { entries, report } = applyCefr(ENTRIES, RECORDS);
  const level = (key: string) => entries.find((e) => e.key === key)!.cefr;

  test('sets the level when lemma and part of speech match one level', () => {
    expect(level('desarrollar|verb')).toBe('B1');
    expect(level('casa|noun')).toBe('A1');
  });

  test('leaves conflicting levels empty and lists them as ambiguous', () => {
    expect(level('banco|noun')).toBeNull();
    expect(report.ambiguous).toEqual(['banco|noun']);
  });

  test('does not match on text alone', () => {
    expect(level('comer|noun')).toBeNull();
  });

  test('reports the match statistics', () => {
    expect(report).toEqual({
      enabled: true,
      records: 8,
      withoutPos: 1,
      matchedEntries: 2,
      unmatchedRecords: 2,
      ambiguous: ['banco|noun'],
    });
  });

  test('without CEFR data every level stays empty', () => {
    const off = applyCefr(ENTRIES, null);
    expect(off.entries.every((e) => e.cefr === null)).toBe(true);
    expect(off.report).toEqual({
      enabled: false,
      records: 0,
      withoutPos: 0,
      matchedEntries: 0,
      unmatchedRecords: 0,
      ambiguous: [],
    });
  });
});

describe('applyCefr matches on the learner part of speech', () => {
  const entries = [
    entry('el', 'art', 'determiner'),
    entry('mío', 'determiner', 'determiner'),
    entry('comer', 'v', 'verb'),
  ];
  const { entries: leveled } = applyCefr(entries, [
    { lemma: 'el', pos: 'determiner', level: 'A1' },
    { lemma: 'mío', pos: 'pron', level: 'A2' },
    { lemma: 'comer', pos: 'n', level: 'B1' },
  ]);
  const level = (key: string) => leveled.find((e) => e.key === key)!.cefr;

  test('an article labelled Determiner in the CEFR data matches the article', () => {
    expect(level('el|determiner')).toBe('A1');
  });

  test('possessives tagged pronoun in the CEFR data match the determiner', () => {
    expect(level('mío|determiner')).toBe('A2');
  });

  test('other parts of speech still have to agree', () => {
    expect(level('comer|verb')).toBeNull();
  });
});
