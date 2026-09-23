import { ENTRIES } from '../fixtures.ts';
import { readKeys, toJson } from './json.ts';

describe('toJson', () => {
  const json = toJson(ENTRIES);

  test('is valid JSON holding every entry', () => {
    expect(JSON.parse(json)).toEqual(ENTRIES);
  });

  test('puts one entry per line so dataset updates diff readably', () => {
    expect(json.split('\n')).toHaveLength(ENTRIES.length + 3);
    expect(json.split('\n')[1]).toBe(`${JSON.stringify(ENTRIES[0])},`);
  });
});

describe('readKeys', () => {
  test('reads the keys back from a previous dataset', () => {
    expect(readKeys(toJson(ENTRIES))).toEqual(['comer|verb', 'casa|noun']);
  });
});
