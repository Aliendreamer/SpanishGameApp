import { articleFor } from '@/vocabulary/article';

describe('articleFor', () => {
  test('nouns take el, la, or el/la from their gender', () => {
    expect(articleFor('noun', 'm')).toBe('el');
    expect(articleFor('noun', 'f')).toBe('la');
    expect(articleFor('noun', 'm/f')).toBe('el/la');
  });

  test('other words, and nouns without a gender, take none', () => {
    expect(articleFor('verb', 'm')).toBeNull();
    expect(articleFor('noun', null)).toBeNull();
  });
});
