import { parseSurfaceCounts } from './surface.ts';

describe('parseSurfaceCounts', () => {
  test('reads word and count per line, in file order', () => {
    expect(parseSurfaceCounts('de\t24459038\nno\t13845008\n\n')).toEqual([
      { word: 'de', count: 24459038 },
      { word: 'no', count: 13845008 },
    ]);
  });

  test('fails on a malformed line', () => {
    expect(() => parseSurfaceCounts('de\tmany\n')).toThrow(/line 1/);
  });
});
