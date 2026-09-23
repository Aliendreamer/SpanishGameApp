import type { CefrReport } from '../cefr.ts';
import type { KeyDiff } from '../diff.ts';
import { DROP_REASONS, type DropReason, type Dropped } from '../merge.ts';
import { LEVELS, type Entry } from '../types.ts';
import type { Validation } from '../validate.ts';

export type StatsInput = {
  entries: Entry[];
  datasetVersion: string;
  generatedAt: string;
  sources: { doozan: string; cefr: string | null };
  dropped: Dropped;
  cefr: CefrReport;
  examples: Record<0 | 1 | 2 | 3, number>;
  skippedSentenceRows: number;
  addedFromSurfaceList: number;
  warnings: Validation['warnings'];
  keyDiff: KeyDiff;
};

const countBy = <T>(items: T[], key: (item: T) => string) =>
  items.reduce<Record<string, number>>((counts, item) => {
    counts[key(item)] = (counts[key(item)] ?? 0) + 1;
    return counts;
  }, {});

/** Machine-readable summary, written as vocabulary-stats.json. */
export function buildStats(input: StatsInput) {
  const { entries } = input;
  const byPartOfSpeech = countBy(entries, (entry) => entry.partOfSpeech);
  return {
    datasetVersion: input.datasetVersion,
    generatedAt: input.generatedAt,
    sources: input.sources,
    totalWords: entries.length,
    byPartOfSpeech: Object.fromEntries(Object.entries(byPartOfSpeech).sort()),
    byLevel: {
      ...Object.fromEntries(
        LEVELS.map((level) => [level, entries.filter((entry) => entry.cefr === level).length]),
      ),
      unclassified: entries.filter((entry) => entry.cefr === null).length,
    },
    withExamples: entries.filter((entry) => entry.examples.length > 0).length,
    withForms: entries.filter((entry) => entry.forms.length > 0).length,
    dropped: input.dropped,
    examples: input.examples,
    keyDiff: { added: input.keyDiff.added, removed: input.keyDiff.removed.length },
    addedFromSurfaceList: input.addedFromSurfaceList,
  };
}

const table = (rows: [string, number | string][]) =>
  [
    '| | |',
    '|---|---|',
    ...rows.map(([label, value]) => `| ${label.replaceAll('|', '\\|')} | ${value} |`),
  ].join('\n');

const keyList = (keys: string[]) =>
  keys.length === 0 ? '_none_' : keys.map((key) => `\`${key}\``).join(', ');

/** Human-readable import report, written as IMPORT_REPORT.md. */
export function reportMarkdown(input: StatsInput, stats = buildStats(input)): string {
  const { dropped, cefr, warnings, keyDiff } = input;
  return `# Vocabulary import report

Dataset version: \`${input.datasetVersion}\` · generated ${input.generatedAt}

- Doozan commit: \`${input.sources.doozan}\`
- ${cefr.enabled ? `CEFR commit: \`${input.sources.cefr}\`` : 'CEFR: not used (build without --cefr)'}

## Words

${table([['total', stats.totalWords], ...Object.entries(stats.byPartOfSpeech)])}

## Levels

${table(Object.entries(stats.byLevel))}

## Word list

${table([['added from the word-form list', input.addedFromSurfaceList]])}

The word-form list (es_merged_50k.txt) adds common lemmas that frequency.csv folds into another
word or leaves out (e.g. *no*, *muy*, *iglesia*, *mamá*).

## Dropped from the frequency list

${table(
  (Object.entries(DROP_REASONS) as [DropReason, string][]).map(([reason, label]) => [
    label,
    dropped[reason],
  ]),
)}

## CEFR matching

${table([
  ['records', cefr.records],
  ['records without part of speech', cefr.withoutPos],
  ['entries with a level', cefr.matchedEntries],
  ['records matching no entry', cefr.unmatchedRecords],
  ['ambiguous (conflicting levels)', cefr.ambiguous.length],
])}

Ambiguous, left without a level: ${keyList(cefr.ambiguous)}

## Example sentences

${table([
  ['3 examples', input.examples[3]],
  ['2 examples', input.examples[2]],
  ['1 example', input.examples[1]],
  ['no examples', input.examples[0]],
])}

Skipped non-sentence rows: ${input.skippedSentenceRows}

## Warnings

${table([
  ['noun without gender', warnings.nounWithoutGender],
  ['entry without forms', warnings.withoutForms],
  ['entry without examples', warnings.withoutExamples],
  ['meaning still containing a cross-reference', warnings.meaningsWithCrossReference],
])}

## Changes since the previous dataset

${
  keyDiff.hadPrevious
    ? `Added: ${keyDiff.added} · removed: ${keyDiff.removed.length} (progress on removed keys is orphaned)\n\nRemoved: ${keyList(keyDiff.removed)}`
    : 'First dataset — nothing to compare.'
}
`;
}

/** Attribution for the data shipped in the app, written as DATA-LICENSE.md. */
export function licenseMarkdown({ cefr }: { cefr: boolean }): string {
  return `# Vocabulary data licence

The code in this repository is MIT-licensed; the vocabulary data in this directory is not.

- **Words, meanings, genders, forms** — from [Wiktionary](https://en.wiktionary.org), CC BY-SA,
  via [Doozan's spanish_data](https://github.com/doozan/spanish_data). This data is shared under
  CC BY-SA.
- **Word frequencies** — [FrequencyWords](https://github.com/hermitdave/FrequencyWords), CC BY-SA
  3.0, via Doozan.
- **Example sentences** — [Tatoeba](https://tatoeba.org), CC BY 2.0 FR. Each sentence's authors
  are credited in the \`attribution\` column of the \`examples\` table.
${
  cefr
    ? `- **CEFR levels** — [cefr-vocabulary-dataset](https://github.com/Talhakasikci/cefr-vocabulary-dataset),
  a community dataset with no licence file; its README allows personal and educational use. Ask
  the author before any commercial distribution.
`
    : ''
}`;
}
