/** @jest-environment node */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import type { Sources } from './download.ts';
import { run, type StageEvent } from './run.ts';

const FIXTURES = join(__dirname, '..', 'fixtures');
const SOURCES: Sources = JSON.parse(readFileSync(join(__dirname, '..', 'sources.json'), 'utf8'));
const OUTPUT_FILES = [
  'DATA-LICENSE.md',
  'IMPORT_REPORT.md',
  'vocabulary-stats.json',
  'vocabulary.db',
  'vocabulary.json',
];

/** Serves each pinned URL from the fixture file with the same name. */
const fixtureFetch = (overrides: Record<string, string> = {}) =>
  (async (url: string) => {
    const name = basename(url);
    return new Response(overrides[name] ?? readFileSync(join(FIXTURES, name), 'utf8'));
  }) as typeof fetch;

describe('run', () => {
  let work: string;
  let tmpRoot: string;
  let outDir: string;
  beforeEach(() => {
    work = mkdtempSync(join(tmpdir(), 'vocab-run-'));
    tmpRoot = join(work, 'tmp');
    mkdirSync(tmpRoot);
    outDir = join(work, 'assets', 'vocabulary');
  });
  afterEach(() => rmSync(work, { recursive: true, force: true }));

  test('builds the dataset from the pinned sources and cleans up the downloads', async () => {
    const events: StageEvent[] = [];
    const stats = await run({
      outDir,
      cefr: true,
      sources: SOURCES,
      fetch: fixtureFetch(),
      tmpRoot,
      report: (event) => events.push(event),
    });

    expect(readdirSync(outDir).sort()).toEqual(OUTPUT_FILES);
    expect(statSync(outDir).mode & 0o777).toBe(0o755);
    expect(readdirSync(tmpRoot)).toEqual([]);
    expect(stats.totalWords).toBe(7);
    expect(stats.addedFromSurfaceList).toBe(2);
    expect(stats.byLevel).toEqual({ A1: 2, A2: 0, B1: 0, B2: 0, unclassified: 5 });

    const db = new DatabaseSync(join(outDir, 'vocabulary.db'), { readOnly: true });
    expect(db.prepare('SELECT key, cefr FROM vocabulary ORDER BY frequency_rank').all()).toEqual([
      { key: 'el|determiner', cefr: null },
      { key: 'no|adverb', cefr: null },
      { key: 'comer|verb', cefr: 'A1' },
      { key: 'casa|noun', cefr: 'A1' },
      { key: 'él|pronoun', cefr: null },
      { key: 'iglesia|noun', cefr: null },
      { key: 'banco|noun', cefr: null },
    ]);
    expect(db.prepare("SELECT english FROM translations WHERE key = 'comer|verb'").all()).toEqual([
      { english: 'to eat' },
      { english: 'to have lunch' },
    ]);
    expect(
      db.prepare("SELECT spanish FROM examples WHERE key = 'casa|noun' ORDER BY priority").all(),
    ).toEqual([{ spanish: 'Él come en casa.' }, { spanish: 'La casa es grande.' }]);
    db.close();

    const report = readFileSync(join(outDir, 'IMPORT_REPORT.md'), 'utf8');
    expect(report).toContain('`banco|noun`');
    expect(report).toContain('Skipped non-sentence rows: 1');
  });

  test('reports every stage as it completes, in order', async () => {
    const events: StageEvent[] = [];
    await run({
      outDir,
      cefr: false,
      sources: SOURCES,
      fetch: fixtureFetch(),
      tmpRoot,
      report: (e) => events.push(e),
    });
    const done = events.filter((event) => event.type === 'done').map((event) => event.name);
    expect(done).toEqual(['download', 'parse', 'merge', 'cefr', 'examples', 'validate', 'write']);
    expect(events.every((event) => event.total === 7)).toBe(true);
  });

  test('a failing build leaves the existing output untouched and still cleans up', async () => {
    mkdirSync(outDir, { recursive: true });
    for (const file of OUTPUT_FILES) writeFileSync(join(outDir, file), `previous ${file}`);

    const badDictionary = '_____\ncomer\npos: v\n  gloss: to eat café\n';
    await expect(
      run({
        outDir,
        cefr: false,
        sources: SOURCES,
        fetch: fixtureFetch({ 'es-en.data': badDictionary }),
        tmpRoot,
        report: () => {},
      }),
    ).rejects.toThrow(/validation failed/);

    for (const file of OUTPUT_FILES) {
      expect(readFileSync(join(outDir, file), 'utf8')).toBe(`previous ${file}`);
    }
    expect(readdirSync(tmpRoot)).toEqual([]);
    expect(readdirSync(join(work, 'assets'))).toEqual(['vocabulary']);
  });

  test('lists keys removed since the previous dataset', async () => {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      join(outDir, 'vocabulary.json'),
      '[\n{"key":"antaño|adverb"},\n{"key":"casa|noun"}\n]\n',
    );
    const stats = await run({
      outDir,
      cefr: false,
      sources: SOURCES,
      fetch: fixtureFetch(),
      tmpRoot,
      report: () => {},
    });
    expect(stats.keyDiff).toEqual({ added: 6, removed: 1 });
    expect(existsSync(join(outDir, 'vocabulary.db'))).toBe(true);
  });
});
