import type { SurfaceCount } from '../types.ts';

/**
 * Parses Doozan's es_merged_50k.txt: `word<TAB>count` per line, most frequent first. Unlike
 * frequency.csv these are raw word forms, not lemmas, so they catch common words that
 * frequency.csv folds into another lemma or leaves out (no, muy, iglesia, mamá…).
 */
export function parseSurfaceCounts(text: string): SurfaceCount[] {
  return text
    .split('\n')
    .map((line, index) => ({ line, lineNumber: index + 1 }))
    .filter(({ line }) => line.trim() !== '')
    .map(({ line, lineNumber }) => {
      const [word, countText] = line.split('\t');
      const count = Number(countText);
      if (!word || !Number.isInteger(count)) {
        throw new Error(`es_merged_50k.txt line ${lineNumber}: malformed row "${line}"`);
      }
      return { word, count };
    });
}
