import { formatNumber, plural } from '@/i18n/format';

describe('plural', () => {
  test('uses the singular for exactly 1 and the plural otherwise', () => {
    expect(plural(1, 'дума', 'думи')).toBe('дума');
    expect(plural(0, 'дума', 'думи')).toBe('думи');
    expect(plural(2, 'дума', 'думи')).toBe('думи');
    expect(plural(21, 'word', 'words')).toBe('words');
  });
});

describe('formatNumber', () => {
  test('groups thousands with a comma in English', () => {
    expect(formatNumber(1142, 'en')).toBe('1,142');
  });

  // Bulgarian groups from five digits on ("1142", "11 142").
  test('groups thousands with a space in Bulgarian', () => {
    expect(formatNumber(11142, 'bg')).toMatch(/^11\s142$/);
    expect(formatNumber(1142, 'bg')).toBe('1142');
  });
});
