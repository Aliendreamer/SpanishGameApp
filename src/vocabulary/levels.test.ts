import { LEVELS } from '@/vocabulary/levels';

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
