import type { Entry } from './types.ts';
import { validate } from './validate.ts';

const valid = (overrides: Partial<Entry> = {}): Entry => ({
  key: 'casa|noun',
  spanish: 'casa',
  partOfSpeech: 'noun',
  posCode: 'n',
  gender: 'f',
  frequency: 0.1,
  frequencyRank: 1,
  cefr: 'A1',
  meanings: [{ english: 'house', qualifier: null }],
  forms: ['casas'],
  examples: [{ spanish: 'Mi casa.', english: 'My house.', attribution: 'CC-BY' }],
  ...overrides,
});

describe('validate', () => {
  test('passes a valid entry with no warnings', () => {
    expect(validate([valid()])).toEqual({
      errors: [],
      warnings: {
        nounWithoutGender: 0,
        withoutForms: 0,
        withoutExamples: 0,
        meaningsWithCrossReference: 0,
      },
    });
  });

  test.each([
    ['an empty lemma', { spanish: '', key: '|noun' }, /empty lemma/],
    ['no meanings', { meanings: [] }, /no meanings/],
    ['an invalid part of speech', { partOfSpeech: 'gerund', key: 'casa|gerund' }, /part of speech/],
    ['an invalid CEFR level', { cefr: 'C2' as Entry['cefr'] }, /CEFR/],
    ['text that is not NFC', { spanish: 'café', key: 'café|noun' }, /NFC/],
    ['a key that does not match lemma|pos', { key: 'house|noun' }, /key/],
  ])('fails on %s', (_name, overrides, message) => {
    expect(validate([valid(overrides)]).errors).toEqual([expect.stringMatching(message)]);
  });

  test('fails on duplicate keys', () => {
    expect(validate([valid(), valid()]).errors).toEqual([expect.stringMatching(/duplicate key/)]);
  });

  test('only warns about missing gender, forms, or examples', () => {
    const result = validate([valid({ gender: null, forms: [], examples: [] })]);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual({
      nounWithoutGender: 1,
      withoutForms: 1,
      withoutExamples: 1,
      meaningsWithCrossReference: 0,
    });
  });

  test('counts meanings that still carry cross-reference text or template markup', () => {
    const result = validate([
      valid({
        meanings: [
          { english: 'house', qualifier: null },
          { english: 'alternative form of "período" (“period”)', qualifier: null },
          { english: '{{apheretic form|es|estar}}', qualifier: null },
        ],
      }),
    ]);
    expect(result.errors).toEqual([]);
    expect(result.warnings.meaningsWithCrossReference).toBe(2);
  });
});
