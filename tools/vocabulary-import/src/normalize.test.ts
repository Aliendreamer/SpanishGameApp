import { normalizeGender, normalizeText, posLabel } from './normalize.ts';

describe('normalizeText', () => {
  test('trims, lowercases, and composes to NFC', () => {
    expect(normalizeText('  Comer ')).toBe('comer');
    expect(normalizeText('café')).toBe('café');
    expect(normalizeText('café').normalize('NFC')).toBe(normalizeText('café'));
  });

  test('keeps accents, ñ and ü, which change meaning', () => {
    expect(normalizeText('Él')).toBe('él');
    expect(normalizeText('él')).not.toBe(normalizeText('el'));
    expect(normalizeText('sí')).not.toBe(normalizeText('si'));
    expect(normalizeText('Año')).toBe('año');
    expect(normalizeText('pingüino')).toBe('pingüino');
  });
});

describe('posLabel', () => {
  test.each([
    ['n', 'noun'],
    ['v', 'verb'],
    ['adj', 'adjective'],
    ['adv', 'adverb'],
    ['pron', 'pronoun'],
    ['prep', 'preposition'],
    ['conj', 'conjunction'],
    ['interj', 'interjection'],
    ['determiner', 'determiner'],
    ['art', 'determiner'],
    ['num', 'numeral'],
    ['contraction', 'other'],
    ['phrase', 'other'],
    ['particle', 'other'],
  ])('%s → %s', (code, label) => {
    expect(posLabel(code)).toBe(label);
  });

  test.each(['prop', 'none', 'letter', 'prefix', 'suffix', 'unknown'])(
    '%s is not vocabulary',
    (code) => {
      expect(posLabel(code)).toBeNull();
    },
  );
});

describe('normalizeGender', () => {
  test.each([
    ['m', 'm'],
    ['m-p', 'm'],
    ['m-s', 'm'],
    ['f', 'f'],
    ['f-p', 'f'],
    ['f-s', 'f'],
    ['mf', 'm/f'],
    ['mfbysense', 'm/f'],
    ['mfequiv', 'm/f'],
    ['gneut', null],
    ['?', null],
    [null, null],
  ])('%s → %s', (raw, gender) => {
    expect(normalizeGender(raw)).toBe(gender);
  });
});
