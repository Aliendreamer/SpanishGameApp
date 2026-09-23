import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { applyCefr } from './cefr.ts';
import { diffKeys } from './diff.ts';
import { downloadSources, type Sources } from './download.ts';
import { attachExamples } from './examples.ts';
import { count } from './format.ts';
import { DROP_REASONS, type DropReason, mergeEntries } from './merge.ts';
import { readKeys, toJson } from './output/json.ts';
import { buildStats, licenseMarkdown, reportMarkdown, type StatsInput } from './output/report.ts';
import { datasetVersion, writeDatabase } from './output/sqlite.ts';
import { swapInto } from './swap.ts';
import { parseCefr } from './parse/cefr.ts';
import { parseDictionary } from './parse/dictionary.ts';
import { parseFrequency } from './parse/frequency.ts';
import { parseSentences } from './parse/sentences.ts';
import { parseSurfaceCounts } from './parse/surface.ts';
import { LEVELS, type Progress } from './types.ts';
import { validate } from './validate.ts';

/** Writes the five output files into `staging`, then swaps it in for `outDir`. */
function writeOutputs(
  staging: string,
  outDir: string,
  input: StatsInput,
  stats: ReturnType<typeof buildStats>,
  cefr: boolean,
) {
  writeDatabase(join(staging, 'vocabulary.db'), input.entries, {
    generated_at: input.generatedAt,
    doozan_commit: input.sources.doozan,
    cefr_commit: input.sources.cefr ?? 'off',
    dataset_version: input.datasetVersion,
  });
  writeFileSync(join(staging, 'vocabulary.json'), toJson(input.entries));
  writeFileSync(join(staging, 'vocabulary-stats.json'), `${JSON.stringify(stats, null, 2)}\n`);
  writeFileSync(join(staging, 'IMPORT_REPORT.md'), reportMarkdown(input, stats));
  writeFileSync(join(staging, 'DATA-LICENSE.md'), licenseMarkdown({ cefr }));
  swapInto(staging, outDir);
}

const STAGES = ['download', 'parse', 'merge', 'cefr', 'examples', 'validate', 'write'] as const;
type StageName = (typeof STAGES)[number];

export type StageEvent = {
  type: 'progress' | 'done';
  stage: number;
  total: number;
  name: StageName;
  message: string;
  ms?: number;
};

export type RunOptions = {
  outDir: string;
  cefr: boolean;
  sources: Sources;
  report: (event: StageEvent) => void;
  fetch?: typeof fetch;
  tmpRoot?: string;
  now?: () => Date;
};

/**
 * Builds the vocabulary dataset. Sources are downloaded into a temp dir that is always removed;
 * output is written to a staging dir and moved over `outDir` only if every stage succeeds.
 */
export async function run(options: RunOptions) {
  const { outDir, report, tmpRoot = tmpdir(), now = () => new Date() } = options;

  async function stage<T>(
    name: StageName,
    work: (progress: Progress) => T | Promise<T>,
    summary: (result: T) => string,
  ) {
    const index = STAGES.indexOf(name) + 1;
    const started = performance.now(); // monotonic: Date.now() can jump when WSL resyncs its clock
    const progress: Progress = (message) =>
      report({ type: 'progress', stage: index, total: STAGES.length, name, message });
    const result = await work(progress);
    report({
      type: 'done',
      stage: index,
      total: STAGES.length,
      name,
      message: summary(result),
      ms: Math.round(performance.now() - started),
    });
    return result;
  }

  let downloads: string | undefined;
  let staging: string | undefined;
  const cleanUp = () => {
    for (const dir of [downloads, staging]) if (dir) rmSync(dir, { recursive: true, force: true });
  };
  // Ctrl-C skips `finally`; remove the temp dirs before exiting so none are left in the repo.
  const onInterrupt = () => {
    cleanUp();
    process.exit(130);
  };
  process.once('SIGINT', onInterrupt);

  try {
    downloads = mkdtempSync(join(tmpRoot, 'vocab-sources-'));
    mkdirSync(dirname(outDir), { recursive: true });
    staging = mkdtempSync(join(dirname(outDir), '.vocabulary-staging-'));
    const sourceDir = downloads;
    const stagingDir = staging;

    const files = await stage(
      'download',
      (progress) =>
        downloadSources(options.sources, sourceDir, {
          cefr: options.cefr,
          fetch: options.fetch,
          progress,
        }),
      (paths) => `${Object.keys(paths).length} files`,
    );
    const read = (name: string) => readFileSync(files[name], 'utf8');

    const parsed = await stage(
      'parse',
      (progress) => ({
        frequency: parseFrequency(read('frequency.csv')),
        surface: parseSurfaceCounts(read('es_merged_50k.txt')),
        dictionary: parseDictionary(read('es-en.data'), (message) =>
          progress(`dictionary ${message}`),
        ),
        sentences: parseSentences(read('sentences.tsv')),
        cefr: options.cefr
          ? parseCefr(LEVELS.map((level) => ({ level, json: read(`es-${level}.json`) })))
          : null,
      }),
      (p) =>
        `frequency ${count(p.frequency.length)} · dictionary ${count(p.dictionary.size)} · sentences ${count(p.sentences.sentences.length)}` +
        (p.cefr ? ` · CEFR ${count(p.cefr.length)}` : ''),
    );

    const merged = await stage(
      'merge',
      () => mergeEntries(parsed.frequency, parsed.dictionary, parsed.surface),
      ({ entries, dropped, addedFromSurfaceList }) =>
        `${count(entries.length)} words kept (${count(addedFromSurfaceList)} from the word-form list) · dropped: ` +
        (Object.entries(DROP_REASONS) as [DropReason, string][])
          .map(([reason, label]) => `${count(dropped[reason])} ${label}`)
          .join(', '),
    );

    const leveled = await stage(
      'cefr',
      () => applyCefr(merged.entries, parsed.cefr),
      ({ report: r }) =>
        r.enabled
          ? `${count(r.matchedEntries)} with a level · ${count(r.unmatchedRecords)} records unmatched · ${count(r.withoutPos)} without POS · ${count(r.ambiguous.length)} ambiguous`
          : 'off (build with --cefr to add levels)',
    );

    const withExamples = await stage(
      'examples',
      () => attachExamples(leveled.entries, parsed.sentences.sentences),
      ({ coverage }) =>
        `3: ${count(coverage[3])} · 2: ${count(coverage[2])} · 1: ${count(coverage[1])} · 0: ${count(coverage[0])}`,
    );
    const entries = withExamples.entries;

    const validation = await stage(
      'validate',
      () => validate(entries),
      ({ errors, warnings }) =>
        `${count(errors.length)} errors · warnings: ${count(warnings.nounWithoutGender)} nouns without gender, ` +
        `${count(warnings.withoutForms)} without forms, ${count(warnings.withoutExamples)} without examples`,
    );
    if (validation.errors.length > 0) {
      throw new Error(
        `validation failed: ${validation.errors.length} errors\n  ${validation.errors.slice(0, 20).join('\n  ')}`,
      );
    }

    const previousJson = join(outDir, 'vocabulary.json');
    const input: StatsInput = {
      entries,
      datasetVersion: datasetVersion(entries),
      generatedAt: now().toISOString(),
      sources: {
        doozan: options.sources.doozan.commit,
        cefr: options.cefr ? options.sources.cefr.commit : null,
      },
      dropped: merged.dropped,
      cefr: leveled.report,
      examples: withExamples.coverage,
      skippedSentenceRows: parsed.sentences.skipped,
      addedFromSurfaceList: merged.addedFromSurfaceList,
      warnings: validation.warnings,
      keyDiff: diffKeys(
        existsSync(previousJson) ? readKeys(readFileSync(previousJson, 'utf8')) : null,
        entries.map((entry) => entry.key),
      ),
    };
    const stats = buildStats(input);

    await stage(
      'write',
      () => writeOutputs(stagingDir, outDir, input, stats, options.cefr),
      () => `${count(entries.length)} words → ${outDir}`,
    );

    return stats;
  } finally {
    process.off('SIGINT', onInterrupt);
    cleanUp();
  }
}
