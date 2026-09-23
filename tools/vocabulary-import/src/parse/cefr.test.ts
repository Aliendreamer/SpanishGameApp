import { parseCefr } from './cefr.ts';

const record = (lemma: string, pos: string | null, cefr_level: string) => ({
  id: 'x',
  lemma,
  language: 'es',
  cefr_level,
  pos,
  definition_target: null,
});

describe('parseCefr', () => {
  const records = parseCefr([
    {
      level: 'A1',
      json: JSON.stringify([record('Él', 'pron', 'A1'), record('casa', 'noun', 'A1')]),
    },
    { level: 'B1', json: JSON.stringify([record('desarrollar', 'Verb', 'B1')]) },
    { level: 'B2', json: JSON.stringify([record('entraron', null, 'B2')]) },
  ]);

  test('normalises lemmas and maps POS labels to Doozan codes', () => {
    expect(records).toEqual([
      { lemma: 'él', pos: 'pron', level: 'A1' },
      { lemma: 'casa', pos: 'n', level: 'A1' },
      { lemma: 'desarrollar', pos: 'v', level: 'B1' },
      { lemma: 'entraron', pos: null, level: 'B2' },
    ]);
  });

  test.each([
    ['Adjective', 'adj'],
    ['adj', 'adj'],
    ['Adverb', 'adv'],
    ['Article', 'art'],
    ['Determiner', 'determiner'],
    ['det', 'determiner'],
    ['Interjection', 'interj'],
    ['Numeral', 'num'],
    ['Preposition', 'prep'],
    ['conj', 'conj'],
    ['Propernoun', 'prop'],
    ['Participle', null],
  ])('POS %s → %s', (label, code) => {
    const [parsed] = parseCefr([{ level: 'A1', json: JSON.stringify([record('x', label, 'A1')]) }]);
    expect(parsed.pos).toBe(code);
  });

  test('takes the level from the file, not the record', () => {
    const [parsed] = parseCefr([
      { level: 'A2', json: JSON.stringify([record('x', 'noun', 'A1')]) },
    ]);
    expect(parsed.level).toBe('A2');
  });
});
