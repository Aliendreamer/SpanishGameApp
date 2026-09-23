import { ENTRIES } from '../fixtures.ts';
import { buildStats, licenseMarkdown, reportMarkdown, type StatsInput } from './report.ts';

const INPUT: StatsInput = {
  entries: ENTRIES,
  datasetVersion: 'v1',
  generatedAt: '2026-09-23T00:00:00.000Z',
  sources: { doozan: 'abc', cefr: 'def' },
  dropped: { properNouns: 1, noDictionaryPos: 2, notVocabulary: 3, noMeanings: 4, duplicates: 5 },
  cefr: {
    enabled: true,
    records: 10,
    withoutPos: 1,
    matchedEntries: 1,
    unmatchedRecords: 7,
    ambiguous: ['banco|noun'],
  },
  examples: { 0: 1, 1: 1, 2: 0, 3: 0 },
  skippedSentenceRows: 32,
  addedFromSurfaceList: 9,
  warnings: {
    nounWithoutGender: 0,
    withoutForms: 0,
    withoutExamples: 1,
    meaningsWithCrossReference: 3,
  },
  keyDiff: { hadPrevious: true, added: 1, removed: ['antaño|adverb'] },
};

describe('buildStats', () => {
  test('summarises entries by part of speech and level', () => {
    expect(buildStats(INPUT)).toEqual(
      expect.objectContaining({
        datasetVersion: 'v1',
        totalWords: 2,
        byPartOfSpeech: { noun: 1, verb: 1 },
        byLevel: { A1: 1, A2: 0, B1: 0, B2: 0, unclassified: 1 },
        withExamples: 1,
        withForms: 2,
        keyDiff: { added: 1, removed: 1 },
        addedFromSurfaceList: 9,
      }),
    );
  });
});

describe('reportMarkdown', () => {
  const report = reportMarkdown(INPUT);

  test('shows sources, drops, CEFR matching, and warnings', () => {
    expect(report).toContain('Doozan commit: `abc`');
    expect(report).toContain('| no English meaning | 4 |');
    expect(report).toContain('| ambiguous (conflicting levels) | 1 |');
    expect(report).toContain('| noun without gender | 0 |');
    expect(report).toContain('| meaning still containing a cross-reference | 3 |');
    expect(report).toContain('Skipped non-sentence rows: 32');
    expect(report).toContain('| added from the word-form list | 9 |');
    expect(report).toContain('| duplicate lemma\\|pos | 5 |');
  });

  test('lists ambiguous and removed keys in full', () => {
    expect(report).toContain('`banco|noun`');
    expect(report).toContain('`antaño|adverb`');
  });

  test('says when CEFR was not used', () => {
    expect(
      reportMarkdown({
        ...INPUT,
        sources: { doozan: 'abc', cefr: null },
        cefr: { ...INPUT.cefr, enabled: false },
      }),
    ).toContain('CEFR: not used');
  });
});

describe('licenseMarkdown', () => {
  test('credits Wiktionary, FrequencyWords, and Tatoeba', () => {
    const license = licenseMarkdown({ cefr: false });
    expect(license).toMatch(/Wiktionary.*CC BY-SA/);
    expect(license).toMatch(/FrequencyWords/);
    expect(license).toMatch(/Tatoeba.*CC BY 2\.0 FR/);
    expect(license).not.toMatch(/CEFR/);
  });

  test('names the CEFR dataset and its missing licence when used', () => {
    expect(licenseMarkdown({ cefr: true })).toMatch(/cefr-vocabulary-dataset.*no licence file/s);
  });
});
