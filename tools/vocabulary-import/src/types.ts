// Doozan part-of-speech codes (`n`, `v`, `adj`, …) are used internally; entries carry the
// learner-facing label (`noun`, `verb`, …) produced by normalize.ts.

export type Level = 'A1' | 'A2' | 'B1' | 'B2';
export const LEVELS: readonly Level[] = ['A1', 'A2', 'B1', 'B2'];

export type Gender = 'm' | 'f' | 'm/f';

export type FrequencyRow = { lemma: string; pos: string; count: number; forms: string[] };

/** A word form and its corpus count, from es_merged_50k.txt. */
export type SurfaceCount = { word: string; count: number };

export type Gloss = { text: string; qualifier: string | null };
/** `isForm`: an inflection or misspelling entry (`{{head|es|… form}}`), not a lemma. */
export type DictionaryBlock = {
  pos: string;
  isForm: boolean;
  gender: string | null;
  glosses: Gloss[];
};
/** lemma → its `pos:` blocks, in file order */
export type Dictionary = Map<string, DictionaryBlock[]>;

export type SentenceTag = { pos: string; lemmas: string[] };
export type Sentence = {
  english: string;
  spanish: string;
  attribution: string;
  spanishProficiency: number;
  tags: SentenceTag[];
  order: number;
};

export type CefrRecord = { lemma: string; pos: string | null; level: Level };

export type Meaning = { english: string; qualifier: string | null };
export type Example = { spanish: string; english: string; attribution: string };

export type Entry = {
  key: string;
  spanish: string;
  partOfSpeech: string;
  posCode: string;
  gender: Gender | null;
  frequency: number;
  frequencyRank: number;
  cefr: Level | null;
  meanings: Meaning[];
  forms: string[];
  examples: Example[];
};

/** Live progress from a stage, e.g. `parsed 40,000 entries`. */
export type Progress = (message: string) => void;
