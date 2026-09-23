import { parseDictionary } from './dictionary.ts';

// Excerpt of es-en.data (Doozan, Wiktionary), trimmed.
const DATA = `_____
casa
pos: n
  meta: {{es-noun|f}}
  g: f
  etymology: Inherited from Old Spanish casa.
  gloss: house
  gloss: home
_____
comer
pos: v
  meta: {{es-verb}} {{es-conj}}
  gloss: to eat
  gloss: to have lunch
    q: Spain
  gloss: to capture a piece
    q: transitive, chess, board games
pos: n
  meta: {{es-noun|m}}
  g: m
  gloss: eating, food
    syn: alimento; comida
_____
llevar
pos: v
  gloss: to take somewhere
    q: transitive, ditransitive
    _gloss: to take away or take with oneself
      q: reflexive, transitive
  gloss: to wear
`;

describe('parseDictionary', () => {
  const dictionary = parseDictionary(DATA);

  test('indexes entries by word', () => {
    expect([...dictionary.keys()]).toEqual(['casa', 'comer', 'llevar']);
  });

  test('reads gender and glosses of a block', () => {
    expect(dictionary.get('casa')).toEqual([
      {
        pos: 'n',
        isForm: false,
        gender: 'f',
        glosses: [
          { text: 'house', qualifier: null },
          { text: 'home', qualifier: null },
        ],
      },
    ]);
  });

  test('keeps several POS blocks of one word apart, with their qualifiers', () => {
    const [verb, noun] = dictionary.get('comer')!;
    expect(verb.pos).toBe('v');
    expect(verb.glosses).toEqual([
      { text: 'to eat', qualifier: null },
      { text: 'to have lunch', qualifier: 'Spain' },
      { text: 'to capture a piece', qualifier: 'transitive, chess, board games' },
    ]);
    expect(noun).toEqual({
      pos: 'n',
      isForm: false,
      gender: 'm',
      glosses: [{ text: 'eating, food', qualifier: null }],
    });
  });

  test('ignores sub-glosses and their qualifiers', () => {
    expect(dictionary.get('llevar')![0].glosses).toEqual([
      { text: 'to take somewhere', qualifier: 'transitive, ditransitive' },
      { text: 'to wear', qualifier: null },
    ]);
  });

  test('appends blocks when a word appears in several entries', () => {
    const twice = parseDictionary(
      `_____\nbanco\npos: n\n  gloss: bank\n_____\nbanco\npos: n\n  gloss: bench\n`,
    );
    expect(twice.get('banco')!.map((block) => block.glosses[0].text)).toEqual(['bank', 'bench']);
  });

  test('reports progress while parsing', () => {
    const messages: string[] = [];
    parseDictionary(DATA, (message) => messages.push(message));
    expect(messages.at(-1)).toMatch(/3 words/);
  });

  test('marks form and misspelling entries, which are not lemmas', () => {
    const forms = parseDictionary(
      [
        '_____',
        'buen',
        'pos: adj',
        '  meta: {{head|es|adjective form|g=m|apocopate||standard form|bueno}}',
        '  gloss: apocopic form of "bueno"',
        'pos: n',
        '  meta: {{head|es|past participle form}}',
        '  gloss: x',
        '_____',
        'muy',
        'pos: adv',
        '  meta: {{head|es|adverb}}',
        '  gloss: very',
        '_____',
        'haiga',
        'pos: v',
        '  meta: {{head|es|misspelling}}',
        '  gloss: misspelling of "haya"',
        '',
      ].join('\n'),
    );
    expect(forms.get('buen')!.map((block) => block.isForm)).toEqual([true, true]);
    expect(forms.get('muy')![0].isForm).toBe(false);
    expect(forms.get('haiga')![0].isForm).toBe(true);
  });
});
