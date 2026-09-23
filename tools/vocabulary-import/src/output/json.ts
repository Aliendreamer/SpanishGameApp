import type { Entry } from '../types.ts';

/** Review copy of the dataset: valid JSON with one entry per line, so updates diff readably. */
export const toJson = (entries: Entry[]): string =>
  `[\n${entries.map((entry) => JSON.stringify(entry)).join(',\n')}\n]\n`;

/** Keys of a previously generated dataset, for the key diff. */
export const readKeys = (json: string): string[] =>
  (JSON.parse(json) as Pick<Entry, 'key'>[]).map((entry) => entry.key);
