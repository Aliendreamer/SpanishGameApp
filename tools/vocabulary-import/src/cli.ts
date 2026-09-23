// pnpm vocab:build [--cefr] — builds assets/vocabulary/ from the pinned sources in sources.json.
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseArgs } from 'node:util';

import type { Sources } from './download.ts';
import { count } from './format.ts';
import { run, type StageEvent } from './run.ts';

const toolDir = join(import.meta.dirname, '..');
const repoRoot = join(toolDir, '..', '..');
const sources: Sources = JSON.parse(readFileSync(join(toolDir, 'sources.json'), 'utf8'));
// strict: an unknown or mistyped flag (--cefrr) fails instead of silently building without CEFR.
function parseCefrFlag(): boolean {
  try {
    const { values } = parseArgs({ options: { cefr: { type: 'boolean', default: false } } });
    return values.cefr ?? false;
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\nUsage: pnpm vocab:build [--cefr]\n`);
    process.exit(2);
  }
}
const cefr = parseCefrFlag();
const outDir = join(repoRoot, 'assets', 'vocabulary');
const live = process.stderr.isTTY;

// Progress goes to stderr (live-updating on a terminal); the summary goes to stdout.
function print(event: StageEvent) {
  const label = `[${event.stage}/${event.total}] ${event.name.padEnd(8)}`;
  if (event.type === 'progress') {
    if (live) process.stderr.write(`\r\x1b[2K${label} ${event.message}`);
    return;
  }
  const seconds = ((event.ms ?? 0) / 1000).toFixed(1);
  process.stderr.write(`${live ? '\r\x1b[2K' : ''}${label} ${event.message}  (${seconds}s)\n`);
}

const started = Date.now();
try {
  const stats = await run({ outDir, cefr, sources, report: print });
  console.log(
    `\nBuilt ${count(stats.totalWords)} words, dataset ${stats.datasetVersion}, in ` +
      `${((Date.now() - started) / 1000).toFixed(1)}s → ${relative(repoRoot, outDir)}/` +
      `\nReport: ${relative(repoRoot, join(outDir, 'IMPORT_REPORT.md'))}`,
  );
} catch (error) {
  process.stderr.write(
    `\n\nBuild failed — ${relative(repoRoot, outDir)}/ was not changed.\n${(error as Error).message}\n`,
  );
  process.exitCode = 1;
}
