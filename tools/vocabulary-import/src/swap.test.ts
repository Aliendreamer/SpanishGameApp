/** @jest-environment node */
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { swapInto } from './swap.ts';

describe('swapInto', () => {
  let work: string;
  let outDir: string;
  let staging: string;
  beforeEach(() => {
    work = mkdtempSync(join(tmpdir(), 'vocab-swap-'));
    outDir = join(work, 'vocabulary');
    staging = mkdtempSync(join(work, '.vocabulary-staging-'));
    mkdirSync(outDir);
    writeFileSync(join(outDir, 'vocabulary.json'), 'old');
    writeFileSync(join(staging, 'vocabulary.json'), 'new');
  });
  afterEach(() => rmSync(work, { recursive: true, force: true }));

  test('replaces the output with the staged files, readable by everyone', () => {
    swapInto(staging, outDir);
    expect(readFileSync(join(outDir, 'vocabulary.json'), 'utf8')).toBe('new');
    expect(statSync(outDir).mode & 0o777).toBe(0o755);
  });

  test('puts the old output back when moving the new one into place fails', () => {
    let calls = 0;
    const failingSecondRename = (from: string, to: string) => {
      calls += 1;
      if (calls === 2) throw new Error('EBUSY');
      renameSync(from, to);
    };
    expect(() => swapInto(staging, outDir, failingSecondRename)).toThrow(/EBUSY/);
    expect(readFileSync(join(outDir, 'vocabulary.json'), 'utf8')).toBe('old');
  });
});
