import { normalizeText } from './normalize.ts';
import type { Entry, Sentence } from './types.ts';

export const MAX_EXAMPLES = 3;

// Sentence tags use Doozan codes, plus participles; multi-word `phrase-*`, `split` and
// `proverb` tags do not identify a single lemma and are skipped.
const TAG_POS: Record<string, string> = { 'part-verb': 'v', 'part-adj': 'adj' };
const tagPos = (pos: string): string | null =>
  pos.startsWith('phrase') || pos === 'split' || pos === 'proverb' ? null : (TAG_POS[pos] ?? pos);

const byReadability = (a: Sentence, b: Sentence) =>
  a.spanish.length - b.spanish.length ||
  b.spanishProficiency - a.spanishProficiency ||
  a.order - b.order;

/**
 * Attaches up to 3 example sentences per entry: sentences whose tags contain the entry's lemma
 * with the same POS, shortest first, then higher Spanish proficiency, then source order.
 */
export function attachExamples(
  entries: Entry[],
  sentences: Sentence[],
): { entries: Entry[]; coverage: Record<0 | 1 | 2 | 3, number> } {
  // Sort once; every per-lemma list then stays in readability order and needs only a slice.
  const byLemma = new Map<string, Sentence[]>();
  for (const sentence of [...sentences].sort(byReadability)) {
    for (const tag of sentence.tags) {
      const pos = tagPos(tag.pos);
      if (pos === null) continue;
      for (const lemma of tag.lemmas) {
        const key = `${normalizeText(lemma)}|${pos}`;
        const list = byLemma.get(key) ?? [];
        if (list.at(-1) !== sentence) list.push(sentence);
        byLemma.set(key, list);
      }
    }
  }

  const coverage = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const withExamples = entries.map((entry) => {
    const examples = (byLemma.get(`${entry.spanish}|${entry.posCode}`) ?? [])
      .slice(0, MAX_EXAMPLES)
      .map(({ spanish, english, attribution }) => ({ spanish, english, attribution }));
    coverage[examples.length as 0 | 1 | 2 | 3] += 1;
    return { ...entry, examples };
  });

  return { entries: withExamples, coverage };
}
