/** @jest-environment node */
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { downloadSources, type Sources } from './download.ts';

const SOURCES: Sources = {
  doozan: { repo: 'doozan/spanish_data', commit: 'aaa', files: ['frequency.csv'] },
  cefr: { repo: 'x/cefr', commit: 'bbb', files: ['vocab_json/es-A1.json'] },
};

const fakeFetch = (bodies: Record<string, string | number>) =>
  (async (url: string) => {
    const body = bodies[url];
    return typeof body === 'number'
      ? new Response('nope', { status: body })
      : new Response(body ?? '', { status: body === undefined ? 404 : 200 });
  }) as typeof fetch;

describe('downloadSources', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'vocab-download-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  test('fetches files at their pinned commit into the directory', async () => {
    const paths = await downloadSources(SOURCES, dir, {
      cefr: true,
      fetch: fakeFetch({
        'https://raw.githubusercontent.com/doozan/spanish_data/aaa/frequency.csv': 'count\n',
        'https://raw.githubusercontent.com/x/cefr/bbb/vocab_json/es-A1.json': '[]',
      }),
    });
    expect(readFileSync(paths['frequency.csv'], 'utf8')).toBe('count\n');
    expect(readFileSync(paths['es-A1.json'], 'utf8')).toBe('[]');
  });

  test('skips CEFR files when CEFR is off', async () => {
    const paths = await downloadSources(SOURCES, dir, {
      cefr: false,
      fetch: fakeFetch({
        'https://raw.githubusercontent.com/doozan/spanish_data/aaa/frequency.csv': 'x',
      }),
    });
    expect(Object.keys(paths)).toEqual(['frequency.csv']);
  });

  test('fails with the file name when a download fails', async () => {
    await expect(
      downloadSources(SOURCES, dir, { cefr: false, fetch: fakeFetch({}) }),
    ).rejects.toThrow(/frequency\.csv.*404/);
  });

  test('reports progress per file', async () => {
    const messages: string[] = [];
    await downloadSources(SOURCES, dir, {
      cefr: false,
      fetch: fakeFetch({
        'https://raw.githubusercontent.com/doozan/spanish_data/aaa/frequency.csv': 'x'.repeat(2048),
      }),
      progress: (message) => messages.push(message),
    });
    expect(messages.at(-1)).toMatch(/frequency\.csv 2\.0 KB/);
  });
});
