import type { FrequencyRow } from '../types.ts';

/**
 * Parses Doozan's frequency.csv: `count,spanish,pos,flags,usage`, most frequent first.
 * `usage` lists the lemma's forms with their counts: `15403031:la|3687944:las`.
 */
export function parseFrequency(csv: string): FrequencyRow[] {
  return csv
    .split('\n')
    .slice(1)
    .map((line, index) => ({ line, lineNumber: index + 2 }))
    .filter(({ line }) => line.trim() !== '')
    .map(({ line, lineNumber }) => {
      const [countText, lemma, pos, , usage = ''] = line.split(',');
      const count = Number(countText);
      if (!Number.isInteger(count) || !lemma || !pos) {
        throw new Error(`frequency.csv line ${lineNumber}: malformed row "${line}"`);
      }
      const forms = usage
        .split('|')
        .map((item) => item.slice(item.indexOf(':') + 1))
        .filter((form) => form !== '' && form !== lemma);
      return { lemma, pos, count, forms: [...new Set(forms)] };
    });
}
