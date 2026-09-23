import { LEVELS, type Entry } from './types.ts';

const PARTS_OF_SPEECH = new Set([
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'interjection',
  'determiner',
  'numeral',
  'other',
]);

export type Validation = {
  errors: string[];
  warnings: {
    nounWithoutGender: number;
    withoutForms: number;
    withoutExamples: number;
    meaningsWithCrossReference: number;
  };
};

const isNfc = (text: string) => text === text.normalize('NFC');
// Wiktionary text the gloss cleanup could not turn into a translation.
const CROSS_REFERENCE_TEXT = /\bof "[^"]+"|\{\{/;

/** Errors fail the build; warnings are counts for the report. */
export function validate(entries: Entry[]): Validation {
  const errors: string[] = [];
  const warnings = {
    nounWithoutGender: 0,
    withoutForms: 0,
    withoutExamples: 0,
    meaningsWithCrossReference: 0,
  };
  const keys = new Set<string>();

  for (const entry of entries) {
    const at = `"${entry.key}"`;
    if (entry.spanish === '') errors.push(`${at}: empty lemma`);
    if (entry.meanings.length === 0) errors.push(`${at}: no meanings`);
    if (!PARTS_OF_SPEECH.has(entry.partOfSpeech)) {
      errors.push(`${at}: invalid part of speech "${entry.partOfSpeech}"`);
    }
    if (entry.cefr !== null && !LEVELS.includes(entry.cefr)) {
      errors.push(`${at}: invalid CEFR level "${entry.cefr}"`);
    }
    const texts = [entry.spanish, ...entry.meanings.map((meaning) => meaning.english)];
    if (!texts.every(isNfc)) errors.push(`${at}: text is not NFC`);
    if (entry.key !== `${entry.spanish}|${entry.partOfSpeech}`) {
      errors.push(`${at}: key does not match lemma|pos`);
    }
    if (keys.has(entry.key)) errors.push(`${at}: duplicate key`);
    keys.add(entry.key);

    if (entry.partOfSpeech === 'noun' && entry.gender === null) warnings.nounWithoutGender++;
    if (entry.forms.length === 0) warnings.withoutForms++;
    if (entry.examples.length === 0) warnings.withoutExamples++;
    warnings.meaningsWithCrossReference += entry.meanings.filter((meaning) =>
      CROSS_REFERENCE_TEXT.test(meaning.english),
    ).length;
  }

  return { errors, warnings };
}
