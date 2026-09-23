import { normalizeText } from '../normalize.ts';
import type { CefrRecord, Level } from '../types.ts';

// The dataset mixes label styles (`Noun` and `noun`, `Determiner` and `det`); map them all to
// Doozan's codes so matching is on the same vocabulary. Participles have no lemma POS: unmatched.
const POS_CODES: Record<string, string> = {
  adjective: 'adj',
  adj: 'adj',
  adverb: 'adv',
  adv: 'adv',
  article: 'art',
  contraction: 'contraction',
  determiner: 'determiner',
  det: 'determiner',
  interjection: 'interj',
  interj: 'interj',
  noun: 'n',
  numeral: 'num',
  phrase: 'phrase',
  preposition: 'prep',
  prep: 'prep',
  pronoun: 'pron',
  pron: 'pron',
  propernoun: 'prop',
  verb: 'v',
  conj: 'conj',
  conjunction: 'conj',
};

type RawRecord = { lemma: string; pos: string | null };

/** Parses the per-level `es-<level>.json` files; the level comes from the file. */
export function parseCefr(files: { level: Level; json: string }[]): CefrRecord[] {
  return files.flatMap(({ level, json }) =>
    (JSON.parse(json) as RawRecord[]).map((record) => ({
      lemma: normalizeText(record.lemma),
      pos: record.pos === null ? null : (POS_CODES[record.pos.toLowerCase()] ?? null),
      level,
    })),
  );
}
