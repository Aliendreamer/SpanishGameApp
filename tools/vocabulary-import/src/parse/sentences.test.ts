import { parseSentences } from './sentences.ts';

// Rows from sentences.tsv (Doozan, Tatoeba): EN, ES, attribution, EN proficiency, ES proficiency, tags.
const TSV = [
  'Goodnight.\tQue tengas una buena noche.\tCC-BY 2.0 (France) Attribution: tatoeba.org #7822164 (sharris123) & #434827 (lukaszpp)\t6\t0\t:conj,que :v,tengas|tener :art,una|uno :adj,buena|bueno :n,noche',
  'Hopefully!\t¡Con un poco de suerte!\tCC-BY 2.0 (France) Attribution: tatoeba.org #3167761 (Theocracy) & #4554169 (swyter)\t5\t5\t:prep,con,de :phrase-art,un|uno :phrase-pron,poco :n,suerte :adv,un poco',
  "overlap: 'mi alma' || 'alma gemela'",
  '',
].join('\n');

describe('parseSentences', () => {
  const { sentences, skipped } = parseSentences(TSV);

  test('reads English, Spanish, attribution, Spanish proficiency, and file order', () => {
    expect(sentences[0]).toEqual(
      expect.objectContaining({
        english: 'Goodnight.',
        spanish: 'Que tengas una buena noche.',
        attribution:
          'CC-BY 2.0 (France) Attribution: tatoeba.org #7822164 (sharris123) & #434827 (lukaszpp)',
        spanishProficiency: 0,
        order: 0,
      }),
    );
    expect(sentences[1].order).toBe(1);
  });

  test('reads tags as POS plus lemmas, using the lemma after | when present', () => {
    expect(sentences[0].tags).toEqual([
      { pos: 'conj', lemmas: ['que'] },
      { pos: 'v', lemmas: ['tener'] },
      { pos: 'art', lemmas: ['uno'] },
      { pos: 'adj', lemmas: ['bueno'] },
      { pos: 'n', lemmas: ['noche'] },
    ]);
  });

  test('handles several words in one tag and words with spaces', () => {
    expect(sentences[1].tags).toEqual([
      { pos: 'prep', lemmas: ['con', 'de'] },
      { pos: 'phrase-art', lemmas: ['uno'] },
      { pos: 'phrase-pron', lemmas: ['poco'] },
      { pos: 'n', lemmas: ['suerte'] },
      { pos: 'adv', lemmas: ['un poco'] },
    ]);
  });

  test('skips rows that are not attributed sentence pairs, and counts them', () => {
    expect(sentences).toHaveLength(2);
    expect(skipped).toBe(1);
  });
});
