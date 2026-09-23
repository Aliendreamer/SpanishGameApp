import { createWriteStream } from 'node:fs';
import { basename, join } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';

import { formatBytes } from './format.ts';
import type { Progress } from './types.ts';

export type Source = { repo: string; commit: string; files: string[] };
export type Sources = { doozan: Source; cefr: Source };

const PROGRESS_EVERY_BYTES = 8 * 1024 * 1024;

/** Streams one file to disk, reporting its size every 8 MB and when done. */
async function download(url: string, path: string, fetchImpl: typeof fetch, progress: Progress) {
  const response = await fetchImpl(url);
  const name = basename(path);
  if (!response.ok || !response.body) {
    throw new Error(`download ${name} failed: HTTP ${response.status}`);
  }

  let bytes = 0;
  let nextReport = PROGRESS_EVERY_BYTES;
  const counter = new Transform({
    transform(chunk: Buffer, _encoding, done) {
      bytes += chunk.byteLength;
      if (bytes >= nextReport) {
        progress(`${name} ${formatBytes(bytes)}…`);
        nextReport += PROGRESS_EVERY_BYTES;
      }
      done(null, chunk);
    },
  });
  await pipeline(
    Readable.fromWeb(response.body as NodeReadableStream),
    counter,
    createWriteStream(path),
  );
  progress(`${name} ${formatBytes(bytes)}`);
}

/**
 * Downloads the pinned source files into `dir` in parallel, returning local paths by file name.
 * Only the files the import needs are fetched; CEFR files only when `cefr` is on.
 */
export async function downloadSources(
  sources: Sources,
  dir: string,
  options: { cefr: boolean; fetch?: typeof fetch; progress?: Progress },
): Promise<Record<string, string>> {
  const { fetch: fetchImpl = fetch, progress = () => {} } = options;
  const wanted = options.cefr ? [sources.doozan, sources.cefr] : [sources.doozan];
  const files = wanted.flatMap(({ repo, commit, files: names }) =>
    names.map((file) => ({
      url: `https://raw.githubusercontent.com/${repo}/${commit}/${file}`,
      name: basename(file),
    })),
  );
  await Promise.all(
    files.map(({ url, name }) => download(url, join(dir, name), fetchImpl, progress)),
  );
  return Object.fromEntries(files.map(({ name }) => [name, join(dir, name)]));
}
