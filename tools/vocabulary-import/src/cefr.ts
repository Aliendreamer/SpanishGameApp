import { posLabel } from './normalize.ts';
import type { CefrRecord, Entry, Level } from './types.ts';

export type CefrReport = {
  enabled: boolean;
  records: number;
  withoutPos: number;
  matchedEntries: number;
  unmatchedRecords: number;
  /** Entries whose lemma + POS appear at more than one level: left without a level. */
  ambiguous: string[];
};

// Matching is on the learner label (so the dataset's `Determiner` meets Doozan's `art`), and
// pronoun/determiner count as one class: possessives and demonstratives (mío, este) are tagged
// either way by different sources.
const matchClass = (label: string) =>
  label === 'pronoun' || label === 'determiner' ? 'pronoun/determiner' : label;
const matchKey = (lemma: string, label: string) => `${lemma}|${matchClass(label)}`;

/**
 * Sets an entry's CEFR level only when exactly one level matches its lemma and part of speech. The
 * dataset is enrichment, never authoritative: no match, a POS-less record, or conflicting
 * levels all leave the level empty.
 */
export function applyCefr(
  entries: Entry[],
  records: CefrRecord[] | null,
): { entries: Entry[]; report: CefrReport } {
  if (records === null) {
    return {
      entries,
      report: {
        enabled: false,
        records: 0,
        withoutPos: 0,
        matchedEntries: 0,
        unmatchedRecords: 0,
        ambiguous: [],
      },
    };
  }

  const levels = new Map<string, Set<Level>>();
  const recordKey = (record: CefrRecord) => {
    const label = record.pos === null ? null : posLabel(record.pos);
    return label === null ? null : matchKey(record.lemma, label);
  };
  for (const record of records) {
    const key = recordKey(record);
    if (key === null) continue;
    levels.set(key, (levels.get(key) ?? new Set()).add(record.level));
  }

  const entryKeys = new Set(entries.map((entry) => matchKey(entry.spanish, entry.partOfSpeech)));
  const ambiguous: string[] = [];
  let matchedEntries = 0;

  const withLevels = entries.map((entry) => {
    const found = levels.get(matchKey(entry.spanish, entry.partOfSpeech));
    if (!found) return entry;
    if (found.size > 1) {
      ambiguous.push(entry.key);
      return entry;
    }
    matchedEntries += 1;
    return { ...entry, cefr: [...found][0] };
  });

  return {
    entries: withLevels,
    report: {
      enabled: true,
      records: records.length,
      withoutPos: records.filter((record) => record.pos === null).length,
      matchedEntries,
      unmatchedRecords: records.filter((record) => {
        const key = recordKey(record);
        return key !== null && !entryKeys.has(key);
      }).length,
      ambiguous,
    },
  };
}
