import { normalizeGender, normalizeText, posLabel } from './normalize.ts';
import type {
  Dictionary,
  DictionaryBlock,
  Entry,
  FrequencyRow,
  Gloss,
  Meaning,
  SurfaceCount,
} from './types.ts';

export const MAX_MEANINGS = 5;
// No longer used in Spanish; everything else (colloquial, vulgar, regional…) is current usage.
const OUT_OF_USE = /\b(obsolete|archaic)\b/i;

/** Why a frequency-list word is not in the dataset, with its label for summaries and the report. */
export const DROP_REASONS = {
  properNouns: 'proper nouns',
  noDictionaryPos: 'no dictionary part of speech',
  notVocabulary: 'not vocabulary (letters, prefixes…)',
  noMeanings: 'no English meaning',
  duplicates: 'duplicate lemma|pos',
} as const;
export type DropReason = keyof typeof DROP_REASONS;
export type Dropped = Record<DropReason, number>;

// Wiktionary glosses that point at another word (`…form of "mucho"`) rather than translate.
const CROSS_REFERENCE = /\bof "[^"]+"/;
// Parenthesised text, allowing one level of nesting: (AI (artificial intelligence)).
const PARENS = String.raw`\((?:[^()]|\([^()]*\))*\)`;
const ENGLISH_AFTER_COLON = new RegExp(String.raw`\bof "[^"]+"(?:\s*${PARENS})?:\s*(.+)$`); // plural of "uno": some
const ENGLISH_IN_PARENTHESES = new RegExp(String.raw`\bof "[^"]+"\s*\(((?:[^()]|\([^()]*\))*)\)$`); // plural of "él" (“they”)
const ENGLISH_AFTER_COMMA = /\bof "[^"]+",\s*(.+)$/; // apocopic form of "tuyo", your
const BARE_CROSS_REFERENCE = /^[^";:]*\bof "([^"]+)"\.?$/; // apocopic form of "suyo"

// The source only states these as cross-references (`contraction of "el"`).
const MEANING_OVERRIDES: Record<string, Meaning[]> = {
  'al|contraction': [{ english: 'to the (a + el)', qualifier: null }],
};

/** Removes `(# …)` reference notes, which may contain nested parentheses. */
function removeReferenceNotes(text: string): string {
  let result = '';
  let index = 0;
  while (index < text.length) {
    if (!text.startsWith('(#', index)) {
      result += text[index++];
      continue;
    }
    let depth = 0;
    for (; index < text.length; index++) {
      if (text[index] === '(') depth++;
      else if (text[index] === ')' && --depth === 0) {
        index++;
        break;
      }
    }
  }
  return result;
}

/** Splits on `;` outside parentheses and “quotes”, so translations like (“a; b”) stay whole. */
function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of text) {
    if (char === '(' || char === '“') depth++;
    else if ((char === ')' || char === '”') && depth > 0) depth--;
    if (char === ';' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += char;
  }
  parts.push(current.trim());
  return parts.filter(Boolean);
}

/** The English in one gloss part, or null when the part only points at another word. */
function englishOf(part: string): string | null {
  const english =
    ENGLISH_AFTER_COLON.exec(part)?.[1] ??
    ENGLISH_IN_PARENTHESES.exec(part)?.[1]?.replace(/^“|”$/g, '') ??
    ENGLISH_AFTER_COMMA.exec(part)?.[1];
  if (english !== undefined) return english.trim();
  return CROSS_REFERENCE.test(part) ? null : part;
}

/** Turns a Wiktionary gloss into a learner-facing meaning. */
export function cleanGloss(text: string): string {
  const gloss = removeReferenceNotes(text.replace(/\s*\[[^\]]*\]/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
  const english = splitTopLevel(gloss)
    .map(englishOf)
    .filter((part): part is string => part !== null);
  // A gloss that is only a cross-reference is returned as-is, for the caller to resolve.
  return (english.length > 0 ? english.join('; ') : gloss).replace(/[:;]$/, '').trim();
}

function meaningsFrom(
  glosses: Gloss[],
  resolve: (lemma: string) => Gloss[],
  overrides: Meaning[] = [],
): Meaning[] {
  const seen = new Set<string>();
  const meanings: Meaning[] = [];
  const add = (english: string, qualifier: string | null) => {
    if (english === '' || english.includes('{{') || seen.has(english.toLowerCase())) return;
    seen.add(english.toLowerCase());
    meanings.push({ english, qualifier });
  };
  for (const { english, qualifier } of overrides) add(english, qualifier);
  for (const { text, qualifier } of glosses) {
    if (qualifier && OUT_OF_USE.test(qualifier)) continue;
    const english = cleanGloss(text);
    const target = BARE_CROSS_REFERENCE.exec(english)?.[1];
    if (target === undefined) add(english, qualifier);
    else {
      // "apocopic form of "suyo"" has no English of its own: use the target word's meanings.
      for (const resolved of resolve(target)) {
        if (resolved.qualifier && OUT_OF_USE.test(resolved.qualifier)) continue;
        const resolvedEnglish = cleanGloss(resolved.text);
        if (!BARE_CROSS_REFERENCE.test(resolvedEnglish)) add(resolvedEnglish, resolved.qualifier);
      }
    }
    if (meanings.length >= MAX_MEANINGS) break;
  }
  return meanings.slice(0, MAX_MEANINGS);
}

// Closed-class words Wiktionary files as forms (eso, esto, aquella) are words in their own right.
const WORD_LIKE_FORMS = new Set(['pron', 'determiner']);

type Candidate = {
  lemma: string;
  pos: string;
  count: number;
  forms: string[];
  fromFormEntry?: boolean;
};

/**
 * Builds entries from two word lists. frequency.csv gives lemmas with POS and forms, but folds
 * or omits some very common words (no, muy, iglesia, mamá); es_merged_50k.txt adds every word
 * form that is itself a dictionary lemma (first non-form POS) and is not already listed. Each
 * entry needs at least one current English meaning; entries are ranked by count.
 */
export function mergeEntries(
  rows: FrequencyRow[],
  dictionary: Dictionary,
  surface: SurfaceCount[] = [],
): { entries: Entry[]; dropped: Dropped; addedFromSurfaceList: number } {
  const dropped: Dropped = {
    properNouns: 0,
    noDictionaryPos: 0,
    notVocabulary: 0,
    noMeanings: 0,
    duplicates: 0,
  };
  const lemmaBlocks = (lemma: string, pos: string, allowForms = false): DictionaryBlock[] =>
    (dictionary.get(lemma) ?? []).filter(
      (block) => block.pos === pos && (allowForms || !block.isForm),
    );
  // Resolve only within the same part of speech: `contraction of "el"` must not borrow the
  // article's meanings.
  const resolveFor =
    (pos: string) =>
    (target: string): Gloss[] =>
      (dictionary.get(target) ?? [])
        .filter((block) => !block.isForm && block.pos === pos)
        .flatMap((block) => block.glosses);

  const keys = new Set<string>();
  const kept: (Candidate & {
    meanings: Meaning[];
    blocks: DictionaryBlock[];
    key: string;
    partOfSpeech: string;
  })[] = [];
  /** Keeps the candidate, or returns why it was not kept; each caller decides what to count. */
  const keep = (candidate: Candidate): 'kept' | DropReason => {
    const partOfSpeech = posLabel(candidate.pos);
    if (partOfSpeech === null) return 'notVocabulary';
    const blocks = lemmaBlocks(candidate.lemma, candidate.pos, candidate.fromFormEntry);
    const meanings = meaningsFrom(
      blocks.flatMap((block) => block.glosses),
      resolveFor(candidate.pos),
      MEANING_OVERRIDES[`${normalizeText(candidate.lemma)}|${candidate.pos}`],
    );
    if (meanings.length === 0) return 'noMeanings';
    const key = `${normalizeText(candidate.lemma)}|${partOfSpeech}`;
    if (keys.has(key)) return 'duplicates';
    keys.add(key);
    kept.push({ ...candidate, meanings, blocks, key, partOfSpeech });
    return 'kept';
  };

  for (const row of rows) {
    if (row.pos === 'prop') dropped.properNouns++;
    else if (row.pos === 'none') dropped.noDictionaryPos++;
    else {
      const outcome = keep(row);
      if (outcome !== 'kept') dropped[outcome]++;
    }
  }

  // A word-form-list word filed in frequency.csv as a form of a kept lemma (mamá under papá, te
  // under tú, son under ser) is only added as that lemma's part of speech: mamá stays a noun,
  // te becomes the pronoun (not "letter: t"), and son — only a verb form there — is skipped.
  const filedUnder = new Map<string, Set<string>>();
  for (const candidate of kept) {
    for (const form of [candidate.lemma, ...candidate.forms]) {
      const word = normalizeText(form);
      filedUnder.set(word, (filedUnder.get(word) ?? new Set()).add(candidate.pos));
    }
  }

  let addedFromSurfaceList = 0;
  for (const { word, count } of surface) {
    const parents = filedUnder.get(normalizeText(word));
    const eligible = (dictionary.get(word) ?? []).filter(
      (block) =>
        block.pos !== 'prop' &&
        (!block.isForm || WORD_LIKE_FORMS.has(block.pos)) &&
        (parents === undefined || parents.has(block.pos)),
    );
    // Try entries in dictionary order; ones that are not vocabulary (letters) or have no usable
    // meaning are passed over.
    for (const block of eligible) {
      const outcome = keep({
        lemma: word,
        pos: block.pos,
        count,
        forms: [],
        fromFormEntry: block.isForm,
      });
      if (outcome === 'kept') {
        addedFromSurfaceList++;
        break;
      }
      if (outcome === 'duplicates') break;
    }
  }

  const total = kept.reduce((sum, candidate) => sum + candidate.count, 0);
  const entries = kept
    .map((candidate, order) => ({ candidate, order }))
    .sort((a, b) => b.candidate.count - a.candidate.count || a.order - b.order)
    .map(({ candidate }, index): Entry => ({
      key: candidate.key,
      spanish: normalizeText(candidate.lemma),
      partOfSpeech: candidate.partOfSpeech,
      posCode: candidate.pos,
      gender:
        candidate.partOfSpeech === 'noun'
          ? normalizeGender(candidate.blocks.find((block) => block.gender)?.gender ?? null)
          : null,
      frequency: candidate.count / total,
      frequencyRank: index + 1,
      cefr: null,
      meanings: candidate.meanings,
      forms: candidate.forms,
      examples: [],
    }));

  return { entries, dropped, addedFromSurfaceList };
}
