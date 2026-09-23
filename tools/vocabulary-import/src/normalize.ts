import type { Gender } from './types.ts';

/** NFC, trimmed, lowercase. Accents, ñ and ü are kept: they change meaning (él/el, sí/si). */
export const normalizeText = (text: string): string => text.normalize('NFC').trim().toLowerCase();

const POS_LABELS: Record<string, string> = {
  n: 'noun',
  v: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  pron: 'pronoun',
  prep: 'preposition',
  conj: 'conjunction',
  interj: 'interjection',
  determiner: 'determiner',
  art: 'determiner',
  num: 'numeral',
  contraction: 'other',
  phrase: 'other',
  particle: 'other',
};

/** Learner-facing label for a Doozan POS code, or null when the code is not vocabulary. */
export const posLabel = (code: string): string | null => POS_LABELS[code] ?? null;

const GENDERS: Record<string, Gender> = {
  m: 'm',
  'm-p': 'm',
  'm-s': 'm',
  f: 'f',
  'f-p': 'f',
  'f-s': 'f',
  mf: 'm/f',
  mfbysense: 'm/f',
  mfequiv: 'm/f',
};

/** Maps Wiktionary gender codes (incl. plural-only and by-sense variants) to m, f, or m/f. */
export const normalizeGender = (raw: string | null): Gender | null =>
  raw === null ? null : (GENDERS[raw] ?? null);
