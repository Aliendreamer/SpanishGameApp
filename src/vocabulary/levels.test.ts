import { bg } from '@/i18n/bg';
import { en } from '@/i18n/en';
import { levelLine, levelOptions, wordTypeOptions } from '@/vocabulary/levels';

describe('levelOptions', () => {
  test('lists the four levels with word counts from the vocabulary stats', () => {
    expect(levelOptions(en)).toEqual([
      { id: 'beginner', label: 'Beginner', detail: 'A1 + A2 · 1,142 words' },
      { id: 'intermediate', label: 'Intermediate', detail: 'B1 · 1,316 words' },
      { id: 'advanced', label: 'Advanced', detail: 'B2 · 1,603 words' },
      { id: 'full', label: 'Full', detail: 'Everything · 19,171 words' },
    ]);
  });

  test('names and counts them in Bulgarian', () => {
    const [beginner, , , full] = levelOptions(bg);

    expect(beginner).toEqual({ id: 'beginner', label: 'Начинаещ', detail: 'A1 + A2 · 1142 думи' });
    expect(full.label).toBe('Пълен');
    expect(full.detail).toMatch(/^Всичко · 19\s171 думи$/);
  });
});

describe('levelLine', () => {
  test('names the level and its CEFR bands, adding lower ones when included', () => {
    expect(levelLine({ level: 'beginner', includeLower: true }, en)).toBe('Beginner · A1, A2');
    expect(levelLine({ level: 'intermediate', includeLower: false }, en)).toBe('Intermediate · B1');
    expect(levelLine({ level: 'advanced', includeLower: true }, en)).toBe(
      'Advanced · A1, A2, B1, B2',
    );
    expect(levelLine({ level: 'full', includeLower: true }, en)).toBe('Full');
  });

  test('ends with the word type when it is not all words', () => {
    expect(levelLine({ level: 'beginner', includeLower: true, wordType: 'verb' }, en)).toBe(
      'Beginner · A1, A2 · Verbs',
    );
    expect(levelLine({ level: 'full', includeLower: true, wordType: 'noun' }, en)).toBe(
      'Full · Nouns',
    );
    expect(levelLine({ level: 'full', includeLower: true, wordType: 'all' }, en)).toBe('Full');
  });

  test('reads in Bulgarian', () => {
    expect(levelLine({ level: 'beginner', includeLower: true, wordType: 'verb' }, bg)).toBe(
      'Начинаещ · A1, A2 · Глаголи',
    );
  });
});

describe('wordTypeOptions', () => {
  test('offers all words and the three big groups, with counts from the stats', () => {
    expect(wordTypeOptions(en)).toEqual([
      { id: 'all', label: 'All words', detail: '19,171 words' },
      { id: 'noun', label: 'Nouns', detail: '11,084 words' },
      { id: 'verb', label: 'Verbs', detail: '2,940 words' },
      { id: 'adjective', label: 'Adjectives', detail: '4,195 words' },
    ]);
  });

  test('names them in Bulgarian', () => {
    expect(wordTypeOptions(bg).map(({ label }) => label)).toEqual([
      'Всички думи',
      'Съществителни',
      'Глаголи',
      'Прилагателни',
    ]);
  });
});
