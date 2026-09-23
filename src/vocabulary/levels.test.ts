import { LEVELS, levelLine } from '@/vocabulary/levels';

describe('LEVELS', () => {
  test('lists the four levels with word counts from the vocabulary stats', () => {
    expect(LEVELS.map(({ id, label, detail }) => ({ id, label, detail }))).toEqual([
      { id: 'beginner', label: 'Beginner', detail: 'A1 + A2 · 1,142 words' },
      { id: 'intermediate', label: 'Intermediate', detail: 'B1 · 1,316 words' },
      { id: 'advanced', label: 'Advanced', detail: 'B2 · 1,603 words' },
      { id: 'full', label: 'Full', detail: 'Everything · 19,171 words' },
    ]);
  });
});

describe('levelLine', () => {
  test('names the level and its CEFR bands, adding lower ones when included', () => {
    expect(levelLine({ level: 'beginner', includeLower: true })).toBe('Beginner · A1, A2');
    expect(levelLine({ level: 'intermediate', includeLower: false })).toBe('Intermediate · B1');
    expect(levelLine({ level: 'advanced', includeLower: true })).toBe('Advanced · A1, A2, B1, B2');
    expect(levelLine({ level: 'full', includeLower: true })).toBe('Full');
  });
});
