import type { Sentence, SentenceTag } from '../types.ts';

/**
 * Parses one tag column: `:v,tengas|tener :art,una|uno :adv,un poco`. Tags start with `:`;
 * a tag is a POS then comma-separated words, each `form|lemma` or just the lemma. Words may
 * contain spaces, so tags are split on the space before each `:`.
 */
function parseTags(column: string): SentenceTag[] {
  return column
    .split(/ (?=:)/)
    .filter((tag) => tag.startsWith(':'))
    .map((tag) => {
      const [pos, ...words] = tag.slice(1).split(',');
      return { pos, lemmas: words.map((word) => word.split('|').at(-1)!).filter(Boolean) };
    });
}

/**
 * Parses Doozan's sentences.tsv (Tatoeba): EN, ES, attribution, EN/ES proficiency, tags.
 * Rows without a CC-BY attribution (the file has a few diagnostic `overlap:` lines) are skipped:
 * a sentence that cannot be credited cannot be used.
 */
export function parseSentences(tsv: string): { sentences: Sentence[]; skipped: number } {
  const sentences: Sentence[] = [];
  let skipped = 0;
  for (const line of tsv.split('\n')) {
    if (line.trim() === '') continue;
    const [english, spanish, attribution, , spanishProficiency, tags = ''] = line.split('\t');
    if (!english || !spanish || !attribution?.startsWith('CC-BY')) {
      skipped += 1;
      continue;
    }
    sentences.push({
      english,
      spanish,
      attribution,
      spanishProficiency: Number(spanishProficiency) || 0,
      tags: parseTags(tags),
      order: sentences.length,
    });
  }
  return { sentences, skipped };
}
