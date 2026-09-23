import type { Entry } from './types.ts';

/** Small hand-made entries shared by output tests. */
export const ENTRIES: Entry[] = [
  {
    key: 'comer|verb',
    spanish: 'comer',
    partOfSpeech: 'verb',
    posCode: 'v',
    gender: null,
    frequency: 0.002,
    frequencyRank: 184,
    cefr: 'A1',
    meanings: [
      { english: 'to eat', qualifier: null },
      { english: 'to have lunch', qualifier: 'Spain' },
    ],
    forms: ['como', 'come'],
    examples: [
      { spanish: 'Vamos a comer.', english: "Let's eat.", attribution: 'CC-BY 2.0 (France) #1' },
    ],
  },
  {
    key: 'casa|noun',
    spanish: 'casa',
    partOfSpeech: 'noun',
    posCode: 'n',
    gender: 'f',
    frequency: 0.001,
    frequencyRank: 210,
    cefr: null,
    meanings: [{ english: 'house', qualifier: null }],
    forms: ['casas'],
    examples: [],
  },
];
