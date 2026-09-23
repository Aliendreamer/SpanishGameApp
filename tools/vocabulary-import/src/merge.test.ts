import { cleanGloss, mergeEntries } from './merge.ts';
import type { Dictionary, FrequencyRow, SurfaceCount } from './types.ts';

const row = (lemma: string, pos: string, count: number, forms: string[] = []): FrequencyRow => ({
  lemma,
  pos,
  count,
  forms,
});

const gloss = (text: string, qualifier: string | null = null) => ({ text, qualifier });
const block = (
  pos: string,
  glosses: ReturnType<typeof gloss>[],
  gender: string | null = null,
  isForm = false,
) => ({
  pos,
  isForm,
  gender,
  glosses,
});

const DICTIONARY: Dictionary = new Map([
  ['casa', [block('n', [gloss('house'), gloss('home')], 'f')]],
  [
    'comer',
    [
      block('v', [
        gloss('to eat'),
        gloss('to have lunch', 'Spain'),
        gloss('to eat away, corrode', 'colloquial'),
        gloss('to devour', 'obsolete'),
        gloss('to feed', 'archaic, transitive'),
        gloss('to eat', 'intransitive'),
        gloss('to capture a piece [+ acc]', 'transitive, chess'),
        gloss('to have sexual intercourse', 'vulgar, Mexico'),
      ]),
      block('v', [gloss('inflection of "comerse"')], null, true),
      block('n', [gloss('eating, food')], 'm'),
    ],
  ],
  ['antaño', [block('adv', [gloss('long ago', 'archaic')])]],
  ['Él', [block('pron', [gloss('he')])]],
  ['no', [block('adv', [gloss('not')]), block('interj', [gloss('no')])]],
  ['buen', [block('adj', [gloss('apocopic form of "bueno"')], null, true)]],
  ['mamá', [block('n', [gloss('mum, mom')], 'f')]],
  ['Madrid', [block('prop', [gloss('Madrid')])]],
  ['iglesia', [block('n', [gloss('church')], 'f')]],
]);

// Word forms with counts (es_merged_50k.txt): catches lemmas frequency.csv leaves out.
const SURFACE: SurfaceCount[] = [
  { word: 'no', count: 900 },
  { word: 'comer', count: 800 },
  { word: 'buen', count: 400 },
  { word: 'mamá', count: 100 },
  { word: 'Madrid', count: 80 },
  { word: 'fue', count: 70 },
  { word: 'iglesia', count: 60 },
];

const ROWS = [
  row('comer', 'v', 600, ['como', 'come']),
  row('casa', 'n', 300, ['casas']),
  row('Madrid', 'prop', 50),
  row('Iglesia', 'prop', 40),
  row('comer', 'n', 20),
  row('xyz', 'none', 10),
  row('b', 'letter', 10),
  row('antaño', 'adv', 5),
  row('Él', 'pron', 5),
  row('comer', 'v', 1),
];

describe('mergeEntries', () => {
  const { entries, dropped, addedFromSurfaceList } = mergeEntries(ROWS, DICTIONARY, SURFACE);
  const byKey = new Map(entries.map((entry) => [entry.key, entry]));

  test('keeps vocabulary words, most frequent first, with lemma|pos keys', () => {
    expect(entries.map((entry) => entry.key)).toEqual([
      'no|adverb',
      'comer|verb',
      'casa|noun',
      'mamá|noun',
      'iglesia|noun',
      'comer|noun',
      'él|pronoun',
    ]);
  });

  test('adds lemmas from the word-form list that the frequency list misses', () => {
    expect(addedFromSurfaceList).toBe(3);
    expect(byKey.get('no|adverb')).toEqual(
      expect.objectContaining({ meanings: [{ english: 'not', qualifier: null }], forms: [] }),
    );
    expect(byKey.get('mamá|noun')!.gender).toBe('f');
  });

  test('adds only real lemma entries: no forms, names, or words already listed', () => {
    expect(byKey.has('buen|adjective')).toBe(false);
    expect([...byKey.keys()].some((key) => key.startsWith('madrid'))).toBe(false);
    expect(byKey.get('comer|verb')!.frequencyRank).toBe(2);
  });

  test('counts every dropped word by reason', () => {
    expect(dropped).toEqual({
      properNouns: 2,
      noDictionaryPos: 1,
      notVocabulary: 1,
      noMeanings: 1,
      duplicates: 1,
    });
  });

  test('drops obsolete and archaic meanings, keeps the rest with their qualifier, max 5', () => {
    expect(byKey.get('comer|verb')!.meanings).toEqual([
      { english: 'to eat', qualifier: null },
      { english: 'to have lunch', qualifier: 'Spain' },
      { english: 'to eat away, corrode', qualifier: 'colloquial' },
      { english: 'to capture a piece', qualifier: 'transitive, chess' },
      { english: 'to have sexual intercourse', qualifier: 'vulgar, Mexico' },
    ]);
  });

  test('takes meanings only from the block with the same part of speech', () => {
    expect(byKey.get('comer|noun')!.meanings).toEqual([
      { english: 'eating, food', qualifier: null },
    ]);
  });

  test('sets gender on nouns only', () => {
    expect(byKey.get('casa|noun')!.gender).toBe('f');
    expect(byKey.get('comer|noun')!.gender).toBe('m');
    expect(byKey.get('comer|verb')!.gender).toBeNull();
  });

  test('ranks by count and computes frequency relative to the kept words', () => {
    expect(byKey.get('no|adverb')).toEqual(
      expect.objectContaining({ frequencyRank: 1, frequency: 900 / 1985 }),
    );
    expect(byKey.get('comer|noun')!.frequencyRank).toBe(6);
  });

  test('ignores form entries when collecting meanings', () => {
    expect(byKey.get('comer|verb')!.meanings.map((m) => m.english)).not.toContain(
      'inflection of "comerse"',
    );
  });

  test('normalises the lemma and keeps forms', () => {
    expect(byKey.get('él|pronoun')!.spanish).toBe('él');
    expect(byKey.get('comer|verb')!.forms).toEqual(['como', 'come']);
  });

  test('starts entries without CEFR level or examples', () => {
    expect(entries.every((entry) => entry.cefr === null && entry.examples.length === 0)).toBe(true);
  });
});

describe('mergeEntries with a word only listed as a proper noun', () => {
  test('still adds the common noun from the word-form list', () => {
    const { entries } = mergeEntries(
      [{ lemma: 'Iglesia', pos: 'prop', count: 40, forms: [] }],
      new Map([
        [
          'iglesia',
          [
            {
              pos: 'n',
              isForm: false,
              gender: 'f',
              glosses: [{ text: 'church', qualifier: null }],
            },
          ],
        ],
      ]),
      [{ word: 'iglesia', count: 60 }],
    );
    expect(entries.map((entry) => entry.key)).toEqual(['iglesia|noun']);
  });
});

describe('mergeEntries cleans Wiktionary glosses into learner meanings', () => {
  const lemma = (pos: string, glosses: string[], isForm = false) => ({
    pos,
    isForm,
    gender: null,
    glosses: glosses.map((text) => ({ text, qualifier: null })),
  });
  const dictionary: Dictionary = new Map([
    ['muy', [lemma('adv', ['apocopic form of "mucho"; very'])]],
    [
      'perro',
      [lemma('n', ['dog (# The species Canis familiaris (sometimes C. lupus), domesticated.)'])],
    ],
    ['el', [lemma('art', ['feminine definite article used before a stressed /a/:'])]],
    ['su', [lemma('determiner', ['apocopic form of "suyo"'])]],
    ['suyo', [lemma('determiner', ['his, her, its, their, your'])]],
    ['me', [lemma('pron', ['inflection of "yo": me', 'inflection of "yo": to me, for me'])]],
    ['eso', [lemma('pron', ['neuter singular of "ése"; that'], true)]],
    ['fue', [lemma('v', ['inflection of "ser": third-person singular preterite'], true)]],
  ]);
  const { entries } = mergeEntries([], dictionary, [
    { word: 'muy', count: 90 },
    { word: 'perro', count: 80 },
    { word: 'el', count: 70 },
    { word: 'su', count: 60 },
    { word: 'me', count: 50 },
    { word: 'eso', count: 40 },
    { word: 'fue', count: 30 },
  ]);
  const meanings = (key: string) =>
    entries.find((entry) => entry.key === key)?.meanings.map((meaning) => meaning.english);

  test('keeps the English after a cross-reference', () => {
    expect(meanings('muy|adverb')).toEqual(['very']);
  });

  test('drops (# …) reference notes and trailing colons', () => {
    expect(meanings('perro|noun')).toEqual(['dog']);
    expect(meanings('el|determiner')).toEqual([
      'feminine definite article used before a stressed /a/',
    ]);
  });

  test('replaces a bare cross-reference with the target word’s meanings', () => {
    expect(meanings('su|determiner')).toEqual(['his, her, its, their, your']);
  });

  test('keeps the English of pronoun inflection glosses', () => {
    expect(meanings('me|pronoun')).toEqual(['me', 'to me, for me']);
  });

  test('admits pronoun and determiner form entries, but not verb forms', () => {
    expect(meanings('eso|pronoun')).toEqual(['that']);
    expect(entries.some((entry) => entry.spanish === 'fue')).toBe(false);
  });
});

describe('cleanGloss', () => {
  test.each([
    ['apocopic form of "mucho"; very', 'very'],
    ['to him, for him; inflection of "él"', 'to him, for him'],
    [
      'inflection of "él" and usted (when referring to a man), and a variant of ello in many constructions; him, you (formal), it, that',
      'him, you (formal), it, that',
    ],
    ['plural of "él" (“they, them”)', 'they, them'],
    ['masculine plural of "el" (the)', 'the'],
    ['alternative spelling of "ésta" (“this one”)', 'this one'],
    ['(before the noun) apocopic form of "tuyo", your', 'your'],
    ['masculine singular definite article; the', 'masculine singular definite article; the'],
    ['inflection of "yo": me', 'me'],
    ['plural of "uno": some, a few', 'some, a few'],
    ['comparative of "grande": bigger', 'bigger'],
    ['female equivalent of "chico": girl', 'girl'],
    ['apocopic form of "suyo"', 'apocopic form of "suyo"'],
    [
      'alternative case form of "Estado" (“state, nation; administration, its government”)',
      'state, nation; administration, its government',
    ],
    ['diminutive of "conejo": bunny; small rabbit', 'bunny; small rabbit'],
    ['female equivalent of "perro" (“dog”): bitch, female dog', 'bitch, female dog'],
    [
      'initialism of "inteligencia artificial" (AI (artificial intelligence))',
      'AI (artificial intelligence)',
    ],
    ['(well) into;', '(well) into'],
    ['apocopic form of "mío", my', 'my'],
  ])('%s → %s', (gloss, meaning) => {
    expect(cleanGloss(gloss)).toBe(meaning);
  });
});

describe('mergeEntries meaning edge cases', () => {
  const block = (pos: string, glosses: string[], isForm = false) => ({
    pos,
    isForm,
    gender: null,
    glosses: glosses.map((text) => ({ text, qualifier: null })),
  });

  test('drops Wiktionary template markup that was never rendered', () => {
    const { entries } = mergeEntries(
      [{ lemma: 'mayo', pos: 'n', count: 10, forms: [] }],
      new Map([['mayo', [block('n', ['{{male equivalent of|es|maya|t=Maya}}', 'May'])]]]),
    );
    expect(entries[0].meanings.map((m) => m.english)).toEqual(['May']);
  });

  test('resolves a bare cross-reference only from the same part of speech', () => {
    const { entries } = mergeEntries(
      [{ lemma: 'al', pos: 'contraction', count: 10, forms: [] }],
      new Map([
        ['al', [block('contraction', ['contraction of "el"', 'upon'])]],
        ['el', [block('art', ['the'])]],
      ]),
    );
    expect(entries[0].meanings.map((m) => m.english)).not.toContain('the');
  });

  test('gives al its meaning "to the", which the source only states as a cross-reference', () => {
    const { entries } = mergeEntries(
      [{ lemma: 'al', pos: 'contraction', count: 10, forms: [] }],
      new Map([['al', [block('contraction', ['contraction of "el"', 'upon'])]]]),
    );
    expect(entries[0].meanings.map((m) => m.english)).toEqual(['to the (a + el)', 'upon']);
  });
});

describe('mergeEntries adds word-form-list words only as a part of speech the sources agree on', () => {
  const block = (pos: string, glosses: string[], isForm = false) => ({
    pos,
    isForm,
    gender: null,
    glosses: glosses.map((text) => ({ text, qualifier: null })),
  });
  const rows: FrequencyRow[] = [
    { lemma: 'ser', pos: 'v', count: 900, forms: ['es', 'son', 'era'] },
    { lemma: 'tú', pos: 'pron', count: 800, forms: ['te', 'ti'] },
    { lemma: 'papá', pos: 'n', count: 300, forms: ['mamá'] },
    { lemma: 'mío', pos: 'determiner', count: 200, forms: ['mi'] },
    { lemma: 'mi', pos: 'n', count: 100, forms: [] },
  ];
  const dictionary: Dictionary = new Map([
    ['ser', [block('v', ['to be'])]],
    ['tú', [block('pron', ['you'])]],
    ['te', [block('n', ['letter: t']), block('pron', ['inflection of "tú": you'])]],
    ['son', [block('n', ['tone, sound']), block('v', ['inflection of "ser"'], true)]],
    ['papá', [block('n', ['dad'])]],
    ['mamá', [block('n', ['mum, mom'])]],
    ['mío', [block('determiner', ['mine'])]],
    [
      'mi',
      [block('determiner', ['apocopic form of "mío", my']), block('n', ['mu (Greek letter)'])],
    ],
    ['ay', [block('letter', ['the letter ay']), block('interj', ['ouch'])]],
  ]);
  const { entries } = mergeEntries(rows, dictionary, [
    { word: 'te', count: 700 },
    { word: 'son', count: 600 },
    { word: 'mamá', count: 250 },
    { word: 'mi', count: 150 },
    { word: 'ay', count: 50 },
  ]);
  const keys = entries.map((entry) => entry.key);

  test('uses the part of speech of the lemma a form is filed under', () => {
    expect(keys).toContain('te|pronoun');
    expect(keys).not.toContain('te|noun');
    expect(keys).toContain('mamá|noun');
    expect(keys).toContain('mi|determiner');
  });

  test('skips forms whose only matching entry is an inflection', () => {
    expect(keys.some((key) => key.startsWith('son|'))).toBe(false);
  });

  test('skips entries that are not vocabulary, such as letters, and tries the next', () => {
    expect(keys).toContain('ay|interjection');
  });
});
