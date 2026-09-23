import { attachExamples } from './examples.ts';
import type { Entry, Sentence } from './types.ts';

const entry = (spanish: string, posCode: string, partOfSpeech: string): Entry => ({
  key: `${spanish}|${partOfSpeech}`,
  spanish,
  partOfSpeech,
  posCode,
  gender: null,
  frequency: 0,
  frequencyRank: 1,
  cefr: null,
  meanings: [{ english: 'x', qualifier: null }],
  forms: [],
  examples: [],
});

let order = 0;
const sentence = (spanish: string, tags: Sentence['tags'], spanishProficiency = 5): Sentence => ({
  english: `EN ${spanish}`,
  spanish,
  attribution: `CC-BY 2.0 (France) Attribution: tatoeba.org #${order}`,
  spanishProficiency,
  tags,
  order: order++,
});

const SENTENCES = [
  sentence('Quiero comer algo ahora mismo.', [{ pos: 'v', lemmas: ['querer', 'comer'] }]),
  sentence('Vamos a comer.', [{ pos: 'v', lemmas: ['ir', 'comer'] }], 3),
  sentence('Hay que comer.', [{ pos: 'v', lemmas: ['haber', 'comer'] }], 6),
  sentence('Comimos mucho hoy en casa.', [{ pos: 'v', lemmas: ['comer'] }]),
  sentence('El comer es bueno para todos.', [{ pos: 'n', lemmas: ['comer'] }]),
  sentence('Ya ha comido.', [{ pos: 'part-verb', lemmas: ['comer'] }]),
  sentence('Comer y beber sin parar.', [{ pos: 'phrase-v', lemmas: ['comer'] }]),
];

describe('attachExamples', () => {
  const { entries, coverage } = attachExamples(
    [entry('comer', 'v', 'verb'), entry('comer', 'n', 'noun'), entry('casa', 'n', 'noun')],
    SENTENCES,
  );
  const examples = (key: string) =>
    entries.find((e) => e.key === key)!.examples.map((example) => example.spanish);

  test('keeps the 3 shortest matches, higher Spanish proficiency first on equal length', () => {
    expect(examples('comer|verb')).toEqual(['Ya ha comido.', 'Hay que comer.', 'Vamos a comer.']);
  });

  test('matches on lemma and part of speech, participles counting as verbs', () => {
    expect(examples('comer|noun')).toEqual(['El comer es bueno para todos.']);
  });

  test('ignores phrase tags', () => {
    expect(examples('comer|verb')).not.toContain('Comer y beber sin parar.');
  });

  test('keeps English and attribution with each example', () => {
    expect(entries[1].examples[0]).toEqual({
      spanish: 'El comer es bueno para todos.',
      english: 'EN El comer es bueno para todos.',
      attribution: expect.stringMatching(/^CC-BY/),
    });
  });

  test('reports how many entries have 0–3 examples', () => {
    expect(coverage).toEqual({ 0: 1, 1: 1, 2: 0, 3: 1 });
  });
});
