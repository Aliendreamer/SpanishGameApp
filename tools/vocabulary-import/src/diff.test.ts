import { diffKeys } from './diff.ts';

describe('diffKeys', () => {
  test('lists removed keys and counts added ones', () => {
    expect(
      diffKeys(['casa|noun', 'comer|verb', 'antaño|adverb'], ['casa|noun', 'perro|noun']),
    ).toEqual({
      hadPrevious: true,
      added: 1,
      removed: ['antaño|adverb', 'comer|verb'],
    });
  });

  test('handles a first build without a previous dataset', () => {
    expect(diffKeys(null, ['casa|noun'])).toEqual({ hadPrevious: false, added: 1, removed: [] });
  });
});
